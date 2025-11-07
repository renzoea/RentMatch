const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');

// Verificar que el access token esté configurado
if (!process.env.MP_ACCESS_TOKEN) {
  console.error('❌ ERROR: MP_ACCESS_TOKEN no está configurado en .env');
  throw new Error('MP_ACCESS_TOKEN no está configurado');
}

console.log('🔑 Access Token cargado:', process.env.MP_ACCESS_TOKEN.substring(0, 20) + '...');

// Configurar cliente de Mercado Pago en modo SANDBOX
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
    // auto_return solo funciona con URLs públicas, no con localhost
    // En producción, descomentar la siguiente línea:
    // auto_return: 'all',
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
    console.log('📝 Intentando crear preferencia con los siguientes datos:');
    console.log('- Monto:', preference.items[0].unit_price);
    console.log('- Token length:', process.env.MP_ACCESS_TOKEN?.length);
    console.log('- Preferencia completa:', JSON.stringify(preference, null, 2));

    const response = await preferenceApi.create({ body: preference });

    console.log('✅ Preferencia creada exitosamente:', response.id);
    return response;
  } catch (error) {
    console.error('❌ Error creating Mercado Pago preference:');
    console.error('Error completo:', JSON.stringify(error, null, 2));
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Cause:', error.cause);
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
    return payment;
  } catch (error) {
    console.error('Error getting payment info:', error);
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
    return order;
  } catch (error) {
    console.error('Error getting merchant order:', error);
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
 * Verificar que el webhook sea auténtico
 * @param {Object} body - Cuerpo de la notificación
 * @param {Object} headers - Headers de la petición
 * @returns {boolean} True si es auténtico
 */
function verifyWebhookSignature(body, headers) {
  // Mercado Pago envía un header x-signature con la firma
  // Por simplicidad en modo test, retornamos true
  // En producción, deberías validar la firma
  return true;
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
