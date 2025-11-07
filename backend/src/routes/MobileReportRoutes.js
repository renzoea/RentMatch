const express = require('express');
const router = express.Router();

const { ReporterUpdate, upload, getAllReport } = require('../controllers/MobileReporterController');
const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');


router.post('/incidents', upload.array('images',5), authenticateToken, authorizeTenant, ReporterUpdate);


router.get('/Getincidents', authenticateToken, authorizeTenant, getAllReport);

module.exports = router;