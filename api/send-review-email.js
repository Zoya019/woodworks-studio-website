// CommonJS version, works on Vercel
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { name, email, reviewText, rating } = req.body;

    if (!name || !email || !reviewText) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Generate a simple verification token
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Construct verification URL
    const origin = process.env.VERCEL_URL 
                   ? `https://${process.env.VERCEL_URL}` 
                   : 'http://localhost:3000';
    const verificationUrl = `${origin}/verify-review.html?token=${token}`;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        console.log('Sending email to:', email);
        console.log('Verification URL:', verificationUrl);

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

        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};
