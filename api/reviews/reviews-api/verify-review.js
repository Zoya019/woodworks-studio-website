import { verifyReview } from "../../verify-review.js"; // adjust path if needed

export default async function handler(req, res) {
  return verifyReview(req, res);
}
