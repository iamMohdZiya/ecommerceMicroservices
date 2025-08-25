const AuthClient = require("../shared/authClient");
const config = require("../shared/config");

const authClient = new AuthClient(config);

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Validate token using auth service
    const validation = await authClient.validateToken(token);
    
    if (!validation.valid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // expected payload: { id: userId, role: "admin" | "user" }
    req.user = validation.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: "Token validation failed" });
  }
};
