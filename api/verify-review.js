// api/verify-review.js
import { readReviews, writeReviews } from './reviews-db.js';

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Missing token');
  }

  try {
    const reviews = await readReviews(); // ✅ await the async Firestore read
    const reviewIndex = reviews.findIndex(r => r.verificationToken === token);

    if (reviewIndex === -1) {
      return res.status(404).send('Invalid or expired token');
    }

    // Mark review as verified
    reviews[reviewIndex].status = 'verified';
    await writeReviews(reviews); // ✅ await the async Firestore write

    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>✅ Review Verified!</h2>
          <p>Thanks, ${reviews[reviewIndex].name}! Your review has been successfully verified.</p>
          <p><a href="/">Return to website</a></p>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Error verifying review:', err);
    res.status(500).send('Error verifying review');
  }
}
