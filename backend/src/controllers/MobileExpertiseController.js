const supabase = require('../config/supabase');

const NewExpertise = async (req, res) => {
  try {
    const { reason, description, date, phone, email } = req.body;

    // Validaciones básicas
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'El campo reason es obligatorio'
      });
    }

    const payload = {
      contract_id,
      tenet_id,
      reason,
      description: description || '',
      date: date || null,
      phone: phone || null,
      email: email || ''
    };

    const { data, error } = await supabase
      .from('expertise')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear expertise',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Expertise creada exitosamente',
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno',
      error: error.message
    });
  }
};

const getAllEcpertise = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expertise')
      .select('*');

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al obtener expertises',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno',
      error: error.message
    });
  }
};

module.exports = {
  NewExpertise,
  getAllEcpertise
};