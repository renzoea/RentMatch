const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF.'));
    }
  },
});

// Middleware para subir un archivo PDF
exports.uploadMiddleware = upload.single('file');

// Subir PDF a Supabase Storage
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
    const filePath = `contracts/${fileName}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      return res.status(500).json({ error: 'Error al subir el archivo.' });
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    res.json({
      message: 'Archivo subido correctamente.',
      url: publicUrlData.publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};