// backend/src/routes/profileRoutes.js
const express = require('express');
const { getAllProfiles, createProfile, getProfileById } = require('../controllers/profileController');

const router = express.Router();

// GET /api/profiles - Obtener todos los perfiles
router.get('/', getAllProfiles);

// POST /api/profiles - Crear nuevo perfil
router.post('/', createProfile);

// GET /api/profiles/:id - Obtener perfil por ID
router.get('/:id', getProfileById);

module.exports = router;