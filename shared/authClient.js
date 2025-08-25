const axios = require('axios');

class AuthClient {
  constructor(config) {
    const baseUrl = config.authServiceUrl || 'http://auth_service:4000';
    this.baseURL = `${baseUrl.replace(/\/+$/, '')}/api/auth`;
    this.serviceToken = config.serviceToken;
  }

  async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }
      const response = await axios.post(`${this.baseURL}/validate`, { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token validation failed');
    }
  }

  async refreshToken(token) {
    try {
      const response = await axios.post(`${this.baseURL}/refresh`, { token });
      return response.data.token;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async generateToken(userData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generate`,
        { user: userData },
        {
          headers: { 'Authorization': `Bearer ${this.serviceToken}` }
        }
      );
      return response.data.token;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token generation failed');
    }
  }

  middleware(options = {}) {
    const {
      roles = [],
      useCookie = false,
      cookieName = 'auth_token'
    } = options;

    return async (req, res, next) => {
      try {
        // Get token from either cookie or header
        const token = useCookie
          ? req.cookies[cookieName]
          : req.headers.authorization?.split(' ')[1];

        if (!token) {
          return res.status(401).json({
            error: 'Authentication required',
            message: 'No token provided'
          });
        }

        // Validate token with auth service
        const validation = await this.validateToken(token);
        
        if (!validation.valid) {
          if (useCookie) {
            res.clearCookie(cookieName);
          }
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid token'
          });
        }

        // Check roles if specified
        if (roles.length > 0) {
          const userRole = validation.user.role?.toLowerCase();
          const hasValidRole = roles
            .map(role => role.toLowerCase())
            .includes(userRole);

          if (!hasValidRole) {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'Insufficient permissions'
            });
          }
        }

        // Attach user to request
        req.user = validation.user;
        next();
      } catch (error) {
        if (useCookie) {
          res.clearCookie(cookieName);
        }
        return res.status(401).json({
          error: 'Authentication failed',
          message: error.message
        });
      }
    };
  }
}

module.exports = AuthClient;
