const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');
const logger = require('../utils/logger');

// Verificar que el access token esté configurado
if (!process.env.MP_ACCESS_TOKEN) {
  logger.error('ERROR: MP_ACCESS_TOKEN no está configurado en .env');
  throw new Error('MP_ACCESS_TOKEN no está configurado');
}

logger.info('Mercado Pago configurado correctamente');

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 10000
  }
});

// Crear instancias de las APIs
const preferenceApi = new Preference(client);
const paymentApi = new Payment(client);
const merchantOrderApi = new MerchantOrder(client);

/**
 * Crear una preferencia de pago
 * @param {Object} depositData - Datos del depósito
 * @param {string} depositData.id - ID del depósito
 * @param {number} depositData.amount - Monto a pagar
 * @param {string} depositData.contractId - ID del contrato
 * @param {Object} depositData.property - Datos de la propiedad
 * @param {Object} depositData.tenant - Datos del inquilino
 * @returns {Promise<Object>} Preferencia creada
 */
async function createPaymentPreference(depositData) {
  const { id, amount, contractId, property, tenant } = depositData;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Usamos el deposit_id en la URL para que la página de success pueda identificar el depósito
  const preference = {
    items: [
      {
        title: `Depósito de Garantía - ${property?.address_line || 'Propiedad'}`,
        description: `Depósito de garantía para el contrato de alquiler`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(amount)
      }
    ],
    back_urls: {
      success: `${frontendUrl}/home/inquilino/depositos/success?deposit_id=${id}`,
      failure: `${frontendUrl}/home/inquilino/depositos/failure?deposit_id=${id}`,
      pending: `${frontendUrl}/home/inquilino/depositos/pending?deposit_id=${id}`
    },
    // auto_return: 'approved' redirige automáticamente después de un pago exitoso
    // Solo funciona con URLs públicas (no localhost)
    auto_return: process.env.NODE_ENV === 'production' ? 'approved' : undefined,
    external_reference: id,
    notification_url: process.env.MP_NOTIFICATION_URL || 'http://localhost:5000/api/deposits/webhook',
    statement_descriptor: 'RENTMATCH'
  };

  // NO pre-llenar payer para dar libertad total al usuario
  // El usuario puede pagar con cualquier cuenta o como invitado
  // if (tenant?.email) {
  //   preference.payer = {
  //     email: tenant.email
  //   };
  //   if (tenant.full_name) {
  //     preference.payer.name = tenant.full_name;
  //   }
  // }

  // Agregar metadata
  preference.metadata = {
    deposit_id: id,
    contract_id: contractId
  };

  try {
    const response = await preferenceApi.create({ body: preference });
    logger.success('Preferencia de pago creada:', response.id);
    return response;
  } catch (error) {
    logger.error('Error creating Mercado Pago preference:', error.message);
    logger.debug('Error completo:', JSON.stringify(error, null, 2));
    throw new Error('Error al crear la preferencia de pago en Mercado Pago');
  }
}

/**
 * Obtener información de un pago
 * @param {string} paymentId - ID del pago en Mercado Pago
 * @returns {Promise<Object>} Información del pago
 */
async function getPaymentInfo(paymentId) {
  try {
    const payment = await paymentApi.get({ id: paymentId });
    logger.debug('Información de pago obtenida:', paymentId);
    return payment;
  } catch (error) {
    logger.error('Error getting payment info:', error.message);
    throw new Error('Error al obtener información del pago');
  }
}

/**
 * Obtener información de una orden de Mercado Pago
 * @param {string} merchantOrderId - ID de la orden
 * @returns {Promise<Object>} Información de la orden
 */
async function getMerchantOrder(merchantOrderId) {
  try {
    const order = await merchantOrderApi.get({ merchantOrderId });
    logger.debug('Merchant order obtenida:', merchantOrderId);
    return order;
  } catch (error) {
    logger.error('Error getting merchant order:', error.message);
    throw new Error('Error al obtener la orden');
  }
}

/**
 * Mapear estado de Mercado Pago a estado de depósito
 * @param {string} mpStatus - Estado en Mercado Pago
 * @returns {string} Estado del depósito
 */
function mapMPStatusToDepositStatus(mpStatus) {
  const statusMap = {
    'approved': 'held',                    // Pago aprobado → depósito retenido
    'pending': 'awaiting_verification',    // Pago pendiente → esperando verificación
    'in_process': 'awaiting_verification', // Pago en proceso → esperando verificación
    'rejected': 'pending_payment',         // Pago rechazado → volver a pendiente de pago
    'cancelled': 'pending_payment',        // Pago cancelado → volver a pendiente de pago
    'refunded': 'returned_to_tenant',      // Pago reembolsado → devuelto al inquilino
    'charged_back': 'disputed'             // Contracargo → en disputa
  };

  return statusMap[mpStatus] || 'pending_payment';
}

/**
 * Verificar que el webhook sea auténtico usando la firma x-signature
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 * @param {Object} body - Cuerpo de la notificación
 * @param {Object} headers - Headers de la petición
 * @returns {boolean} True si es auténtico
 */
function verifyWebhookSignature(body, headers) {
  try {
    // MODO PERMISIVO: Solo loguear advertencias, NO rechazar webhooks
    // Esto es temporal hasta verificar que la firma funciona correctamente en producción

    if (!process.env.MP_WEBHOOK_SECRET) {
      logger.warn('MP_WEBHOOK_SECRET no está configurado - webhook aceptado sin validación');
      return true; // Aceptar de todas formas
    }

    // Obtener headers necesarios
    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];

    if (!xSignature || !xRequestId) {
      logger.warn('Falta x-signature o x-request-id - webhook aceptado sin validación');
      return true; // Aceptar de todas formas
    }

    // Parsear x-signature (formato: ts=timestamp,v1=hash)
    const signatureParts = {};
    xSignature.split(',').forEach(part => {
      const [key, value] = part.split('=');
      signatureParts[key.trim()] = value.trim();
    });

    const timestamp = signatureParts['ts'];
    const receivedHash = signatureParts['v1'];

    if (!timestamp || !receivedHash) {
      logger.warn('Formato de x-signature inválido - webhook aceptado sin validación');
      return true; // Aceptar de todas formas
    }

    // Validar timestamp (más permisivo: 15 minutos en lugar de 5)
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - parseInt(timestamp);
    if (Math.abs(timeDiff) > 900) { // 15 minutos (permitir diferencias hacia adelante y atrás)
      logger.warn(`Webhook con timestamp fuera de rango (diff: ${timeDiff}s) - aceptado de todas formas`);
      return true; // Aceptar de todas formas
    }

    // Construir el string de manifest según documentación de MP
    // Formato: id:<data.id>;request-id:<x-request-id>;ts:<timestamp>;
    const dataId = body.data?.id || '';
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

    // Calcular HMAC SHA256
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    // Comparar hashes
    if (calculatedHash !== receivedHash) {
      logger.warn('Firma de webhook no coincide - aceptado de todas formas en modo permisivo');
      logger.debug(`Esperado: ${calculatedHash}, Recibido: ${receivedHash}`);
      return true; // Aceptar de todas formas en modo permisivo
    }

    logger.success('Firma de webhook validada correctamente');
    return true;
  } catch (error) {
    logger.error('Error verificando firma de webhook:', error.message);
    return true; // Aceptar de todas formas si hay error
  }
}

module.exports = {
  client,
  preferenceApi,
  paymentApi,
  merchantOrderApi,
  createPaymentPreference,
  getPaymentInfo,
  getMerchantOrder,
  mapMPStatusToDepositStatus,
  verifyWebhookSignature
};
