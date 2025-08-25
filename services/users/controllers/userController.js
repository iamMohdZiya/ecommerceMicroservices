const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');


const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = {
  getUserProfile,
};