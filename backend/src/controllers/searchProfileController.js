// backend/src/controllers/profileController.js
const supabase = require('../config/supabase');

exports.createSearchProfile = async (req, res) => {
  try {
    const {
      tenant_id,
      city,
      neighborhood,
      budget_min,
      budget_max,
      property_types,
      rooms_min,
      rooms_max,
      bathrooms_min,
      bathrooms_max,
      furnished,
      pets_allowed,
      smokers_allowed,
      amenities,
      lease_term_months,
      occupants,
      children,
      students,
      parking_needed,
      require_verified_landlord,
      visibility,
      status,
      bedroom_min,
      bedroom_max,
      balcony,
      terrace,
      laundry,
      security,
      elevator,
      area_min,
      area_max,
      metadata
    } = req.body;

    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .insert([{
        tenant_id,
        city,
        neighborhood,
        budget_min,
        budget_max,
        property_types,
        rooms_min,
        rooms_max,
        bathrooms_min,
        bathrooms_max,
        furnished,
        pets_allowed,
        smokers_allowed,
        amenities,
        lease_term_months,
        occupants,
        children,
        students,
        parking_needed,
        require_verified_landlord,
        visibility,
        status,
        bedroom_min,
        bedroom_max,
        balcony,
        terrace,
        laundry,
        security,
        elevator,
        area_min,
        area_max,
        metadata
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Perfil de Búsqueda creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualización completa (PUT)
exports.updateSearchProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    // LOGS PARA DEPURAR
    console.log('req.user.id:', req.user.id);
    console.log('Perfil de búsqueda id:', id);

    const { data: profile, error: fetchError } = await supabase
      .from('tenant_search_profiles')
      .select('tenant_id')
      .eq('id', id)
      .single();

    console.log('Perfil encontrado:', profile);

    if (fetchError || !profile || profile.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este perfil.' });
    }

    const { error } = await supabase
      .from('tenant_search_profiles')
      .update(updateData)
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Perfil de búsqueda actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// Actualización parcial (PATCH)
exports.partialUpdateSearchProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    // Verificar propiedad del recurso
    const { data: profile, error: fetchError } = await supabase
      .from('tenant_search_profiles')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !profile || profile.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este perfil.' });
    }

    const { error } = await supabase
      .from('tenant_search_profiles')
      .update(updateData)
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Perfil de búsqueda actualizado parcialmente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Eliminar perfil de búsqueda
exports.deleteSearchProfile = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar propiedad del recurso
    const { data: profile, error: fetchError } = await supabase
      .from('tenant_search_profiles')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !profile || profile.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este perfil.' });
    }

    const { error } = await supabase
      .from('tenant_search_profiles')
      .delete()
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Perfil de búsqueda eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener todos los perfiles de búsqueda del usuario
exports.getMySearchProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .select(`
        id,
        property_types,
        status,
        budget_min,
        budget_max,
        city,
        neighborhood,
        created_at,
        rooms_min,
        rooms_max
      `)
      .eq('tenant_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener detalle de un perfil de búsqueda específico

exports.getSearchProfileDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar el perfil y verificar que pertenezca al usuario autenticado
    const { data: profile, error } = await supabase
      .from('tenant_search_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Perfil de búsqueda no encontrado.' });
    }

    if (profile.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este perfil.' });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};