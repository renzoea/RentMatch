const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');

// Configuración de multer para almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos temporalmente
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|jfif|png|pdf|doc|docx|octet-stream/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({ storage, fileFilter });

const IncialState = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Autenticación requerida.' });
  }

  const { contract_id, description } = req.body;

  if (!contract_id) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: contract_id y archivo.',
    });
  }

  try {
    // Verifica que el contrato exista y pertenezca al usuario
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, tenant_id')
      .eq('id', contract_id)
      .single();

    if (contractError || !contract) {
      return res.status(404).json({ success: false, message: 'Contrato no encontrado.' });
    }
    if (contract.tenant_id !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para este contrato.' });
    }

    // Insertar en la tabla inicial_state_report
    const { data: report, error: reportError } = await supabase
      .from('inicial_state_report')
      .insert({
        contract_id,
        tenant_id: userId,
        description: description || null
      })
      .select()
      .single();

    if (reportError) {
      return res.status(500).json({ success: false, message: 'Error al guardar el reporte.', error: reportError.message });
    }

    // Si hay archivos, guardarlos en la tabla de adjuntos
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        inicial_state_id: report.id,
        file_url: path.join('uploads', file.filename),
        media_type: file.mimetype
      }));

      const { error: attachError } = await supabase
        .from('inicial_state_attachments')
        .insert(attachments);

      if (attachError) {
        return res.status(500).json({
          success: false,
          message: 'Error al guardar los archivos adjuntos',
          error: attachError.message
        });
      }
    }

    return res.status(201).json({ success: true, message: 'Reporte creado exitosamente.', data: report });
  } catch (error) {
    console.error('Error interno:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno.', error: error.message });
  }
};

module.exports = {
  IncialState,
  upload,
};