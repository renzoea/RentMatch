const express = require('express');
const router = express.Router();

const { ReporterUpdate, upload } = require('../controllers/MobileReporterController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');

// POST /api/mobile-reporter/incidents
router.post('/incidents', upload.array('images',5), authenticateToken, authorizeTenant, ReporterUpdate);

module.exports = router;