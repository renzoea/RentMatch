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
  FilterByArea
};