import verifyReview from "./reviews-api/verify-review.js";

export default async function handler(req, res) {
  return verifyReview(req, res);
}
