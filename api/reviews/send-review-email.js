import nodemailer from "nodemailer";

console.log("📧 [send-review-email] SMTP Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "***HIDDEN***" : "❌ MISSING",
  from: process.env.FROM_EMAIL || process.env.SMTP_USER,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendReviewEmail({ email, otp }) {
  try {
    console.log("📨 [send-review-email] Preparing OTP email...");
    console.log("📩 Email To:", email);

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

    console.log("🔢 OTP:", otp);
    console.log("📤 Sending email...");

    const result = await transporter.sendMail({
      from,
      to: email,
      subject: "Your Wood Works Studio review verification code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2>Verify your review</h2>
          <p>Thanks for sharing your experience with <strong>Wood Works Studio</strong>!</p>
          <p>Use the following one-time password (OTP) to verify your email address. The code is valid for 5 minutes.</p>
          <p style="font-size:24px;letter-spacing:6px;font-weight:bold;color:#3a2618;">${otp}</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <hr/>
          <p style="color:#777;font-size:12px">Wood Works Studio • Mumbai • +91 9769384741</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("🔥 [send-review-email] EMAIL ERROR:");
    console.error(error);
    throw error;
  }
}
