import { findReviewByToken, updateReview } from '../reviews-db.js';

export default async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is missing' });
  }

  try {
    const review = await findReviewByToken(token);

    if (!review) {
      return res.status(404).json({ message: 'Invalid or expired verification link' });
    }

    if (review.status === 'verified') {
      return res.status(200).json(review);
    }

    const updatedReview = await updateReview(review.id, { status: 'verified' });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error verifying review:', error);
    res.status(500).json({ message: 'An error occurred during verification' });
  }
};
