import db from "../firebase.js";
import sendReviewEmail from "./send-review-email.js";
import crypto from "crypto";

export default async function submitReview(req, res) {
  console.log("📩 [submit-review] Incoming request body:", req.body);

  try {
    const { name, email, rating, review, consent } = req.body;

    // Validate
    if (!name || !email || !rating || !consent) {
      console.log("❌ [submit-review] Validation failed:", {
        name,
        email,
        rating,
        consent,
      });
      return res
        .status(400)
        .json({ ok: false, message: "Missing required fields" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    console.log("✅ [submit-review] Generated token:", token);

    console.log("📝 [submit-review] Attempting Firestore write...");
    const docRef = await db.collection("reviews").add({
      name,
      email,
      rating: Number(rating),
      review,
      verified: false,
      token,
      createdAt: new Date(),
    });

    console.log("✅ [submit-review] Firestore write successful:", docRef.id);

    console.log("📧 [submit-review] Sending verification email...");
    await sendReviewEmail(email, token);

    console.log("✅ [submit-review] Email sent successfully");

    return res.json({ ok: true, message: "Review pending verification" });
  } catch (error) {
    console.error("🔥 SERVER ERROR inside submit-review:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: error.toString() });
  }
}
