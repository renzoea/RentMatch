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

/**
 * POST /api/deposits/:id/create-payment
 * Crear preferencia de pago en Mercado Pago (solo inquilino)
 * Retorna: { preference_id, init_point, sandbox_init_point }
 */
router.post('/:id/create-payment', authenticateToken, depositController.createPayment);

/**
 * POST /api/deposits/webhook
 * Webhook para recibir notificaciones de Mercado Pago
 * NO requiere autenticación (es llamado por Mercado Pago)
 */
router.post('/webhook', depositController.handleWebhook);

/**
 * POST /api/deposits/verify-by-preference/:preferenceId
 * Verificar y actualizar depósito usando el preference_id de Mercado Pago
 * NO requiere autenticación (se puede llamar desde la página de éxito)
 */
router.post('/verify-by-preference/:preferenceId', depositController.verifyByPreference);

/**
 * GET /api/deposits/:id/payment-status
 * Obtener el estado actual del pago en Mercado Pago
 */
router.get('/:id/payment-status', authenticateToken, depositController.getPaymentStatus);

module.exports = router;
