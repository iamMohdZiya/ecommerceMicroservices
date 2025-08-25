const jwt = require('jsonwebtoken');
const config = require("../shared/config");


const validateAuthToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid Token');
  }
};

const validateServiceToken = (token) => {
  const serviceTokens = [
    config.itemsServiceToken,
    config.ordersServiceToken,
    config.usersServiceToken
  ].filter(Boolean);
  
  if (!serviceTokens.includes(token)) {
    throw new Error('Invalid Service Token');
  }
  
  return { role: 'service' };
};

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
};

const getTokenFromCookie = (req, cookieName = 'auth_token') => {
  return req.cookies[cookieName];
};

const authenticate = (options = {}) => {
  const { 
    roles = [], 
    useCookie = false, 
    cookieName = 'auth_token',
    isServiceAuth = false
  } = options;

  return async (req, res, next) => {
    try {
      // Get token from either cookie or header
      const token = useCookie 
        ? getTokenFromCookie(req, cookieName)
        : getTokenFromHeader(req);

      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      let decoded;
      
      // For service authentication, validate service token
      if (isServiceAuth) {
        decoded = validateServiceToken(token);
      } else {
        // For user authentication, validate JWT token
        decoded = validateAuthToken(token);
      }
      
      // Check role if required
      if (roles.length > 0) {
        const userRole = decoded.role?.toLowerCase();
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

      // Attach user/service info to request
      req.user = decoded;
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
};

module.exports = {
  authenticate,
  validateAuthToken,
  validateServiceToken,
  getTokenFromHeader,
  getTokenFromCookie
};
