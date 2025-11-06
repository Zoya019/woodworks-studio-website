const { readReviews } = require('./reviews-db');

module.exports = async function handler(req, res) {
  const reviews = readReviews();
  const verified = reviews.filter(r => r.status === 'verified');
  res.status(200).json(verified);
};
