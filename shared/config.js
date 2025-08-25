

module.exports = {
  port: process.env.PORT || 4000,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'auth_token',
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  redisUrl: process.env.REDIS_URL,
  
  // Service tokens
  itemsServiceToken: process.env.ITEMS_SERVICE_TOKEN,
  ordersServiceToken: process.env.ORDERS_SERVICE_TOKEN,
  usersServiceToken: process.env.USERS_SERVICE_TOKEN,
};
