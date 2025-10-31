const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ruta para subir PDF
router.post('/pdf', authenticateToken, uploadController.uploadMiddleware, uploadController.uploadPDF);

module.exports = router;