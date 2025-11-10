import db from "../firebase.js";

export default async function getReviews(req, res) {
  try {
    const limit = Number(req.query.limit || 20);
    const q = await db
      .collection("reviews")
      .where("verified", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ ok: true, items });
  } catch (err) {
    console.error("getReviews error:", err);
    return res.status(500).json({ ok: false, message: "Could not load reviews." });
  }
}
