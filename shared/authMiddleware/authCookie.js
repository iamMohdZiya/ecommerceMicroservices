// const { validateToken } = require('../service/authToken');


// function checkForAuthenticationCookie(cookieName, validRoles = []) {
//   return async (req, res, next) => {
//     const tokenCookieValue = req.cookies[cookieName];
//     if (!tokenCookieValue) {
//       console.log('No token cookie found');
//       return res.status(401).send('Authentication required');
//     }
//     try {
//       const userPayload = await validateToken(tokenCookieValue);
//       if (!userPayload) {
//         console.error('No user payload returned from validateToken');
//         res.clearCookie(cookieName);
//         return res.status(401).send('Invalid token');
//       }

//       // Normalize role for case-insensitive comparison
//       const userRole = userPayload.role?.toLowerCase();
//       const normalizedValidRoles = validRoles.map(role => role.toLowerCase());

//       if (validRoles.length > 0 && !normalizedValidRoles.includes(userRole)) {
//         console.error(`Invalid role: ${userPayload.role}`);
//         res.clearCookie(cookieName);
//         return res.status(403).send('Forbidden: Invalid role');
//       }

//       req.user = userPayload;
//       console.log(`Authenticated user: ${userPayload._id} (${userPayload.role})`);
//       next();
//     } catch (error) {
//       console.error('Authentication error:', error.message);
//       res.clearCookie(cookieName);
//       return res.status(401).json({ message: 'Invalid or expired token' });
//     }
//   };
// }
// module.exports = {
//   checkForAuthenticationCookie,
//   validateToken
// };