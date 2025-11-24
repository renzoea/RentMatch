/**
 * Utilidades de validación para formularios
 * Centraliza todas las validaciones de la aplicación
 */

/**
 * Valida formato de teléfono argentino
 * Acepta: +54 11 1234-5678, 011 1234-5678, 1112345678, etc.
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;

  // Remover espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Regex para formato argentino: +54 o 0 opcional, luego código de área (2-4 dígitos) y número (6-8 dígitos)
  const phoneRegex = /^(\+54|0)?(\d{2,4})(\d{6,8})$/;

  if (!phoneRegex.test(cleanPhone)) {
    return 'Formato de teléfono inválido. Ej: 011 1234-5678 o +54 11 1234-5678';
  }

  return null;
};

/**
 * Valida fortaleza de contraseña
 * Requiere: mínimo 8 caracteres, al menos una mayúscula y un número
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Debe contener al menos una letra mayúscula';
  }

  if (!/[0-9]/.test(password)) {
    return 'Debe contener al menos un número';
  }

  return null;
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return 'El email es requerido';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Formato de email inválido';
  }

  return null;
};

/**
 * Valida rango de presupuesto
 */
export const validateBudgetRange = (min?: number, max?: number): string | null => {
  if (!min && !max) return null;

  if (min && min <= 0) {
    return 'El presupuesto mínimo debe ser mayor a 0';
  }

  if (max && max <= 0) {
    return 'El presupuesto máximo debe ser mayor a 0';
  }

  if (min && max && max < min) {
    return 'El presupuesto máximo debe ser mayor o igual al mínimo';
  }

  return null;
};

/**
 * Valida que un monto sea mayor a 0 (para Mercado Pago)
 */
export const validateAmount = (amount: number | string | undefined, fieldName: string = 'El monto'): string | null => {
  if (!amount) {
    return `${fieldName} es requerido`;
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount <= 0) {
    return `${fieldName} debe ser mayor a 0`;
  }

  return null;
};

/**
 * Formatea número de teléfono para WhatsApp
 * Remueve todos los caracteres no numéricos
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Valida duración de contrato
 */
export const validateContractDuration = (months: number): string | null => {
  if (!months || months < 1) {
    return 'La duración debe ser al menos 1 mes';
  }

  if (months > 120) {
    return 'La duración máxima es 120 meses (10 años)';
  }

  return null;
};
