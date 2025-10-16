const supabase  = require('../config/supabase');

const getActiveRentals = async (req, res) => {
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
        return res.status(401).json({ success: false, message: 'ID de usuario no encontrado después de la autenticación' });
    }

    try {
        const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('tenant_id', userId) 
        .eq('status', 'active'); 
        
        if (error) {
            return res.status(400).json({ success: false, message: 'Error en la consulta de Supabase', error: error.message });
        }
        
        res.json({ success: true, data });
        
    } catch (error) {
        res.status(500).json({success: false, message: 'error interno del servidor'});
    }
}
const getRentalHistory = async (req, res) => {

 const userId = req.user ? req.user.id : null; 

 if (!userId) {
 
  return res.status(401).json({ success: false, message: 'ID de usuario no encontrado después de la autenticación' });
 }

  try {
    const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('tenant_id', userId); 

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