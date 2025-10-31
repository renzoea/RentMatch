const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * GET /api/deposits/my
 * Obtener todos los depósitos del usuario actual (inquilino o propietario)
 */
router.get('/my', authenticateToken, depositController.getMyDeposits);

/**
 * GET /api/deposits/:id
 * Obtener detalle de un depósito específico
 */
router.get('/:id', authenticateToken, depositController.getDepositDetail);

/**
 * POST /api/deposits/:id/mark-as-paid
 * El inquilino marca el depósito como pagado (solo inquilino)
 * Body: { proof_url?: string }
 */
router.post('/:id/mark-as-paid', authenticateToken, depositController.markAsPaid);

/**
 * POST /api/deposits/:id/release
 * Liberar depósito al finalizar contrato (solo propietario)
 * Body: {
 *   outcome: 'return_to_tenant' | 'return_to_landlord' | 'split',
 *   tenant_share?: number,
 *   landlord_share?: number,
 *   notes?: string
 * }
 */
router.post('/:id/release', authenticateToken, depositController.releaseDeposit);

/**
 * DELETE /api/deposits/:id/cancel
 * Cancelar un depósito que nunca fue pagado
 */
router.delete('/:id/cancel', authenticateToken, depositController.cancelDeposit);

module.exports = router;
