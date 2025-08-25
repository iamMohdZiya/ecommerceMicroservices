const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/validate', AuthController.validateToken);
router.post('/refresh', AuthController.refreshToken);

// Service token validation route
router.post('/validate-service', AuthController.validateServiceToken);

// Protected routes (only services with valid service tokens can access)
router.post('/generate', authenticate({ isServiceAuth: true }), AuthController.generateToken);

module.exports = router;
