// api/reviews-db.js
import db from "./firebase.js";

/**
 * ✅ Get all reviews from Firestore
 */
export async function readReviews() {
  try {
    const snapshot = await db.collection("reviews").get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return reviews;
  } catch (error) {
    console.error("⚠️ Error reading reviews:", error);
    return [];
  }
}

/**
 * ✅ Save a new review to Firestore
 */
export async function writeReviews(reviewData) {
  try {
    await db.collection("reviews").add(reviewData);
    console.log("✅ Review saved successfully to Firestore");
  } catch (error) {
    console.error("⚠️ Error saving review:", error);
  }
}
