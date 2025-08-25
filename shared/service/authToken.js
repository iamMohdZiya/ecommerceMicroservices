const jwt = require('jsonwebtoken');
const config = require('../config');

const createTokenForUser = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error('Invalid Token');
  }
};

module.exports = {
  createTokenForUser,
  validateToken
};
