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

module.exports = { 
  GetAllSearch,
  FilterByType

};