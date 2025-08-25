const User = require('../models/User');

// Fetch user profile by user ID
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -salt');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
  getUserProfile,
};