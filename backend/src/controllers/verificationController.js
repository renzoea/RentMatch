const supabase = require('../config/supabase');
const Tesseract = require('tesseract.js');
const crypto = require('crypto');
const {
  isValidDNIFormat,
  normalizeDNI,
  extractDNIFromText,
  nameSimilarity
} = require('../utils/dniValidator');

// Función para generar UUID
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Submit identity verification with DNI images and selfie
 * POST /api/verification/submit
 * Body: { dni_number, dni_front_base64, dni_back_base64, selfie_base64, face_match_score }
 */
exports.submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      dni_number,
      dni_front_base64,
      dni_back_base64,
      selfie_base64,
      face_match_score,
      extracted_name,
      ocr_confidence
    } = req.body;

    console.log('[submitVerification] Starting verification for user:', userId);

    // Validaciones básicas
    if (!dni_number || !dni_front_base64 || !selfie_base64) {
      return res.status(400).json({
        error: 'DNI number, foto del frente del DNI y selfie son requeridos'
      });
    }

    if (!face_match_score || typeof face_match_score !== 'number') {
      return res.status(400).json({
        error: 'Face match score es requerido'
      });
    }

    // Validar formato DNI
    const cleanDNI = normalizeDNI(dni_number);
    const dniFormatValid = isValidDNIFormat(cleanDNI);

    if (!dniFormatValid) {
      return res.status(400).json({
        error: 'El formato del DNI no es válido. Debe ser un número de 7 u 8 dígitos'
      });
    }

    // Verificar si el usuario ya tiene una verificación pendiente o aprobada
    const { data: existingVerification, error: existingError } = await supabase
      .from('identity_verifications')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'verified'])
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingVerification) {
      if (existingVerification.status === 'verified') {
        return res.status(400).json({
          error: 'Tu identidad ya está verificada'
        });
      }
      if (existingVerification.status === 'pending') {
        return res.status(400).json({
          error: 'Ya tienes una verificación en proceso de revisión'
        });
      }
    }

    // Obtener el perfil del usuario para comparar nombre
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    console.log('[submitVerification] Profile retrieved:', { full_name: profile.full_name });

    // Subir imágenes a Supabase Storage
    const timestamp = Date.now();
    const dniFrontPath = `${userId}/dni-front-${timestamp}.jpg`;
    const dniFrontBuffer = Buffer.from(dni_front_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { error: uploadFrontError } = await supabase.storage
      .from('identity-documents')
      .upload(dniFrontPath, dniFrontBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadFrontError) {
      console.error('[submitVerification] Error uploading DNI front:', uploadFrontError);
      throw new Error('Error al subir la imagen del DNI frente');
    }

    // Subir DNI back si existe
    let dniBackPath = null;
    if (dni_back_base64) {
      dniBackPath = `${userId}/dni-back-${timestamp}.jpg`;
      const dniBackBuffer = Buffer.from(dni_back_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      const { error: uploadBackError } = await supabase.storage
        .from('identity-documents')
        .upload(dniBackPath, dniBackBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadBackError) {
        console.error('[submitVerification] Error uploading DNI back:', uploadBackError);
        // No es crítico, continuar sin la imagen del dorso
        dniBackPath = null;
      }
    }

    // Subir selfie
    const selfiePath = `${userId}/selfie-${timestamp}.jpg`;
    const selfieBuffer = Buffer.from(selfie_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { error: uploadSelfieError } = await supabase.storage
      .from('identity-documents')
      .upload(selfiePath, selfieBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadSelfieError) {
      console.error('[submitVerification] Error uploading selfie:', uploadSelfieError);
      throw new Error('Error al subir la selfie');
    }

    console.log('[submitVerification] Images uploaded successfully');

    // El OCR se ejecuta en el frontend y viene en extracted_name y ocr_confidence
    console.log('[submitVerification] OCR data from frontend:', {
      extracted_name,
      ocr_confidence
    });

    // Determinar estado automático basado en validaciones
    let autoStatus = 'pending'; // Por defecto, requiere revisión manual
    let statusReason = null;

    // Criterios para aprobación automática (ajustados sin OCR)
    const FACE_MATCH_THRESHOLD = 0.6; // Distancia euclidiana máxima aceptable

    if (face_match_score > FACE_MATCH_THRESHOLD) {
      autoStatus = 'rejected';
      statusReason = `La foto del DNI y la selfie no coinciden suficientemente (score: ${face_match_score.toFixed(3)})`;
    } else if (dniFormatValid && face_match_score <= FACE_MATCH_THRESHOLD) {
      // Aprobación automática basada solo en formato DNI y match facial
      autoStatus = 'verified';
      statusReason = `Verificación automática exitosa - Match facial: ${face_match_score.toFixed(3)}`;
    }

    console.log('[submitVerification] Auto status determined:', autoStatus);

    // Crear registro de verificación
    const { data: verification, error: verificationError } = await supabase
      .from('identity_verifications')
      .insert({
        user_id: userId,
        dni_number: cleanDNI,
        dni_front_url: dniFrontPath,
        dni_back_url: dniBackPath,
        selfie_url: selfiePath,
        full_name: extracted_name,
        face_match_score: face_match_score,
        dni_format_valid: dniFormatValid,
        ocr_confidence: ocr_confidence,
        status: autoStatus,
        notes: statusReason,
        reviewed_at: autoStatus === 'verified' || autoStatus === 'rejected' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (verificationError) {
      console.error('[submitVerification] Error creating verification:', verificationError);
      throw verificationError;
    }

    // Si fue verificado automáticamente, actualizar el status del perfil
    if (autoStatus === 'verified') {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          status: 'verified',
          status_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateProfileError) {
        console.error('[submitVerification] Error updating profile status:', updateProfileError);
      }
    }

    console.log('[submitVerification] Verification created successfully:', verification.id);

    res.status(201).json({
      message: 'Verificación enviada exitosamente',
      verification: {
        id: verification.id,
        status: verification.status,
        notes: verification.notes
      }
    });
  } catch (error) {
    console.error('[submitVerification] Error:', error);
    res.status(500).json({ error: 'Error al procesar la verificación' });
  }
};

/**
 * Get current user's verification status
 * GET /api/verification/status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: verification, error } = await supabase
      .from('identity_verifications')
      .select('id, status, submitted_at, reviewed_at, notes')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!verification) {
      return res.json({
        has_verification: false,
        status: null
      });
    }

    res.json({
      has_verification: true,
      verification
    });
  } catch (error) {
    console.error('[getVerificationStatus] Error:', error);
    res.status(500).json({ error: 'Error al obtener el estado de verificación' });
  }
};

/**
 * Get all verification requests (admin only)
 * GET /api/verification/admin/list
 */
exports.listVerifications = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('identity_verifications')
      .select(`
        id,
        user_id,
        dni_number,
        full_name,
        status,
        face_match_score,
        dni_format_valid,
        ocr_confidence,
        submitted_at,
        reviewed_at,
        notes,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: verifications, error } = await query;

    if (error) throw error;

    res.json({ verifications });
  } catch (error) {
    console.error('[listVerifications] Error:', error);
    res.status(500).json({ error: 'Error al listar verificaciones' });
  }
};

/**
 * Review a verification request (admin only)
 * PATCH /api/verification/admin/review/:id
 */
exports.reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Status debe ser "verified" o "rejected"'
      });
    }

    // Obtener la verificación
    const { data: verification, error: verificationError } = await supabase
      .from('identity_verifications')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (verificationError) throw verificationError;

    if (!verification) {
      return res.status(404).json({ error: 'Verificación no encontrada' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({
        error: 'Solo se pueden revisar verificaciones pendientes'
      });
    }

    // Actualizar verificación
    const { error: updateError } = await supabase
      .from('identity_verifications')
      .update({
        status,
        notes,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Actualizar perfil del usuario si fue verificado
    if (status === 'verified') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'verified',
          status_at: new Date().toISOString()
        })
        .eq('id', verification.user_id);

      if (profileError) {
        console.error('[reviewVerification] Error updating profile:', profileError);
      }
    }

    res.json({
      message: `Verificación ${status === 'verified' ? 'aprobada' : 'rechazada'} exitosamente`
    });
  } catch (error) {
    console.error('[reviewVerification] Error:', error);
    res.status(500).json({ error: 'Error al revisar la verificación' });
  }
};

/**
 * Create a verification session with QR code
 * POST /api/verification/qr/create
 */
exports.createQRSession = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('[createQRSession] Creating session for user:', userId);

    // Generar token único para la sesión
    const sessionToken = generateUUID();

    // Crear sesión en la base de datos
    const { data: session, error: sessionError } = await supabase
      .from('verification_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutos
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[createQRSession] Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('[createQRSession] Session created:', session.id);

    // Retornar el token para generar el QR en el frontend
    res.json({
      session_token: sessionToken,
      expires_at: session.expires_at
    });
  } catch (error) {
    console.error('[createQRSession] Error:', error);
    res.status(500).json({ error: 'Error al crear sesión de verificación' });
  }
};

/**
 * Get session status (polling endpoint)
 * GET /api/verification/qr/session/:token
 */
exports.getQRSession = async (req, res) => {
  try {
    const { token } = req.params;

    const { data: session, error } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }
      throw error;
    }

    // Verificar si expiró
    if (new Date(session.expires_at) < new Date()) {
      return res.json({
        status: 'expired',
        message: 'La sesión ha expirado'
      });
    }

    res.json({
      status: session.status,
      completed_at: session.completed_at
    });
  } catch (error) {
    console.error('[getQRSession] Error:', error);
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
};

/**
 * Submit verification data from mobile
 * POST /api/verification/qr/submit/:token
 */
exports.submitQRVerification = async (req, res) => {
  try {
    const { token } = req.params;
    const {
      dni_number,
      dni_front_base64,
      dni_back_base64,
      selfie_base64,
      face_match_score,
      extracted_name,
      ocr_confidence
    } = req.body;

    console.log('[submitQRVerification] Processing mobile submission for token:', token);

    // Validaciones básicas
    if (!dni_number || !dni_front_base64 || !selfie_base64) {
      return res.status(400).json({
        error: 'DNI number, foto del frente del DNI y selfie son requeridos'
      });
    }

    if (!face_match_score || typeof face_match_score !== 'number') {
      return res.status(400).json({
        error: 'Face match score es requerido'
      });
    }

    // Obtener la sesión
    const { data: session, error: sessionError } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (sessionError) {
      console.error('[submitQRVerification] Session not found:', sessionError);
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Verificar si ya fue completada
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Esta sesión ya fue completada' });
    }

    // Verificar si expiró
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ error: 'La sesión ha expirado' });
    }

    const userId = session.user_id;

    // Validar formato DNI
    const cleanDNI = normalizeDNI(dni_number);
    const dniFormatValid = isValidDNIFormat(cleanDNI);

    if (!dniFormatValid) {
      return res.status(400).json({
        error: 'El formato del DNI no es válido. Debe ser un número de 7 u 8 dígitos'
      });
    }

    // Verificar si el usuario ya tiene una verificación pendiente o aprobada
    const { data: existingVerification, error: existingError } = await supabase
      .from('identity_verifications')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'verified'])
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingVerification) {
      if (existingVerification.status === 'verified') {
        return res.status(400).json({
          error: 'Tu identidad ya está verificada'
        });
      }
      if (existingVerification.status === 'pending') {
        return res.status(400).json({
          error: 'Ya tienes una verificación en proceso de revisión'
        });
      }
    }

    // Subir imágenes a Supabase Storage
    const timestamp = Date.now();
    const dniFrontPath = `${userId}/dni-front-${timestamp}.jpg`;
    const dniFrontBuffer = Buffer.from(dni_front_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { error: uploadFrontError } = await supabase.storage
      .from('identity-documents')
      .upload(dniFrontPath, dniFrontBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadFrontError) {
      console.error('[submitQRVerification] Error uploading DNI front:', uploadFrontError);
      throw new Error('Error al subir la imagen del DNI frente');
    }

    // Subir DNI back si existe
    let dniBackPath = null;
    if (dni_back_base64) {
      dniBackPath = `${userId}/dni-back-${timestamp}.jpg`;
      const dniBackBuffer = Buffer.from(dni_back_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      const { error: uploadBackError } = await supabase.storage
        .from('identity-documents')
        .upload(dniBackPath, dniBackBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadBackError) {
        console.error('[submitQRVerification] Error uploading DNI back:', uploadBackError);
        dniBackPath = null;
      }
    }

    // Subir selfie
    const selfiePath = `${userId}/selfie-${timestamp}.jpg`;
    const selfieBuffer = Buffer.from(selfie_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { error: uploadSelfieError } = await supabase.storage
      .from('identity-documents')
      .upload(selfiePath, selfieBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadSelfieError) {
      console.error('[submitQRVerification] Error uploading selfie:', uploadSelfieError);
      throw new Error('Error al subir la selfie');
    }

    console.log('[submitQRVerification] Images uploaded successfully');

    // Ejecutar OCR en el DNI (opcional - si falla, continuar sin nombre)
    let extractedName = null;
    let ocrConfidence = 0;

    try {
      console.log('[submitQRVerification] Starting OCR processing...');
      const ocrResult = await Tesseract.recognize(dniFrontBuffer, 'spa', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = ocrResult.data.text;
      ocrConfidence = Math.round(ocrResult.data.confidence);
      console.log('[submitQRVerification] OCR confidence:', ocrConfidence);

      // Intentar extraer el nombre del texto
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const namePattern = /^[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s]{2,}$/;
      const possibleNames = lines.filter(line => namePattern.test(line));

      if (possibleNames.length > 0) {
        extractedName = possibleNames.slice(0, 2).join(' ');
        console.log('[submitQRVerification] Extracted name:', extractedName);
      }
    } catch (ocrError) {
      console.error('[submitQRVerification] OCR failed:', ocrError);
      // Continuar sin nombre extraído
    }

    // Determinar estado automático
    let autoStatus = 'pending';
    let statusReason = null;
    const FACE_MATCH_THRESHOLD = 0.6;

    if (face_match_score > FACE_MATCH_THRESHOLD) {
      autoStatus = 'rejected';
      statusReason = `La foto del DNI y la selfie no coinciden suficientemente (score: ${face_match_score.toFixed(3)})`;
    } else if (dniFormatValid && face_match_score <= FACE_MATCH_THRESHOLD) {
      autoStatus = 'verified';
      statusReason = `Verificación automática exitosa - Match facial: ${face_match_score.toFixed(3)}`;
    }

    console.log('[submitQRVerification] Auto status determined:', autoStatus);

    // Crear registro de verificación
    const { data: verification, error: verificationError } = await supabase
      .from('identity_verifications')
      .insert({
        user_id: userId,
        dni_number: cleanDNI,
        dni_front_url: dniFrontPath,
        dni_back_url: dniBackPath,
        selfie_url: selfiePath,
        full_name: extractedName,
        face_match_score: face_match_score,
        dni_format_valid: dniFormatValid,
        ocr_confidence: ocrConfidence,
        status: autoStatus,
        notes: statusReason,
        reviewed_at: autoStatus === 'verified' || autoStatus === 'rejected' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (verificationError) {
      console.error('[submitQRVerification] Error creating verification:', verificationError);
      throw verificationError;
    }

    // Si fue verificado automáticamente, actualizar el status del perfil
    if (autoStatus === 'verified') {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          status: 'verified',
          status_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateProfileError) {
        console.error('[submitQRVerification] Error updating profile status:', updateProfileError);
      }
    }

    // Actualizar la sesión como completada
    await supabase
      .from('verification_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('session_token', token);

    console.log('[submitQRVerification] Verification created successfully:', verification.id);

    // Emitir evento WebSocket para notificar al desktop
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(token).emit('verification-complete', {
          status: verification.status,
          notes: verification.notes
        });
        console.log('[submitQRVerification] WebSocket event emitted to token:', token);
      } else {
        console.warn('[submitQRVerification] Socket.io not available, skipping WebSocket emit');
      }
    } catch (wsError) {
      console.error('[submitQRVerification] Error emitting WebSocket event:', wsError);
      // No lanzar error, solo loguearlo
    }

    res.status(201).json({
      message: 'Verificación enviada exitosamente',
      verification: {
        id: verification.id,
        status: verification.status,
        notes: verification.notes
      }
    });
  } catch (error) {
    console.error('[submitQRVerification] Error:', error);
    res.status(500).json({ error: 'Error al procesar la verificación' });
  }
};

// No need to re-export, exports is already module.exports
