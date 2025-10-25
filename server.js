const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// API routes
const sendContactEmail = require('./api/send-contact-email.js');
app.post('/api/send-contact-email', (req, res) => sendContactEmail(req, res));

let sendReviewEmail = null;
try {
  sendReviewEmail = require('./api/send-review-email.js');
} catch (e) {
  // optional route; ignore if missing
}

if (sendReviewEmail) {
  app.post('/api/send-review-email', (req, res) => sendReviewEmail(req, res));
}

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/index.html`);
});