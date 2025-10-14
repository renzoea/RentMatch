const supabase  = require('../config/supabase');

const getActiveRentals = async (req, res) => {
    const profile_id = req.params.id;
    try {
        const { data, error } = await supabase
        .from('tenant_search_profiles')
        .select('*')
        .eq('id', profile_id) 
        .eq('status', 'activo');
        
        if (error) {
        return res.status(400).json({success: false, message: 'Error en la consulta de Supabase'});
        }
        res.json({success: true, data})
    } catch (error) {
        res.status(500).json({success: false, message: 'error interno del servidor'});
    }
}
const getRentalHistory = async (req, res) => {
  const tenantId = req.params.tenantId;
  try {
    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'activo'); // Filtra por estado distinto de activo

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = {    
    
    getActiveRentals,
    getRentalHistory
};