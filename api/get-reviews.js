// api/get-reviews.js
import { readReviews } from "./reviews-db.js";

export default async function handler(req, res) {
  try {
    const reviews = await readReviews(); // ✅ wait for Firestore data
    const verified = reviews.filter((r) => r.status === "verified");
    res.status(200).json(verified);
  } catch (error) {
    console.error("⚠️ Error getting reviews:", error.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}
