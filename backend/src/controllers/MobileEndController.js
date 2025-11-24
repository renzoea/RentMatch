const { differenceInDays } = require('date-fns');
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

const EndState = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Autenticación requerida.' });
  }

  const { contract_id } = req.body;

  if (!contract_id || !req.file) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: contract_id y archivo.',
    });
  }

  try {
    // Verifica que el contrato exista y pertenezca al usuario
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, tenant_id, end_date') // Asegúrate de que `end_date` sea el campo correcto
      .eq('id', contract_id)
      .single();

    if (contractError || !contract) {
      return res.status(404).json({ success: false, message: 'Contrato no encontrado.' });
    }
    if (contract.tenant_id !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para este contrato.' });
    }

    // Validar que falten 5 días o menos para que termine el contrato
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const daysRemaining = differenceInDays(endDate, today);

    if (daysRemaining > 5) {
      return res.status(403).json({
        success: false,
        message: `Solo puedes acceder 5 días antes de que termine el contrato. Días restantes: ${daysRemaining}.`,
      });
    }

    // Ruta del archivo subido
    const archivoUrl = path.join('uploads', req.file.filename);

    // Insertar en la tabla inicial_state_report
    const { data: report, error: reportError } = await supabase
      .from('end_state_report')
      .insert({
        contract_id,
        tenant_id: userId,
        archivo_url: archivoUrl,
        created_at: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        description
      })
      .select()
      .single();

    if (reportError) {
      return res.status(500).json({ success: false, message: 'Error al guardar el reporte.', error: reportError.message });
    }

    return res.status(201).json({ success: true, message: 'Reporte creado exitosamente.', data: report });
  } catch (error) {
    console.error('Error interno:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno.', error: error.message });
  }
};

module.exports = {
  EndState,
  upload,
};