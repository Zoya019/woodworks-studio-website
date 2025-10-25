import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { name, email, reviewText, rating } = req.body;

  // Generate a verification token
  const token = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

  // Construct verification URL
  const origin = process.env.VERCEL_URL 
                 ? `https://${process.env.VERCEL_URL}` 
                 : 'http://localhost:3000';
  const verificationUrl = `${origin}/verify-review.html?token=${token}`;

  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

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

    // Optionally, store review + token in a DB
    // For now, you can keep it in memory or localStorage on frontend

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}
