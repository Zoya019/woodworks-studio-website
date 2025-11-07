import { verifyReview } from "./reviews-api.js"; // path to your actual functions file

export default async function handler(req, res) {
  return verifyReview(req, res);
}

