// api/reviews/submit-review.js
import { createReview } from "../reviews-db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, reviewText, rating } = req.body;

  if (!name || !email || !reviewText) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  try {
    const reviewId = await createReview({
      name,
      email,
      reviewText,
      rating: rating || null,
      status: "pending",
      verificationToken: token,
      submittedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, reviewId, token });
  } catch (error) {
    console.error("⚠️ Error creating review:", error.message);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
}