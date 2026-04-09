const express = require('express');
const authController = require('../../controllers/client/auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/social-login', authController.socialLogin);
router.post('/logout', authController.logout);

router.put('/complete-profile', authMiddleware, authController.completeProfile); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;