// api/reviews-api.js
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import db from "./firebase.js";

// --- For __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** --------------------------
 *  Firestore Review Functions
 * ------------------------- */
export async function createReview(reviewData) {
  try {
    const docRef = await db.collection("reviews").add({
      ...reviewData,
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Review saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("⚠️ Error saving review:", err.message);
    throw err;
  }
}

export async function updateReview(docId, updateData) {
  try {
    await db.collection("reviews").doc(docId).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Review updated:", docId);
  } catch (err) {
    console.error("⚠️ Error updating review:", err.message);
    throw err;
  }
}

export async function readReviews() {
  try {
    const snapshot = await db.collection("reviews").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("⚠️ Error reading reviews:", err.message);
    throw err;
  }
}

export async function findReviewByToken(token) {
  try {
    const snapshot = await db
      .collection("reviews")
      .where("verificationToken", "==", token)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("⚠️ Error finding review by token:", err.message);
    throw err;
  }
}

/** --------------------------
 *  Send Review Email Handler
 * ------------------------- */
export async function sendReviewEmail(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { name, email, reviewText, rating } = req.body;
  if (!name || !email || !reviewText)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  let reviewId;
  try {
    reviewId = await createReview({
      name,
      email,
      reviewText,
      rating,
      status: "pending",
      verificationToken: token,
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to save review" });
  }

  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const verificationUrl = `${origin}/api/reviews-api/verify-review?token=${token}`;

  const securePort = Number(process.env.SMTP_PORT) === 465;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const useRealSMTP =
    smtpHost && smtpHost !== "localhost" && smtpHost !== "127.0.0.1" && smtpUser && smtpPass;

  let transporter;
  if (useRealSMTP) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: securePort,
      auth: { user: smtpUser, pass: smtpPass },
    });
  } else {
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
                    <p style="margin:0 0 16px 0;font-size:16px;">Please verify your review:</p>
                    <p style="margin:0 0 28px 0;">
                      <a href="${verificationUrl}" style="background:#8b5a2b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;display:inline-block;">Verify Review</a>
                    </p>
                    <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Or copy/paste this link:</p>
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
          path: path.join(__dirname, "..", "images", "logo.png"),
          cid: "logo@woodworksstudio",
        },
      ],
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
  }
}

/** --------------------------
 *  Verify Review Handler
 * ------------------------- */
export async function verifyReview(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const review = await findReviewByToken(token);
    if (!review) return res.status(404).send("Invalid or expired token");

    await updateReview(review.id, { status: "verified" });

    res.setHeader("Content-Type", "text/html");
    res.end(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>✅ Review Verified!</h2>
          <p>Thanks, ${review.name}! Your review has been successfully verified.</p>
          <p><a href="/">Return to website</a></p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error verifying review");
  }
}
