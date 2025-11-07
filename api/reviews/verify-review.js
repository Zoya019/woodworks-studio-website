export default async (req, res) => {
  return res.status(200).json({ message: "Review verification is disabled in this version." });
};
