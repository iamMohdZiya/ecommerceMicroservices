module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  res.status(500).json({ message: "Internal Server Error" });
};
