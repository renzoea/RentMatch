const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const searchProfileController = require('../controllers/searchProfileController');

router.post('/search-profile', authenticateToken, authorizeTenant, searchProfileController.createSearchProfile);

module.exports = router;