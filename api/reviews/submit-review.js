// api/reviews/submit-review.js
import { createReview } from "../reviews-db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, reviewText, rating } = req.body;

  if (!name || !reviewText) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }


  try {
    // Directly write review to Firestore here
    const reviewId = await createReview({
      name,
      reviewText,
      rating: rating || null,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
    res.status(201).json({ success: true, reviewId });
  } catch (error) {
    console.error("⚠️ Error creating review:", error.message);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
}