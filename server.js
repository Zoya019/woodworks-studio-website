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

// API routes
import sendContactEmail from './api/send-contact-email.js';
app.post('/api/send-contact-email', (req, res) => sendContactEmail(req, res));



const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/index.html`);
});