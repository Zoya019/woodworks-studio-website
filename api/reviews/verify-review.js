import crypto from "crypto";
import db from "../firebase.js";
import { REVIEWS_COLLECTION, logReviewDebug } from "./utils.js";

const MAX_ATTEMPTS = 3;

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
}

export default async function verifyReview(req, res) {
  try {
    const { reviewId, otp } = req.body ?? {};

    if (!reviewId || !otp) {
      return res
        .status(400)
        .json({ ok: false, message: "Review ID and OTP are required." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res
        .status(400)
        .json({ ok: false, message: "OTP must be a 6-digit code." });
    }

    const docRef = db.collection(REVIEWS_COLLECTION).doc(String(reviewId));
    const snapshot = await docRef.get();

    if (!snapshot || !snapshot.exists) {
      logReviewDebug("⚠️ Review not found for OTP verification", { reviewId });
      return res
        .status(404)
        .json({ ok: false, message: "Review request not found." });
    }

    const data = snapshot.data();
    const attempts = data?.otpAttempts ?? 0;
    const maxAttempts = data?.maxOtpAttempts ?? MAX_ATTEMPTS;

    if (data?.verified) {
      logReviewDebug("ℹ️ Review already verified", { reviewId });
      return res.json({ ok: true, message: "Review already verified." });
    }

    if (attempts >= maxAttempts) {
      logReviewDebug("🚫 OTP attempts exceeded", { reviewId, attempts });
      return res.status(429).json({
        ok: false,
        message: "Maximum OTP attempts exceeded. Please start again.",
      });
    }

    const expiresAt = normalizeDate(data?.otpExpiresAt);
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      await docRef.update({
        otpAttempts: attempts + 1,
        updatedAt: new Date(),
      });
      logReviewDebug("⌛ OTP expired", { reviewId });
      return res.status(410).json({
        ok: false,
        message: "OTP expired. Please request a new review submission.",
        attemptsLeft: Math.max(0, maxAttempts - (attempts + 1)),
      });
    }

    const providedHash = hashOtp(otp);
    if (providedHash !== data?.otpHash) {
      const updatedAttempts = attempts + 1;
      await docRef.update({
        otpAttempts: updatedAttempts,
        updatedAt: new Date(),
      });
      logReviewDebug("❌ Incorrect OTP", {
        reviewId,
        attempts: updatedAttempts,
      });
      return res.status(400).json({
        ok: false,
        message: "Incorrect OTP.",
        attemptsLeft: Math.max(0, maxAttempts - updatedAttempts),
      });
    }

    await docRef.update({
      verified: true,
      verifiedAt: new Date(),
      otpHash: null,
      otpExpiresAt: null,
      otpAttempts: attempts + 1,
      updatedAt: new Date(),
    });

    logReviewDebug("✅ Review verified", { reviewId });

    return res.json({
      ok: true,
      message: "Review verified and published.",
    });
  } catch (err) {
    console.error("verifyReview error:", err);
    return res.status(500).json({ ok: false, message: "Verification failed." });
  }
}
