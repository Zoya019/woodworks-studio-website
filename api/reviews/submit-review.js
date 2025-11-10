import crypto from "crypto";
import db from "../firebase.js";
import { REVIEWS_COLLECTION, logReviewDebug } from "./utils.js";
import sendReviewEmail from "./send-review-email.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

function generateOtp() {
  const buffer = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return buffer.toString().padStart(OTP_LENGTH, "0");
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export default async function submitReview(req, res) {
  logReviewDebug("📩 Incoming review submission", {
    bodyKeys: Object.keys(req.body || {}),
    ip: req.ip,
  });

  try {
    const { name, email, rating, review, consent } = req.body ?? {};

    if (!name || !email || !rating || !consent) {
      logReviewDebug("❌ Validation failed", { name, email, rating, consent });
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({ ok: false, message: "Rating must be between 1 and 5." });
    }

    const sanitizedEmail = String(email).trim().toLowerCase();
    const now = new Date();
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    logReviewDebug("📝 Attempting Firestore write", {
      collection: REVIEWS_COLLECTION,
      email: sanitizedEmail,
    });
    const docRef = await db.collection(REVIEWS_COLLECTION).add({
      name: name.trim(),
      email: sanitizedEmail,
      rating: numericRating,
      review: review?.trim() ?? "",
      verified: false,
      createdAt: now,
      updatedAt: now,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      maxOtpAttempts: MAX_ATTEMPTS,
    });

    logReviewDebug("✅ Firestore write successful", { reviewId: docRef.id });

    try {
      logReviewDebug("📧 Sending OTP email", { reviewId: docRef.id });
      await sendReviewEmail({ email: sanitizedEmail, otp });
      logReviewDebug("✅ OTP email sent", { reviewId: docRef.id });
    } catch (emailErr) {
      console.error("🔥 [submit-review] Failed to send OTP email:", emailErr);
      // Best effort cleanup so we do not leave dangling reviews
      try {
        await db.collection(REVIEWS_COLLECTION).doc(docRef.id).delete();
      } catch (cleanupErr) {
        console.error("⚠️ [submit-review] Cleanup failed:", cleanupErr);
      }
      return res.status(502).json({
        ok: false,
        message: "Could not send verification email. Please try again later.",
      });
    }

    return res.json({
      ok: true,
      message: "OTP sent to your email address.",
      reviewId: docRef.id,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      maxAttempts: MAX_ATTEMPTS,
    });
  } catch (error) {
    console.error("🔥 SERVER ERROR inside submit-review:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: error.toString() });
  }
}
