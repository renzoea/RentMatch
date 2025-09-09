// backend/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

// Usa la SERVICE_ROLE_KEY para operaciones del backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;