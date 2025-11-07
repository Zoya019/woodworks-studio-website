import { db } from "../../../firebaseConfig.js";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const q = query(collection(db, "reviews"), where("verificationToken", "==", token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Invalid token" });
    }

    const reviewRef = querySnapshot.docs[0].ref;
    await updateDoc(reviewRef, { status: "verified" });

    return res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 40px;">
          <h2>✅ Review Verified Successfully!</h2>
          <p>Thank you for verifying your review. It will now appear on our website.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error verifying review:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
