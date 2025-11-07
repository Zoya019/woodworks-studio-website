// api/get-reviews.js
import { readReviews } from "./reviews-db.js";

export default async function handler(req, res) {
  try {
    const reviews = await readReviews(); // ✅ wait for Firestore data
    res.status(200).json(reviews);
  } catch (error) {
    console.error("⚠️ Error getting reviews:", error.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}
