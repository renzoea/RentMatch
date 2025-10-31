const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken, authorizeTenant, authorizeLandlord } = require('../middleware/authMiddleware');

// Rutas de inquilino primero
router.get('/my', authenticateToken, authorizeTenant, contractController.getMyContracts);
router.get('/my/:id', authenticateToken, authorizeTenant, contractController.getTenantContractDetail);
router.post('/my/:id/sign', authenticateToken, authorizeTenant, contractController.signContractAsTenant);
router.post('/:id/confirm-tenant-signature', contractController.confirmTenantSignature);

// Rutas de propietario
router.get('/landlord/my', authenticateToken, authorizeLandlord, contractController.getLandlordContracts);
router.get('/landlord/my/:id', authenticateToken, authorizeLandlord, contractController.getLandlordContractDetail);
router.post('/landlord/my/:id/sign', authenticateToken, authorizeLandlord, contractController.signContractAsLandlord);
router.post('/:id/confirm-landlord-signature', contractController.confirmLandlordSignature);
router.get('/find-tenant', authenticateToken, authorizeLandlord, contractController.findTenantByEmail);

// Rutas de gestión de contratos (propietario)
router.post('/', authenticateToken, authorizeLandlord, contractController.createContract);
router.get('/:id', authenticateToken, authorizeLandlord, contractController.getContractDetail);
router.put('/:id', authenticateToken, authorizeLandlord, contractController.updateContract);
router.delete('/:id', authenticateToken, authorizeLandlord, contractController.deleteContract);

module.exports = router;