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

    // Build transporter with safe local fallback
    let transporter;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const useRealSMTP = smtpHost && smtpHost !== 'localhost' && smtpHost !== '127.0.0.1' && smtpUser && smtpPass;

    if (useRealSMTP) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: securePort,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    } else {
        console.warn('SMTP env not set or pointing to localhost; using Nodemailer jsonTransport for local testing only.');
        transporter = nodemailer.createTransport({ jsonTransport: true });
    }

    // --- Sending Email ---
    console.log('Attempting to send email to:', email);
    console.log('Verification URL:', verificationUrl);

    try {
        // Build branded HTML with inline logo
        const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:Arial,Helvetica,sans-serif;color:#2e2e2e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f2;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e6dfd7;border-radius:8px;overflow:hidden;margin:24px 0;">
          <tr>
            <td style="background:#3a2618;padding:20px 24px;" align="left">
              <img src="cid:logo@woodworksstudio" alt="Wood Works Studio" width="120" style="display:block;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 12px 0;font-size:16px;">Hi ${name},</p>
              <p style="margin:0 0 16px 0;font-size:16px;">Thanks for sharing your experience with Wood Works Studio.</p>
              <p style="margin:0 0 16px 0;font-size:16px;">Please verify your review to help us keep reviews trustworthy:</p>
              <p style="margin:0 0 28px 0;">
                <a href="${verificationUrl}" style="background:#8b5a2b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;display:inline-block;">Verify Review</a>
              </p>
              <p style="margin:0 0 8px 0;font-size:14px;color:#666;">If the button doesn’t work, copy and paste this link:</p>
              <p style="word-break:break-all;font-size:12px;color:#666;">${verificationUrl}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
              <p style="font-size:12px;color:#888;">You received this email because a review was submitted using this address. If this wasn’t you, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f7f3ee;padding:16px 24px;color:#6b6b6b;font-size:12px;">
              Wood Works Studio · Mumbai, India · Instagram: @wood_workscrafts_studio
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

        const text = `Hi ${name},\n\nPlease verify your review for Wood Works Studio:\n${verificationUrl}\n\nIf you didn’t request this, you can ignore this email.`;

        await transporter.sendMail({
            from: `"Wood Works Studio" <${smtpUser || process.env.SMTP_USER}>`,
            to: { address: email, name },
            subject: 'Verify your review · Wood Works Studio',
            html,
            text,
            headers: {
              'X-Company': 'Wood Works Studio',
              'X-Entity-Ref-ID': token,
              'List-Unsubscribe': '<mailto:woodworksstudiocrafts@gmail.com?subject=unsubscribe>'
            },
            attachments: [
              {
                filename: 'logo.png',
                path: require('path').join(__dirname, '..', 'images', 'logo.png'),
                cid: 'logo@woodworksstudio'
              }
            ],
            priority: 'high'
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
