import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendReviewVerificationEmail({ to, name, link }) {
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const subject = "Verify your review • Wood Works Studio";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2>Hi ${name ? name.split(' ')[0] : "there"},</h2>
      <p>Thanks for sharing your experience with <b>Wood Works Studio</b>! Please verify your email to publish your review.</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="background:#3a2618;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">
          Verify my email & publish review
        </a>
      </p>
      <p>If the button doesn’t work, paste this link in your browser:</p>
      <p style="word-break:break-all;color:#555">${link}</p>
      <hr/>
      <p style="color:#777;font-size:12px">If you didn’t submit a review, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({ from, to, subject, html });
}
