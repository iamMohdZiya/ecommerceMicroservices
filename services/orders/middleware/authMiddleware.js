const AuthClient = require('../shared/authClient');
const config = require('../shared/config');

const authClient = new AuthClient(config);

const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Validate token using auth service
    const validation = await authClient.validateToken(token);
    
    if (!validation.valid) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = validation.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token validation failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, adminOnly };