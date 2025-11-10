import db from "../firebase.js";

export default async function verifyReview(req, res) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ ok: false, message: "Missing token." });

    const snap = await db.collection("reviews").where("token", "==", token).limit(1).get();
    if (snap.empty) return res.status(404).json({ ok: false, message: "Invalid or expired token." });

    const doc = snap.docs[0];
    const data = doc.data();
    if (data.verified) return res.json({ ok: true, message: "Already verified." });

    await doc.ref.update({ verified: true, token: null, verifiedAt: new Date() });

    return res.json({ ok: true, message: "Review verified and published." });
  } catch (err) {
    console.error("verifyReview error:", err);
    return res.status(500).json({ ok: false, message: "Verification failed." });
  }
}
