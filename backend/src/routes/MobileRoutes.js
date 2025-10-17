// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const MobileauthController = require('../controllers/MobileLoginController');


// Login de usuario
router.post('/login-mobile', MobileauthController.loginMovil);

// Recuperación de contraseña
router.post('/forgot-password', MobileauthController.forgotPasswordMovil);

module.exports = router;