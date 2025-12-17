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

  // Trim y lowercase
  const cleanEmail = email.trim().toLowerCase();

  // Longitud máxima
  if (cleanEmail.length > 100) {
    return 'El email no puede tener más de 100 caracteres';
  }

  // Regex robusto para email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return 'Formato de email inválido';
  }

  return null;
};

/**
 * Valida nombre o apellido
 * Solo permite letras, espacios, tildes, guiones y apóstrofes
 */
export const validateName = (name: string, fieldName: string = 'Este campo'): string | null => {
  if (!name) return `${fieldName} es requerido`;

  const cleanName = name.trim();

  // Longitud mínima y máxima
  if (cleanName.length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }

  if (cleanName.length > 50) {
    return `${fieldName} no puede tener más de 50 caracteres`;
  }

  // Solo letras, espacios, tildes, guiones y apóstrofes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

  if (!nameRegex.test(cleanName)) {
    return `${fieldName} solo puede contener letras, espacios, tildes y guiones`;
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

/**
 * Valida un rango numérico (mínimo y máximo)
 */
export const validateNumberRange = (
  min?: number,
  max?: number,
  fieldName: string = 'El valor',
  maxLimit?: number
): string | null => {
  // Si ambos son undefined o null, está ok (no es obligatorio)
  if (min === undefined && max === undefined) return null;

  // Validar que sean >= 0
  if (min !== undefined && min < 0) {
    return `${fieldName} mínimo no puede ser negativo`;
  }

  if (max !== undefined && max < 0) {
    return `${fieldName} máximo no puede ser negativo`;
  }

  // Validar que max >= min (si ambos existen)
  if (min !== undefined && max !== undefined && max < min) {
    return `${fieldName} máximo debe ser mayor o igual al mínimo`;
  }

  // Validar límite máximo si se proporciona
  if (maxLimit && max !== undefined && max > maxLimit) {
    return `${fieldName} máximo no puede superar ${maxLimit}`;
  }

  if (maxLimit && min !== undefined && min > maxLimit) {
    return `${fieldName} mínimo no puede superar ${maxLimit}`;
  }

  return null;
};

/**
 * Valida longitud de texto
 */
export const validateTextLength = (
  text: string,
  maxLength: number,
  fieldName: string = 'Este campo'
): string | null => {
  if (!text) return null; // Texto vacío es válido (es opcional)

  const cleanText = text.trim();

  if (cleanText.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }

  return null;
};

/**
 * Valida nombre de amenidad personalizada
 * Solo permite letras, números, espacios, guiones y underscores
 */
export const validateAmenityName = (name: string): string | null => {
  if (!name) return 'El nombre es requerido';

  const cleanName = name.trim();

  if (cleanName.length < 3) {
    return 'Mínimo 3 caracteres';
  }

  if (cleanName.length > 50) {
    return 'Máximo 50 caracteres';
  }

  // Solo letras, números, espacios, guiones, underscores y tildes
  const amenityRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s_-]+$/;

  if (!amenityRegex.test(cleanName)) {
    return 'Solo se permiten letras, números, espacios, guiones y guiones bajos';
  }

  return null;
};
