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

const FilterByBathrooms = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select('*')
    .eq('bathrooms_min', req.params.bathrooms);
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

module.exports = { 
  GetAllSearch,
  FilterByType,
  FilterByRoomsRange,
  FilterByBathrooms,
  FilterByPriceRange,
  FilterByLeaseDuration

};