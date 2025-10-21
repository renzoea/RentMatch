const supabase = require('../config/supabase');

const ReporterUpdate = async (req, res) => {
  const reporterId = req.user ? req.user.id : null;
  if (!reporterId) {
    return res.status(401).json({ success: false, message: 'Autenticación requerida.' });
  }

  const { contract_id, razon, descripcion } = req.body;

  // Solo exigimos contract_id y razón
  if (!contract_id || !razon) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: contract_id y razón.'
    });
  }

  try {
    // Verifica que el contrato exista y pertenezca al usuario
    const { data: contract, error: cErr } = await supabase
      .from('contracts')
      .select('id, tenant_id')
      .eq('id', contract_id)
      .single();

    if (cErr || !contract) {
      return res.status(404).json({ success: false, message: 'Contrato no encontrado.' });
    }
    if (contract.tenant_id !== reporterId) {
      return res.status(403).json({ success: false, message: 'No autorizado para este contrato.' });
    }

    // La fecha será el momento de creación (created_at en DB)
    const payload = {
      contract_id,
      reporter_id: reporterId,
      title: razon,
      description: descripcion ?? '',
      status: 'open' // ajusta al valor existente en tu enum incident_status
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Error al crear el incidente', error: error.message });
    }

    return res.status(201).json({ success: true, message: 'Incidente creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error interno', error: e.message });
  }
};

module.exports = { ReporterUpdate };