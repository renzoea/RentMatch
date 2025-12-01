/**
 * Utilidades para validar DNI argentino
 */

/**
 * Valida el formato de un número de DNI argentino
 * @param {string} dni - Número de DNI a validar
 * @returns {boolean} - true si el formato es válido
 */
function isValidDNIFormat(dni) {
  if (!dni || typeof dni !== 'string') {
    return false;
  }

  // Remover puntos, espacios y guiones
  const cleanDNI = dni.replace(/[\s.-]/g, '');

  // DNI argentino: 7 u 8 dígitos numéricos
  const dniRegex = /^\d{7,8}$/;

  if (!dniRegex.test(cleanDNI)) {
    return false;
  }

  // Validar que no sea un número obviamente inválido
  const dniNumber = parseInt(cleanDNI, 10);

  // DNIs válidos están en el rango aproximado de 1.000.000 a 99.999.999
  if (dniNumber < 1000000 || dniNumber > 99999999) {
    return false;
  }

  return true;
}

/**
 * Limpia y normaliza un número de DNI
 * @param {string} dni - DNI a normalizar
 * @returns {string} - DNI limpio (solo números)
 */
function normalizeDNI(dni) {
  if (!dni || typeof dni !== 'string') {
    return '';
  }

  return dni.replace(/[\s.-]/g, '');
}

/**
 * Extrae números que parecen DNIs de un texto (para OCR)
 * @param {string} text - Texto del cual extraer DNI
 * @returns {string[]} - Array de posibles DNIs encontrados
 */
function extractDNIFromText(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Buscar secuencias de 7-8 dígitos (con o sin separadores)
  const patterns = [
    /\b(\d{2}\.?\d{3}\.?\d{3})\b/g,  // Formato: 12.345.678
    /\b(\d{1}\.?\d{3}\.?\d{3})\b/g,  // Formato: 1.234.567
    /\b(\d{7,8})\b/g                  // Formato: 12345678
  ];

  const foundDNIs = new Set();

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const dni = normalizeDNI(match[1]);
      if (isValidDNIFormat(dni)) {
        foundDNIs.add(dni);
      }
    }
  });

  return Array.from(foundDNIs);
}

/**
 * Valida una fecha de nacimiento extraída del DNI
 * @param {string} dateStr - Fecha en formato DD/MM/YYYY o similar
 * @returns {Date|null} - Fecha parseada o null si es inválida
 */
function validateBirthDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  // Intentar parsear diferentes formatos comunes
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/,  // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,    // DD-MM-YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/,    // YYYY-MM-DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day, month, year;

      if (format === formats[2]) {
        // YYYY-MM-DD
        [, year, month, day] = match;
      } else {
        // DD/MM/YYYY o DD-MM-YYYY
        [, day, month, year] = match;
      }

      const date = new Date(year, month - 1, day);

      // Validar que la fecha sea válida
      if (
        date.getFullYear() == year &&
        date.getMonth() == month - 1 &&
        date.getDate() == day
      ) {
        // Validar que la fecha esté en un rango razonable
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();

        if (age >= 18 && age <= 120) {
          return date;
        }
      }
    }
  }

  return null;
}

/**
 * Valida el género extraído del DNI
 * @param {string} gender - Género a validar
 * @returns {string|null} - 'M', 'F' o null si es inválido
 */
function validateGender(gender) {
  if (!gender || typeof gender !== 'string') {
    return null;
  }

  const normalized = gender.toUpperCase().trim();

  if (normalized === 'M' || normalized === 'MASCULINO' || normalized === 'MALE') {
    return 'M';
  }

  if (normalized === 'F' || normalized === 'FEMENINO' || normalized === 'FEMALE') {
    return 'F';
  }

  return null;
}

/**
 * Calcula la similitud entre dos nombres (para comparar nombre del perfil vs DNI)
 * @param {string} name1 - Primer nombre
 * @param {string} name2 - Segundo nombre
 * @returns {number} - Porcentaje de similitud (0-100)
 */
function nameSimilarity(name1, name2) {
  if (!name1 || !name2) {
    return 0;
  }

  // Normalizar: minúsculas, sin acentos, sin espacios extras
  const normalize = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/\s+/g, ' ')
      .trim();
  };

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  if (n1 === n2) {
    return 100;
  }

  // Calcular distancia de Levenshtein simplificada
  const longer = n1.length > n2.length ? n1 : n2;
  const shorter = n1.length > n2.length ? n2 : n1;

  if (longer.length === 0) {
    return 100;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  const similarity = ((longer.length - editDistance) / longer.length) * 100;

  return Math.round(similarity);
}

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

module.exports = {
  isValidDNIFormat,
  normalizeDNI,
  extractDNIFromText,
  validateBirthDate,
  validateGender,
  nameSimilarity
};
