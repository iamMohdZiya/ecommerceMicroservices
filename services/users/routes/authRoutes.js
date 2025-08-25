const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post(
  '/register',authController.handleSignUp
);

// Login route
router.post(
  '/login',
  authController.handleSignIn
);

module.exports = router;