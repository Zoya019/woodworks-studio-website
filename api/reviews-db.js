// api/reviews-db.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'reviews.json');

// ✅ Read reviews safely (returns [] if file missing or unreadable)
function readReviews() {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('⚠️ Could not read reviews.json:', err.message);
  }
  return []; // return empty array if file doesn’t exist or can’t be read
}

// ✅ Write reviews safely (skip if in read-only environment)
function writeReviews(reviews) {
  try {
    fs.writeFileSync(file, JSON.stringify(reviews, null, 2));
  } catch (err) {
    // Vercel’s read-only FS will trigger this
    console.warn('⚠️ Could not write to reviews.json (likely read-only env):', err.message);
  }
}

module.exports = { readReviews, writeReviews };
