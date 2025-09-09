// backend/src/controllers/profileController.js
const supabase = require('../config/supabase');

const getAllProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
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

const createProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name y email son requeridos'
      });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ name, email }])
      .select();
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Perfil no encontrado'
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    res.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = { 
  getAllProfiles,
  createProfile,
  getProfileById
};