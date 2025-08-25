const jwt = require('jsonwebtoken');
const config = require("../shared/config");

class TokenService {
  static createToken(payload, options = {}) {
    const { expiresIn = '1h' } = options;
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
  }

  static createTokenForUser(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    return this.createToken(payload);
  }

  static validateToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid Token');
    }
  }

  static refreshToken(token) {
    try {
      const decoded = this.validateToken(token);
      // Remove timing fields before creating new token
      delete decoded.iat;
      delete decoded.exp;
      return this.createToken(decoded);
    } catch (error) {
      throw new Error('Invalid Token for Refresh');
    }
  }
}

module.exports = { TokenService };
