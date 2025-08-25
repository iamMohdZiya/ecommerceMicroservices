const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected route to get user profile
router.get('/me', protect, userController.getUserProfile);

module.exports = router;