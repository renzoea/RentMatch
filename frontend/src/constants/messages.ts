/**
 * Mensajes centralizados de la aplicación RentMatch
 * Facilita la localización y mantenimiento de mensajes
 */

export const MESSAGES = {
  PROFILE: {
    UPDATE_SUCCESS: 'Cambios guardados exitosamente',
    UPDATE_ERROR: 'Error al guardar los cambios',
    LOAD_ERROR: 'Error al cargar el perfil',
    DELETE_CONFIRM_TEXT: 'ELIMINAR MI CUENTA',
    DELETE_SUCCESS: 'Tu cuenta ha sido eliminada exitosamente',
    DELETE_ERROR: 'Error al eliminar la cuenta',
    DELETE_INVALID_CONFIRMATION: 'Por favor escribe exactamente: ELIMINAR MI CUENTA',
    NAME_REQUIRED: 'El nombre es requerido',
    LAST_NAME_REQUIRED: 'El apellido es requerido',
    PHONE_INVALID: 'El formato del teléfono no es válido',
  },
  PASSWORD: {
    UPDATE_SUCCESS: 'Contraseña actualizada exitosamente',
    UPDATE_ERROR: 'Error al cambiar la contraseña',
    MISMATCH: 'Las contraseñas nuevas no coinciden',
    TOO_SHORT: 'La nueva contraseña debe tener al menos 6 caracteres',
    FILL_ALL_FIELDS: 'Completá todos los campos',
    CURRENT_INCORRECT: 'La contraseña actual es incorrecta',
  },
  AUTH: {
    UNAUTHORIZED: 'No autorizado',
    SESSION_EXPIRED: 'Sesión expirada',
    LOGIN_ERROR: 'Error al iniciar sesión',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'El correo electrónico no es válido',
    INVALID_FORMAT: 'El formato no es válido',
  },
};
