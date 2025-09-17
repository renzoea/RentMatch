const { authenticateToken, authorizeTenant } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const searchProfileController = require('../controllers/searchProfileController');

// Crear un nuevo perfil de búsqueda
router.post('/', authenticateToken, authorizeTenant, searchProfileController.createSearchProfile);

// Editar perfil de búsqueda (PUT para reemplazo completo, PATCH para parcial)
router.put('/:id', authenticateToken, authorizeTenant, searchProfileController.updateSearchProfile);
router.patch('/:id', authenticateToken, authorizeTenant, searchProfileController.partialUpdateSearchProfile);

// Eliminar perfil de búsqueda
router.delete('/:id', authenticateToken, authorizeTenant, searchProfileController.deleteSearchProfile);

// Obtener todos los perfiles de búsqueda
router.get('/', authenticateToken, authorizeTenant, searchProfileController.getMySearchProfiles);

// Obtener detalle de un perfil de búsqueda específico
router.get('/:id', authenticateToken, authorizeTenant, searchProfileController.getSearchProfileDetail);

module.exports = router;