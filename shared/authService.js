const axios = require('axios');
const config = require('./config');

class AuthService {
  constructor() {
    this.baseURL = config.authServiceUrl || 'http://auth_service:4000/api/auth';
  }

  // User authentication
  async authenticate(token, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/validate`, { 
        token,
        ...options
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Authentication failed');
    }
  }

  // Create authentication middleware
  createAuthMiddleware(options = {}) {
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
            status: 'error',
            message: 'No authentication token provided'
          });
        }

        // Validate with auth service
        const authResult = await this.authenticate(token, { roles });
        
        if (!authResult.valid) {
          if (useCookie) {
            res.clearCookie(cookieName);
          }
          return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
          });
        }

        // Attach user to request
        req.user = authResult.user;
        next();
      } catch (error) {
        if (useCookie) {
          res.clearCookie(cookieName);
        }
        return res.status(401).json({
          status: 'error',
          message: error.message
        });
      }
    };
  }

  // Service-to-service authentication
  async validateServiceToken(serviceToken) {
    try {
      const response = await axios.post(`${this.baseURL}/validate-service`, {
        token: serviceToken
      });
      return response.data.valid;
    } catch (error) {
      throw new Error('Service authentication failed');
    }
  }
}

// Create middleware helpers
const createAuthMiddleware = (options) => {
  const authService = new AuthService();
  return authService.createAuthMiddleware(options);
};

const requireAuth = createAuthMiddleware();
const requireAdmin = createAuthMiddleware({ roles: ['admin'] });
const requireRole = (role) => createAuthMiddleware({ roles: [role] });

module.exports = {
  AuthService,
  createAuthMiddleware,
  requireAuth,
  requireAdmin,
  requireRole
};
