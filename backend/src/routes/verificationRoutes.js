const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const verificationController = require('../controllers/verificationController');

// Rutas protegidas (requieren autenticación)
router.post('/submit', authenticateToken, verificationController.submitVerification);
router.get('/status', authenticateToken, verificationController.getVerificationStatus);

// Rutas para verificación con QR (requieren autenticación para crear sesión)
router.post('/qr/create', authenticateToken, verificationController.createQRSession);
router.get('/qr/session/:token', verificationController.getQRSession); // No requiere auth (polling desde desktop)
router.post('/qr/submit/:token', verificationController.submitQRVerification); // No requiere auth (desde móvil)

// Rutas de administración (TODO: agregar middleware de admin cuando lo tengas)
router.get('/admin/list', authenticateToken, verificationController.listVerifications);
router.patch('/admin/review/:id', authenticateToken, verificationController.reviewVerification);

module.exports = router;
