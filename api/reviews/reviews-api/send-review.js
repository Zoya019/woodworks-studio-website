import sendReviewEmail from "./reviews-api.js"; // adjust path if needed

export default async function handler(req, res) {
  return sendReviewEmail(req, res);
}
