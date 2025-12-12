const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => { 
  const allowedTypes = /jpeg|jpg|jfif|png|pdf|doc|docx|octet-stream/;
  console.log(`Tipo de archivo recibido: ${file.mimetype}`);
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`Tipo de archivo no permitido: ${file.mimetype}`);
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};
const upload = multer({ storage, fileFilter });


const ReporterUpdate = async (req, res) => {
  const reporterId = req.user ? req.user.id : null;
  if (!reporterId) {
    return res.status(401).json({ success: false, message: 'Autenticación requerida.' });
  }

  const { contract_id, razon, descripcion, urgency } = req.body;
  const validUrgencies = ['Bajo', 'Media', 'Alta'];

  // Solo exigimos contract_id y razón
  if (!contract_id || !razon) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: contract_id y razón.'
    });
  }

  if (urgency && !validUrgencies.includes(urgency)) {
    return res.status(400).json({
      succese: false,
      message: 'Valor de urgencia inválido. Valores permitidos: Bajo, Medio, Alta.'
    })
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
      status: 'open', // ajusta al valor existente en tu enum incident_status
      urgency: urgency ?? 'Bajo' // valor por defecto si no se proporciona
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert(payload)
      .select()
      .single();
    

    if (error) {
      return res.status(400).json({ success: false, message: 'Error al crear el incidente', error: error.message });
    }

    if (req.files && req.files.length > 0) {
      // Manejar archivos adjuntos si existen
      const attachments = req.files.map(file => ({
        incident_id: data.id, // Relación con el incidente
        file_url: path.join('uploads', file.filename), // Ruta del archivo
        media_type: file.mimetype // Tipo MIME del archivo
      }));
      
      const { error: attachError } = await supabase
  .from('incident_attachments')
  .insert(attachments);

  if (attachError) {
    return res.status(500).json({ success: false, message: 'Error al guardar los archivos adjuntos', error: attachError.message });
  }
      
    }
    return res.status(201).json({ success: true, message: 'Incidente creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error interno', error: e.message });
  }
};


const getAllReport = async (req, res) => {
  try {
    const { contract_id } = req.query;

    if (!contract_id) {
      return res.status(400).json({
        success: false,
        message: 'contract_id es requerido en query (?contract_id=123)'
      });
    }

    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        incident_attachments (
          id,
          file_url,
          media_type,
          created_at
        )
      `)
      .eq('contract_id', contract_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Error al obtener los reportes', error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error interno', error: e.message });
  }
};


module.exports = {
  getAllReport,
  ReporterUpdate,
  upload
 };