const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

// Registro de usuario
exports.register = async (req, res) => {
  const { full_name, email, password, role, phone } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      console.error('Error en Supabase Auth:', authError);
      return res.status(400).json({ error: authError.message });
    }
    const userId = authData.user.id;

    // 2. Insertar perfil en profiles
    const password_hash = await bcrypt.hash(password, 10);
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name,
          email,
          phone,
          role,
          password_hash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    if (profileError) {
      console.error('Error al registrar perfil:', profileError);
      return res.status(500).json({ error: 'Error al registrar perfil.', details: profileError.message });
    }
    return res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  try {
    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError || !authData.session) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 2. Buscar perfil por id (no por email)
    console.log('Buscando perfil con id:', authData.user.id);
    const { data: user, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    console.log('Resultado perfil:', user, profileError); 
    if (!user) {
      return res.status(401).json({ error: 'Perfil no encontrado.' });
    }

    // 3. Retornar el token y el usuario
    return res.status(200).json({
      message: 'Login exitoso',
      access_token: authData.session.access_token,
      user
    });
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
};

// Recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio.' });
  }
  try {
    // Opcional: verificar si el usuario existe en profiles
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    // Enviar email de recuperación con Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) {
      console.error('Error al enviar email de recuperación:', resetError);
      return res.status(500).json({ error: 'No se pudo enviar el email de recuperación.', details: resetError.message });
    }
    return res.status(200).json({ message: 'Se ha enviado el email de recuperación.' });
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
};