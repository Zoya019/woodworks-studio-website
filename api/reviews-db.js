// api/reviews-db.js
import db from "./firebase.js";

/**
 * Create a new review
 * @param {Object} reviewData - { name, email, reviewText, rating, status, verificationToken, submittedAt }
 * @returns {string} - Firestore document ID
 */
export async function createReview(reviewData) {
  try {
    const docRef = await db.collection("reviews").add({
      ...reviewData,
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
 * Update existing review by Firestore document ID
 * @param {string} docId 
 * @param {Object} updateData 
 */
export async function updateReview(docId, updateData) {
  try {
    await db.collection("reviews").doc(docId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Review updated:", docId);
  } catch (err) {
    console.error("⚠️ Error updating review:", err.message);
    throw err;
  }
}

/**
 * Get all reviews
 * @returns {Array} - Array of review objects
 */
export async function readReviews() {
  try {
    const snapshot = await db.collection("reviews").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("⚠️ Error reading reviews:", err.message);
    throw err;
  }
}

/**
 * Find a review by verification token
 * @param {string} token 
 * @returns {Object|null} - Review object or null if not found
 */
export async function findReviewByToken(token) {
  try {
    const snapshot = await db.collection("reviews")
      .where("verificationToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("⚠️ Error finding review by token:", err.message);
    throw err;
  }
}
