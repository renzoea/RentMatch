/**
 * Logger centralizado para la aplicación
 * En producción, limita la información sensible que se muestra
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger que respeta el entorno
 */
const logger = {
  /**
   * Log de información general
   */
  info: (...args) => {
    if (!isProduction) {
      console.log('ℹ️', ...args);
    }
  },

  /**
   * Log de errores (siempre se muestra, pero sanitizado en producción)
   */
  error: (...args) => {
    if (isProduction) {
      // En producción, solo mostrar mensajes genéricos, no objetos completos
      const sanitized = args.map(arg => {
        if (typeof arg === 'object') {
          return '[Object]';
        }
        return arg;
      });
      console.error('❌', ...sanitized);
    } else {
      console.error('❌', ...args);
    }
  },

  /**
   * Log de advertencias
   */
  warn: (...args) => {
    if (isProduction) {
      const sanitized = args.map(arg => {
        if (typeof arg === 'object') {
          return '[Object]';
        }
        return arg;
      });
      console.warn('⚠️', ...sanitized);
    } else {
      console.warn('⚠️', ...args);
    }
  },

  /**
   * Log de éxito (solo en desarrollo)
   */
  success: (...args) => {
    if (!isProduction) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (...args) => {
    if (!isProduction) {
      console.log('🔍', ...args);
    }
  },

  /**
   * Log de webhooks (siempre se muestra con info básica)
   */
  webhook: (message, data) => {
    if (isProduction) {
      // En producción, solo mostrar tipo y ID
      console.log('📥 Webhook:', message, { type: data?.type, id: data?.data?.id });
    } else {
      console.log('📥 Webhook:', message, data);
    }
  },

  /**
   * Log de pagos (info sanitizada en producción)
   */
  payment: (message, paymentData) => {
    if (isProduction) {
      // Solo mostrar IDs, no datos completos del pago
      console.log('💳', message, {
        payment_id: paymentData?.id,
        status: paymentData?.status,
        amount: paymentData?.transaction_amount
      });
    } else {
      console.log('💳', message, paymentData);
    }
  }
};

module.exports = logger;
