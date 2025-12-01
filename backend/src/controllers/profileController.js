const supabase = require('../config/supabase');

/**
 * Get current user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, email, phone, status, avatar_url, public_search_profiles, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

/**
 * Get current user verification status
 * GET /api/users/verification-status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // First check profile status (for users verified directly in profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, status_at')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // If profile status is 'verified', use that
    if (profile.status === 'verified') {
      return res.json({
        is_verified: true,
        verified_at: profile.status_at || null
      });
    }

    // Otherwise, check identity_verifications table
    const { data: verification, error } = await supabase
      .from('identity_verifications')
      .select('id, status, reviewed_at')
      .eq('user_id', userId)
      .eq('status', 'verified')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's ok, means not verified
      throw error;
    }

    const isVerified = !!verification;

    res.json({
      is_verified: isVerified,
      verified_at: verification?.reviewed_at || null
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ error: 'Error al obtener el estado de verificación' });
  }
};

/**
 * Update current user profile
 * PATCH /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, public_search_profiles } = req.body;

    // Validate inputs
    const updates = {};

    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre completo es requerido' });
      }
      if (full_name.trim().length > 100) {
        return res.status(400).json({ error: 'El nombre completo es demasiado largo' });
      }
      updates.full_name = full_name.trim();
    }

    if (phone !== undefined) {
      if (phone && typeof phone !== 'string') {
        return res.status(400).json({ error: 'El teléfono debe ser un texto válido' });
      }
      if (phone && phone.trim().length > 0) {
        // Validar formato de teléfono (permite varios formatos internacionales)
        // Ejemplos válidos: +54 9 11 1234-5678, +54 911 1234 5678, 11 1234 5678, etc.
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(phone.trim())) {
          return res.status(400).json({ error: 'El formato del teléfono no es válido' });
        }
        if (phone.trim().length > 20) {
          return res.status(400).json({ error: 'El teléfono es demasiado largo' });
        }
      }
      updates.phone = phone ? phone.trim() : null;
    }

    if (public_search_profiles !== undefined) {
      if (typeof public_search_profiles !== 'boolean') {
        return res.status(400).json({ error: 'La visibilidad debe ser verdadero o falso' });
      }
      updates.public_search_profiles = public_search_profiles;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para actualizar' });
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, role, full_name, email, phone, status, avatar_url, public_search_profiles, created_at, updated_at')
      .single();

    if (error) throw error;

    res.json({
      message: 'Perfil actualizado exitosamente',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

/**
 * Delete current user account
 * DELETE /api/users/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    // Require confirmation text for safety
    if (confirmation !== 'ELIMINAR MI CUENTA') {
      return res.status(400).json({
        error: 'Confirmación incorrecta. Por favor escribe "ELIMINAR MI CUENTA" para confirmar.'
      });
    }

    // Check if user has active contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, status')
      .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
      .in('status', ['pending', 'active', 'pending_deposit']);

    if (contractsError) throw contractsError;

    if (contracts && contracts.length > 0) {
      return res.status(400).json({
        error: 'No puedes eliminar tu cuenta mientras tengas contratos activos o pendientes.'
      });
    }

    // Delete user from Supabase Auth (this will cascade delete profile via foreign key)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) throw deleteAuthError;

    res.json({
      message: 'Tu cuenta ha sido eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
};

/**
 * Change user password
 * POST /api/users/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validate inputs
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'La contraseña actual y la nueva son requeridas' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Get user from Supabase Auth to verify token
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      console.error('[changePassword] No token provided');
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      console.error('[changePassword] Auth error:', authError);
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    // Verify user ID matches
    if (authUser.id !== userId) {
      console.error('[changePassword] User ID mismatch');
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: current_password,
    });

    if (signInError) {
      console.error('[changePassword] Sign in error:', signInError.message);
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      console.error('[changePassword] Update error:', updateError);
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    console.log('[changePassword] Password updated successfully for user:', userId);
    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('[changePassword] Unexpected error:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};
