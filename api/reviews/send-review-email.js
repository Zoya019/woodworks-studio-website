// api/send-review-email.js
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, token } = req.body;

  if (!name || !email || !token) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const verificationUrl = `${origin}/api/reviews/verify-review?token=${token}`;

  const securePort = Number(process.env.SMTP_PORT) === 465;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const useRealSMTP =
    smtpHost &&
    smtpHost !== "localhost" &&
    smtpHost !== "127.0.0.1" &&
    smtpUser &&
    smtpPass;

  let transporter;
  if (useRealSMTP) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: securePort,
      auth: { user: smtpUser, pass: smtpPass },
    });
  } else {
    console.warn("Using Nodemailer jsonTransport for local testing.");
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  try {
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
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    const text = `Hi ${name},\n\nPlease verify your review:\n${verificationUrl}`;

    await transporter.sendMail({
      from: `"Wood Works Studio" <${smtpUser}>`,
      to: { address: email, name },
      subject: "Verify your review · Wood Works Studio",
      html,
      text,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "..", "..", "images", "logo.png"),
          cid: "logo@woodworksstudio",
        },
      ],
    });

    console.log("✅ Verification email sent to:", email);
    res.status(200).json({ success: true, message: "Verification email sent successfully" });
  } catch (error) {
    console.error("⚠️ Email send error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to send verification email: ${error.message}`,
    });
  }
}
