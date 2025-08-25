function validateItem(req, res, next) {
  const { name, qty, rate } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required and must be a non-empty string" });
  }
  if (qty == null || typeof qty !== "number" || qty < 0) {
    return res.status(400).json({ message: "qty is required and must be a number >= 0" });
  }
  if (rate == null || typeof rate !== "number" || rate < 0) {
    return res.status(400).json({ message: "rate is required and must be a number >= 0" });
  }
  next();
}
module.exports = validateItem ;
