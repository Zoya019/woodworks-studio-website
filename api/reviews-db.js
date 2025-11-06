// api/reviews-db.js
import db from "./firebase.js";

/**
 * ✅ Get all reviews from Firestore (Admin SDK)
 */
export async function readReviews() {
  try {
    const snapshot = await db.collection("reviews").get();
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return reviews;
  } catch (error) {
    console.error("⚠️ Error reading reviews:", error.message);
    throw new Error("Failed to fetch reviews from Firestore");
  }
}

/**
 * ✅ Save a new review to Firestore (Admin SDK)
 */
export async function writeReviews(reviewData) {
  try {
    await db.collection("reviews").add({
      ...reviewData,
      createdAt: new Date().toISOString(), // optional timestamp
    });
    console.log("✅ Review saved successfully to Firestore");
    return { success: true };
  } catch (error) {
    console.error("⚠️ Error saving review:", error.message);
    throw new Error("Failed to save review to Firestore");
  }
}
