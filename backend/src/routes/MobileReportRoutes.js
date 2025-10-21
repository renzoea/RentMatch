const express = require('express');
const router = express.Router();

const { ReporterUpdate } = require('../controllers/MobileReporterController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');

// POST /api/mobile-reporter/incidents
router.post('/incidents', authenticateToken, authorizeTenant, ReporterUpdate);

module.exports = router;