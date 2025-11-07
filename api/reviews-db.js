// api/reviews-db.js
import db from "./firebase.js";

/**
 * Create a new review
 * @param {Object} reviewData - { name, reviewText, rating }
 * @returns {string} - Firestore document ID
 */
export async function createReview(reviewData) {
  try {
    const docRef = await db.collection("reviews").add({
      ...reviewData,
      status: "visible", // instantly visible, no verification needed
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Review saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("⚠️ Error saving review:", err.message);
    throw err;
  }
}

/**
 * Update an existing review by Firestore document ID
 * @param {string} id - Review document ID
 * @param {Object} updatedData - Data to update
 */
export async function updateReview(id, updatedData) {
  try {
    await db.collection("reviews").doc(id).update({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Review updated:", id);
  } catch (err) {
    console.error("⚠️ Error updating review:", err.message);
    throw err;
  }
}

/**
 * Get all reviews (only visible ones)
 * @returns {Array} - Array of review objects
 */
export async function readReviews() {
  try {
    const snapshot = await db
      .collection("reviews")
      .where("status", "==", "visible")
      .get();

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Loaded ${reviews.length} reviews`);
    return reviews;
  } catch (err) {
    console.error("⚠️ Error reading reviews:", err.message);
    throw err;
  }
}
