const supabase = require('../config/supabase');

const GetAllSearch = async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('tenant_search_profiles')
    .select('*');

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }   
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  } 
};
const FilterByType = async (req, res) => {
    try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .contains('property_types', [req.params.type]);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
    } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByRoomsRange = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .lte('rooms_min', req.params.max)
    .gte('rooms_max', req.params.min);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
const FilterByBedroomsRange = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .lte('bedroom_min', req.params.max)
    .gte('bedroom_max', req.params.min);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

const FilterByBathrooms = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .lte('bathrooms_min', req.params.max)
    .gte('bathrooms_max', req.params.min);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByPriceRange = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .lte('budget_max', req.params.max)
    .gte('budget_min', req.params.min);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByLeaseDuration = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('lease_term_months', req.params.duration);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterBychildren = async (req, res) => {
  try {
    const has_children = req.params.children === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('children', has_children);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByFurnished = async (req, res) => {
  try {
    const is_furnished = req.params.furnished === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('furnished', is_furnished);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByPets = async (req, res) => {
  try {
    const allows_pets = req.params.pets === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('pets_allowed', allows_pets);

    if (error) {  
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    } 
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByAmenities = async (req, res) => { 
  try {
    const amenities = req.params.amenities.split(',');
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .contains('amenities', amenities);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  } 
};

const FilterBySmoking = async (req, res) => {
  try {
    const allows_smoking = req.params.smoking === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('smokers_allowed', allows_smoking);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  } 
};
const FilterByCities = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('city', req.params.city);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByNeighborhood = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('neighborhood', req.params.neighborhood);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByBalcony = async (req, res) => {
  try {
    const has_balcony = req.params.balcony === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('balcony', has_balcony);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FilterByTerrace = async (req, res) => {
  try {
    const has_terrace = req.params.terrace === 'true';  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('terrace', has_terrace);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  }catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
const FliterByOccupants = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('occupants', req.params.occupants);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByVerificatedUser = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('require_verified_landlord', true);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByElevator = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('elevator', true);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterBySecurity = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('security', true);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  }catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByArea = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .lte('area_max', req.params.max)
    .gte('area_min', req.params.min);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByStudents = async (req, res) => {
  try {
    const are_students = req.params.students === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('students', are_students);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByParkingNeeded = async (req, res) => {
  try {
    const needs_parking = req.params.parking === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('parking_needed', needs_parking);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByLaundry = async (req, res) => {
  try {
    const has_laundry = req.params.laundry === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('laundry', has_laundry);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const AdvancedSearch = async (req, res) => {
  try {
    const filters = req.body;
    let query = supabase.from('tenant_search_profiles').select('*');

    // Filtros de rango de precio
    if (filters.budget_min !== undefined) {
      query = query.gte('budget_min', filters.budget_min);
    }
    if (filters.budget_max !== undefined) {
      query = query.lte('budget_max', filters.budget_max);
    }

    // Filtros de ubicación
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.neighborhood) {
      query = query.eq('neighborhood', filters.neighborhood);
    }

    // Filtros de tipo de propiedad
    if (filters.property_types && filters.property_types.length > 0) {
      query = query.contains('property_types', filters.property_types);
    }

    // Filtros de habitaciones
    if (filters.rooms_min !== undefined) {
      query = query.lte('rooms_min', filters.rooms_min);
    }
    if (filters.rooms_max !== undefined) {
      query = query.gte('rooms_max', filters.rooms_max);
    }

    // Filtros de dormitorios
    if (filters.bedroom_min !== undefined) {
      query = query.lte('bedroom_min', filters.bedroom_min);
    }
    if (filters.bedroom_max !== undefined) {
      query = query.gte('bedroom_max', filters.bedroom_max);
    }

    // Filtros de baños
    if (filters.bathrooms_min !== undefined) {
      query = query.lte('bathrooms_min', filters.bathrooms_min);
    }
    if (filters.bathrooms_max !== undefined) {
      query = query.gte('bathrooms_max', filters.bathrooms_max);
    }

    // Filtros de área
    if (filters.area_min !== undefined) {
      query = query.lte('area_min', filters.area_min);
    }
    if (filters.area_max !== undefined) {
      query = query.gte('area_max', filters.area_max);
    }

    // Filtros booleanos
    if (filters.furnished !== undefined) {
      query = query.eq('furnished', filters.furnished);
    }
    if (filters.pets_allowed !== undefined) {
      query = query.eq('pets_allowed', filters.pets_allowed);
    }
    if (filters.smokers_allowed !== undefined) {
      query = query.eq('smokers_allowed', filters.smokers_allowed);
    }
    if (filters.children !== undefined) {
      query = query.eq('children', filters.children);
    }
    if (filters.students !== undefined) {
      query = query.eq('students', filters.students);
    }
    if (filters.parking_needed !== undefined) {
      query = query.eq('parking_needed', filters.parking_needed);
    }
    if (filters.balcony !== undefined) {
      query = query.eq('balcony', filters.balcony);
    }
    if (filters.terrace !== undefined) {
      query = query.eq('terrace', filters.terrace);
    }
    if (filters.laundry !== undefined) {
      query = query.eq('laundry', filters.laundry);
    }
    if (filters.elevator !== undefined) {
      query = query.eq('elevator', filters.elevator);
    }
    if (filters.security !== undefined) {
      query = query.eq('security', filters.security);
    }
    if (filters.require_verified_landlord !== undefined) {
      query = query.eq('require_verified_landlord', filters.require_verified_landlord);
    }

    // Filtros de amenities
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    // Filtros numéricos exactos
    if (filters.lease_term_months !== undefined) {
      query = query.eq('lease_term_months', filters.lease_term_months);
    }
    if (filters.occupants !== undefined) {
      query = query.eq('occupants', filters.occupants);
    }

    // Filtros de estado y visibilidad
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.visibility) {
      query = query.eq('visibility', filters.visibility);
    }
    if (filters.is_banned !== undefined) {
      query = query.eq('is_banned', filters.is_banned);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      count: data.length,
      filters_applied: Object.keys(filters).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = { 
  GetAllSearch,
  FilterByType,
  FilterByRoomsRange,
  FilterByBathrooms,
  FilterByPriceRange,
  FilterByLeaseDuration,
  FilterBychildren,
  FilterByFurnished,
  FilterByPets,
  FilterByAmenities,
  FilterBySmoking,
  FilterByBedroomsRange,
  FilterByCities,
  FilterByNeighborhood,
  FilterByBalcony,
  FilterByTerrace,
  FliterByOccupants,
  FilterByVerificatedUser,
  FilterBySecurity,
  FilterByElevator,
  FilterByArea,
  FilterByStudents,
  FilterByParkingNeeded,
  FilterByLaundry,
  AdvancedSearch
};