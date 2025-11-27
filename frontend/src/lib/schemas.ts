/**
 * Schemas de validación con Zod
 * Centraliza todos los schemas de formularios de la aplicación
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS BASE - Campos reutilizables
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Formato de email inválido');

export const passwordSchema = z
  .string()
  .min(1, 'La contraseña es requerida')
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone) return true;
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      const phoneRegex = /^(\+54|0)?(\d{2,4})(\d{6,8})$/;
      return phoneRegex.test(cleanPhone);
    },
    { message: 'Formato de teléfono inválido. Ej: 011 1234-5678 o +54 11 1234-5678' }
  );

export const requiredStringSchema = z.string().min(1, 'Este campo es requerido');

export const positiveNumberSchema = z
  .number({ message: 'Debe ser un número' })
  .positive('Debe ser mayor a 0');

export const nonNegativeNumberSchema = z
  .number({ message: 'Debe ser un número' })
  .nonnegative('No puede ser negativo');

// ============================================================================
// SCHEMAS DE AUTENTICACIÓN
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: requiredStringSchema,
    lastName: requiredStringSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    userType: z.enum(['inquilino', 'propietario'], {
      message: 'Selecciona un tipo de usuario',
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// ============================================================================
// SCHEMAS DE CUENTA
// ============================================================================

export const accountDetailsSchema = z.object({
  firstName: requiredStringSchema,
  lastName: requiredStringSchema,
  email: emailSchema,
  phone: phoneSchema,
  isPublic: z.boolean().optional(),
});

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((val) => val === 'ELIMINAR MI CUENTA', {
      message: 'Debes escribir exactamente "ELIMINAR MI CUENTA"',
    }),
});

// ============================================================================
// SCHEMAS DE PERFIL DE BÚSQUEDA (INQUILINO)
// ============================================================================

export const searchProfileSchema = z
  .object({
    // Ubicación
    city: requiredStringSchema,
    neighborhood: z.string().optional(),

    // Economía
    minBudget: positiveNumberSchema,
    maxBudget: positiveNumberSchema,
    contractDuration: z
      .number({ message: 'Debe ser un número' })
      .int('Debe ser un número entero')
      .min(1, 'Mínimo 1 mes')
      .max(120, 'Máximo 120 meses')
      .optional(),

    // Estado
    status: z.enum(['activo', 'pausado', 'archivado']).default('activo'),

    // Tipos de propiedad
    propertyTypes: z
      .array(z.enum(['departamento', 'ph', 'duplex', 'casa', 'estudio']))
      .min(1, 'Selecciona al menos un tipo de propiedad'),

    // Características (rangos)
    minBedrooms: nonNegativeNumberSchema.optional(),
    maxBedrooms: nonNegativeNumberSchema.optional(),
    minRooms: nonNegativeNumberSchema.optional(),
    maxRooms: nonNegativeNumberSchema.optional(),
    minBathrooms: nonNegativeNumberSchema.optional(),
    maxBathrooms: nonNegativeNumberSchema.optional(),
    minArea: nonNegativeNumberSchema.optional(),
    maxArea: nonNegativeNumberSchema.optional(),

    // Preferencias booleanas
    furnished: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    smokersAllowed: z.boolean().optional(),
    childrenAllowed: z.boolean().optional(),
    studentsAllowed: z.boolean().optional(),
    parking: z.boolean().optional(),
    verifiedLandlord: z.boolean().optional(),
    balcony: z.boolean().optional(),
    terrace: z.boolean().optional(),
    laundry: z.boolean().optional(),
    security: z.boolean().optional(),
    elevator: z.boolean().optional(),

    // Amenidades
    amenities: z.array(z.string()).optional(),

    // Notas
    preferences: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.maxBudget >= data.minBudget, {
    message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
    path: ['maxBudget'],
  })
  .refine(
    (data) => {
      if (data.minBedrooms !== undefined && data.maxBedrooms !== undefined) {
        return data.maxBedrooms >= data.minBedrooms;
      }
      return true;
    },
    {
      message: 'El máximo debe ser mayor o igual al mínimo',
      path: ['maxBedrooms'],
    }
  )
  .refine(
    (data) => {
      if (data.minRooms !== undefined && data.maxRooms !== undefined) {
        return data.maxRooms >= data.minRooms;
      }
      return true;
    },
    {
      message: 'El máximo debe ser mayor o igual al mínimo',
      path: ['maxRooms'],
    }
  )
  .refine(
    (data) => {
      if (data.minBathrooms !== undefined && data.maxBathrooms !== undefined) {
        return data.maxBathrooms >= data.minBathrooms;
      }
      return true;
    },
    {
      message: 'El máximo debe ser mayor o igual al mínimo',
      path: ['maxBathrooms'],
    }
  )
  .refine(
    (data) => {
      if (data.minArea !== undefined && data.maxArea !== undefined) {
        return data.maxArea >= data.minArea;
      }
      return true;
    },
    {
      message: 'El máximo debe ser mayor o igual al mínimo',
      path: ['maxArea'],
    }
  );

// ============================================================================
// SCHEMAS DE CONTRATO (PROPIETARIO)
// ============================================================================

export const contractSchema = z.object({
  // Inquilino
  tenantEmail: emailSchema,
  tenantId: z.string().optional(),

  // Propiedad
  address: requiredStringSchema,
  city: requiredStringSchema,
  neighborhood: z.string().optional(),
  propertyType: z.enum(['departamento', 'casa', 'ph', 'duplex', 'estudio'], {
    message: 'Selecciona el tipo de propiedad',
  }),
  rooms: z.number().int().min(1, 'Mínimo 1 ambiente').optional(),
  bathrooms: z.number().int().min(1, 'Mínimo 1 baño').optional(),
  furnished: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
  propertyNotes: z.string().optional(),

  // Términos del contrato
  rentAmount: positiveNumberSchema,
  depositAmount: nonNegativeNumberSchema.optional(),
  paymentDay: z
    .number()
    .int()
    .min(1, 'El día debe estar entre 1 y 28')
    .max(28, 'El día debe estar entre 1 y 28')
    .optional(),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  duration: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 mes')
    .max(120, 'Máximo 120 meses'),
  additionalTerms: z.string().optional(),

  // Documento
  contractDocument: z.instanceof(File).optional(),
});

// ============================================================================
// SCHEMAS PÚBLICOS
// ============================================================================

export const contactSchema = z.object({
  name: requiredStringSchema,
  email: emailSchema,
  subject: requiredStringSchema,
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

// ============================================================================
// TIPOS DE TYPESCRIPT DERIVADOS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AccountDetailsFormData = z.infer<typeof accountDetailsSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type SearchProfileFormData = z.infer<typeof searchProfileSchema>;
export type ContractFormData = z.infer<typeof contractSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
