const { readReviews, writeReviews } = require('./reviews-db');

module.exports = async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Missing token');
  }

  const reviews = readReviews();
  const review = reviews.find(r => r.verificationToken === token);

  if (!review) {
    return res.status(404).send('Invalid or expired token');
  }

  review.status = 'verified';
  writeReviews(reviews);

  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html>
      <body style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h2>✅ Review Verified!</h2>
        <p>Thanks, ${review.name}! Your review has been successfully verified.</p>
        <p><a href="/">Return to website</a></p>
      </body>
    </html>
  `);
};
