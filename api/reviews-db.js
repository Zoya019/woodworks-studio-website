// /api/reviews-db.js
const fs = require('fs');
const path = require('path');

// Database file in the same directory as this script
const dbPath = path.join(__dirname, 'reviews.json');

// Ensure the file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

function readReviews() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeReviews(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readReviews, writeReviews };
