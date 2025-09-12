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