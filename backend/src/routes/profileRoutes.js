const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', profileController.getProfile);

// Get verification status
router.get('/verification-status', profileController.getVerificationStatus);

// Update current user profile
router.patch('/profile', profileController.updateProfile);

// Change password
router.post('/change-password', profileController.changePassword);

// Delete account
router.delete('/account', profileController.deleteAccount);

module.exports = router;
