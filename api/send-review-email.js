// CommonJS version, works on Vercel
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    console.log('send-review-email handler called'); // <-- log at start

    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { name, email, reviewText, rating } = req.body;

    if (!name || !email || !reviewText) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Log the incoming review data
    console.log('Received review data:', { name, email, reviewText, rating });

    // Generate a simple verification token
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Construct verification URL
    const origin = process.env.VERCEL_URL 
                   ? `https://${process.env.VERCEL_URL}` 
                   : 'http://localhost:3000';
    const verificationUrl = `${origin}/verify-review.html?token=${token}`;

    // --- SMTP Logging & Transporter Setup ---
    console.log('SMTP Env variables:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
    });

    const securePort = Number(process.env.SMTP_PORT) === 465;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: securePort, // true for 465 (SSL), false for 587 (TLS)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // --- Sending Email ---
    console.log('Attempting to send email to:', email);
    console.log('Verification URL:', verificationUrl);

    try {
        await transporter.sendMail({
            from: `"Wood Works Studio" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Review',
            html: `
                <p>Hi ${name},</p>
                <p>Click the link below to verify your review:</p>
                <a href="${verificationUrl}">Verify Review</a>
            `
        });

        console.log('Email sent successfully to:', email);
        res.status(200).json({ success: true, token });

    } catch (error) {
        console.error('Email send error:', error);

        // More detailed error message for debugging
        const errorMsg = error.response || error.message || error.toString();
        res.status(500).json({ success: false, message: `Failed to send email: ${errorMsg}` });
    }
};
