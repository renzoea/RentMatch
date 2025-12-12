const express = require('express');
const router = express.Router();

const { EndState, upload, GetAllStatusEnd } = require('../controllers/MobileEndController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');

// POST /api/mobile-reporter/incidents
router.post('/endstate', upload.array('images',10), authenticateToken, authorizeTenant, EndState);
router.get('/endstate', authenticateToken, authorizeTenant, GetAllStatusEnd);
module.exports = router;