import express from 'express';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// ✅ Contact Form Route (existing)
import sendContactEmail from './api/send-contact-email.js';
app.post('/api/send-contact-email', (req, res) => sendContactEmail(req, res));

/* ✅ ✅ ✅ ADDED REVIEW API BELOW ✅ ✅ ✅ */

// Review system handlers
import submitReview from './api/reviews/submit-review.js';
import verifyReview from './api/reviews/verify-review.js';
import getReviews from './api/reviews/get-reviews.js';

// Submit a new review (sends email with token)
app.post('/api/reviews/submit', (req, res) => submitReview(req, res));

// Verify review from email link
app.get('/api/reviews/verify', (req, res) => verifyReview(req, res));

// Load verified reviews for the website
app.get('/api/reviews/list', (req, res) => getReviews(req, res));

/* ✅ ✅ ✅ END OF REVIEW API ✅ ✅ ✅ */

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/index.html`);
});