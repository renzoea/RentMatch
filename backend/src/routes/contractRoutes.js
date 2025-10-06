const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken, authorizeTenant, authorizeLandlord } = require('../middleware/authMiddleware');

// Rutas de inquilino primero
router.get('/my', authenticateToken, authorizeTenant, contractController.getMyContracts);
router.get('/my/:id', authenticateToken, authorizeTenant, contractController.getTenantContractDetail);
router.post('/my/:id/sign', authenticateToken, authorizeTenant, contractController.signContractAsTenant);
router.post('/:id/confirm-signature', contractController.confirmTenantSignature);

// Rutas de propietario después
router.post('/', authenticateToken, authorizeLandlord, contractController.createContract);
router.get('/:id', authenticateToken, authorizeLandlord, contractController.getContractDetail);
router.put('/:id', authenticateToken, authorizeLandlord, contractController.updateContract);
router.delete('/:id', authenticateToken, authorizeLandlord, contractController.deleteContract);

module.exports = router;