const { TokenService } = require('../services/tokenService');
const config = require("../shared/config");

class AuthController {
  static async validateToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Token is required'
        });
      }

      const decoded = TokenService.validateToken(token);
      return res.json({
        valid: true,
        user: decoded
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: error.message
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Token is required'
        });
      }

      const newToken = TokenService.refreshToken(token);
      return res.json({
        token: newToken
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: error.message
      });
    }
  }

  static async generateToken(req, res) {
    try {
      const { user } = req.body;
      if (!user || !user._id || !user.email || !user.role) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid user data'
        });
      }

      const token = TokenService.createTokenForUser(user);
      return res.json({ token });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  static async validateServiceToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Service token is required'
        });
      }

      // Validate service token against configured service tokens
      const serviceTokens = [
        config.itemsServiceToken,
        config.ordersServiceToken,
        config.usersServiceToken
      ].filter(Boolean);

      if (!serviceTokens.includes(token)) {
        return res.status(401).json({
          error: 'Invalid Service Token',
          message: 'Service token is not valid'
        });
      }

      return res.json({
        valid: true,
        message: 'Service token is valid'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
