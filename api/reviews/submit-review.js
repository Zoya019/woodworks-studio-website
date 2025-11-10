import crypto from "crypto";
import db from "../firebase.js";
import sendReviewVerificationEmail from "./send-review-email.js";

export default async function submitReview(req, res) {
  try {
    const { name, email, rating, review } = req.body;

    if (!name || !email || !rating) {
      return res.status(400).json({ ok: false, message: "Name, email and rating are required." });
    }

    const stars = Math.max(1, Math.min(5, Number(rating)));
    const token = crypto.randomBytes(32).toString("hex");

    const docRef = await db.collection("reviews").add({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      rating: stars,
      review: (review || "").trim(),
      verified: false,
      token,
      createdAt: new Date(),
    });

    const site = process.env.SITE_URL || "http://127.0.0.1:8000";
    const verifyLink = `${site}/verify-review.html?token=${token}`;

    await sendReviewVerificationEmail({ to: email, name, link: verifyLink });

    return res.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error("submitReview error:", err);
    return res.status(500).json({ ok: false, message: "Failed to submit review." });
  }
}
