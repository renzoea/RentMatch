const supabase = require('../config/supabase');

async function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ message: 'Token inválido' });

  req.user = user.user;
  next();
}

async function authorizeTenant(req, res, next) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || !data) return res.status(403).json({ message: 'No se encontró el perfil' });
  if (data.role !== 'inquilino') {
    return res.status(403).json({ message: 'Esto solo lo pueden hacer los inquilinos' });
  }
  if (data.is_banned) {
    return res.status(403).json({ message: 'Usuario baneado, no puedes hacer eso.' });
  }
  next();
}

module.exports = { authenticateToken, authorizeTenant };