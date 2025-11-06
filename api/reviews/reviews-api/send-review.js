import sendReviewEmail from "../../send-review-email.js";

export default async function handler(req, res) {
  return sendReviewEmail(req, res);
}
