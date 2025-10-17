const supabase = require('../config/supabase');

exports.loginMovil = async (req, res) => {
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
    
    if (authError) {
      // Verificar si el error está relacionado con la activación de la cuenta
      if (authError.message.includes('Email not confirmed')) {
        return res.status(403).json({ error: 'La cuenta no está activada. Por favor, verifica tu correo electrónico.' });
      }
  
      // Otros errores de autenticación
      return res.status(401).json({ error: 'Error al autenticar. Por favor, verifica tus credenciales.' });
    }
  
    if (!authData.user) {
      return res.status(401).json({ error: 'No se encontró el usuario. Por favor, verifica tus credenciales.' });
    }
  
    // Verificar si el correo está confirmado (por seguridad adicional)
    if (!authData.user.email_confirmed_at) {
      return res.status(403).json({ error: 'La cuenta no está activada. Por favor, verifica tu correo electrónico.' });
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
     if (user.role !== 'inquilino') {
      return res.status(403).json({ error: 'Solo los inquilinos pueden acceder a esta función.' });
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


exports.forgotPasswordMovil = async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email es obligatorio.' });

  email = email.trim().toLowerCase();

  try {
    // Verificar usuario (si quieres no revelar existencia, reemplaza el 404 por un 200 genérico)
    const { data: user, error: profileError } = await supabase
      .from('profiles')
      .select('id,email')
      .eq('email', email)
      .single();

    if (profileError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
      // return res.status(200).json({ message: 'Se ha enviado el email de recuperación.' }); // opción para no revelar
    }

    const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:3000/auth/reset_password';
    console.log('[forgotPassword] email:', email, 'redirectTo:', redirectTo);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) {
      console.error('[forgotPassword] Supabase error:', resetError);
      return res.status(500).json({ error: 'No se pudo enviar el email de recuperación.', details: resetError.message });
    }

    return res.status(200).json({ message: 'Se ha enviado el email de recuperación.' });
  } catch (err) {
    console.error('[forgotPassword] Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
};