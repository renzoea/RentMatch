'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CheckCircle, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import Tesseract from 'tesseract.js';

const MODEL_URL = '/models';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Step = 'loading' | 'dni_front' | 'dni_back' | 'selfie' | 'processing' | 'success' | 'error';

export default function MobileVerificationPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  // Imágenes capturadas
  const [dniFrontImg, setDniFrontImg] = useState('');
  const [dniBackImg, setDniBackImg] = useState('');
  const [selfieImg, setSelfieImg] = useState('');
  const [dniNumber, setDniNumber] = useState('');

  // Referencias para input file
  const dniFrontInputRef = useRef<HTMLInputElement>(null);
  const dniBackInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Face API
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const validateSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/verification/qr/session/${token}`);

      if (response.data.status === 'expired') {
        setError('Esta sesión ha expirado');
        setStep('error');
        return;
      }

      if (response.data.status === 'completed') {
        setError('Esta sesión ya fue completada');
        setStep('error');
        return;
      }

      // Cargar modelos de face-api
      await loadFaceAPIModels();

      setStep('dni_front');
    } catch (error) {
      console.error('Error validating session:', error);
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Sesión no válida');
      setStep('error');
    }
  };

  const loadFaceAPIModels = async () => {
    try {
      if (modelsLoaded) return;

      console.log('[Face API] Cargando modelos...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      setModelsLoaded(true);
      console.log('[Face API] Modelos cargados exitosamente');
    } catch (error) {
      console.error('[Face API] Error cargando modelos:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación 1: Tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Por favor selecciona una imagen válida (JPEG, PNG o WEBP)');
      setStep('error');
      return;
    }

    // Validación 2: Tamaño del archivo (máximo 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      setError('La imagen es demasiado grande. El tamaño máximo es 10MB.');
      setStep('error');
      return;
    }

    // Validación 3: Tamaño mínimo (evitar archivos corruptos)
    const minSizeInBytes = 10 * 1024; // 10KB
    if (file.size < minSizeInBytes) {
      setError('La imagen es demasiado pequeña o está corrupta. Por favor toma otra foto.');
      setStep('error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      // Validación 4: Dimensiones de la imagen
      const img = new Image();
      img.src = base64;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      }).catch(() => {
        setError('No se pudo cargar la imagen. Por favor intenta de nuevo.');
        setStep('error');
        return;
      });

      // Validar dimensiones mínimas
      const minWidth = type === 'selfie' ? 480 : 640; // Selfie puede ser más pequeña
      const minHeight = type === 'selfie' ? 640 : 480;

      if (img.width < minWidth || img.height < minHeight) {
        setError(`La imagen es demasiado pequeña. Dimensiones mínimas: ${minWidth}x${minHeight}px`);
        setStep('error');
        return;
      }

      // Validación 5: Relación de aspecto razonable (evitar imágenes muy distorsionadas)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.3 || aspectRatio > 3.5) {
        setError('La imagen tiene una relación de aspecto inválida. Por favor toma otra foto.');
        setStep('error');
        return;
      }

      // Todas las validaciones pasaron, proceder normalmente
      if (type === 'front') {
        setDniFrontImg(base64);
        setStep('dni_back');
      } else if (type === 'back') {
        setDniBackImg(base64);
        setStep('selfie');
      } else if (type === 'selfie') {
        setSelfieImg(base64);
        setStep('processing');
        processVerification(dniFrontImg, dniBackImg, base64);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo. Por favor intenta de nuevo.');
      setStep('error');
    };

    reader.readAsDataURL(file);
  };

  const handleCaptureDNIFront = () => {
    dniFrontInputRef.current?.click();
  };

  const handleCaptureDNIBack = () => {
    dniBackInputRef.current?.click();
  };

  const handleCaptureSelfie = () => {
    selfieInputRef.current?.click();
  };

  const processVerification = async (dniFront: string, dniBack: string, selfie: string) => {
    try {
      setCurrentStep('Validando DNI...');

      // Crear elementos de imagen para procesamiento
      const dniFrontElement = document.createElement('img');
      dniFrontElement.src = dniFront;
      await new Promise(resolve => dniFrontElement.onload = resolve);

      const selfieElement = document.createElement('img');
      selfieElement.src = selfie;
      await new Promise(resolve => selfieElement.onload = resolve);

      // Detectar rostros
      setCurrentStep('Detectando rostro en DNI...');
      const dniDetection = await detectFaceWithFallback(dniFrontElement);

      if (!dniDetection) {
        setError('No se pudo detectar el rostro en la foto del DNI. Intenta con mejor iluminación.');
        setStep('error');
        return;
      }

      setCurrentStep('Detectando rostro en selfie...');
      const selfieDetection = await detectFaceWithFallback(selfieElement);

      if (!selfieDetection) {
        setError('No se pudo detectar tu rostro en la selfie. Intenta de nuevo.');
        setStep('error');
        return;
      }

      // Calcular similitud facial
      setCurrentStep('Comparando rostros...');
      const distance = faceapi.euclideanDistance(dniDetection.descriptor, selfieDetection.descriptor);
      console.log('Face match distance:', distance);

      // Ejecutar OCR
      setCurrentStep('Extrayendo información del DNI...');
      const ocrResult = await extractTextFromDNI(dniFrontElement);

      // Validar que se extrajo un DNI
      const finalDNI = ocrResult.extractedDNI || dniNumber;
      console.log('[Verification] Final DNI to send:', finalDNI);
      console.log('[Verification] OCR extracted DNI:', ocrResult.extractedDNI);
      console.log('[Verification] State DNI:', dniNumber);

      if (!finalDNI || finalDNI === 'NO_DETECTADO') {
        setError('No se pudo extraer el número de DNI de la imagen. Por favor intenta de nuevo con mejor iluminación.');
        setStep('error');
        return;
      }

      // Enviar al backend
      setCurrentStep('Enviando verificación...');
      await axios.post(`${API_URL}/api/verification/qr/submit/${token}`, {
        dni_number: finalDNI,
        dni_front_base64: dniFront,
        dni_back_base64: dniBack,
        selfie_base64: selfie,
        face_match_score: distance,
        extracted_name: ocrResult.extractedName,
        ocr_confidence: ocrResult.confidence
      });

      setStep('success');
    } catch (error) {
      console.error('Error processing verification:', error);
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Error al procesar la verificación');
      setStep('error');
    }
  };

  const detectFaceWithFallback = async (imageElement: HTMLImageElement) => {
    const inputSizes = [512, 1024, 416, 320];

    for (const inputSize of inputSizes) {
      try {
        console.log(`Trying face detection with inputSize=${inputSize}`);
        const detection = await faceapi
          .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          console.log(`Face detected with inputSize=${inputSize}`);
          return detection;
        }
      } catch (error) {
        console.error(`Error with inputSize=${inputSize}:`, error);
      }
    }

    return null;
  };

  const extractTextFromDNI = async (imageElement: HTMLImageElement) => {
    try {
      setCurrentStep('Ejecutando OCR...');

      const { data: { text, confidence } } = await Tesseract.recognize(
        imageElement,
        'spa',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setCurrentStep(`OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log('OCR Text:', text);
      console.log('OCR Confidence:', confidence);

      // Intentar extraer el nombre del texto
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const namePattern = /^[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s]{2,}$/;
      const possibleNames = lines.filter(line => namePattern.test(line));

      let extractedName = null;
      if (possibleNames.length > 0) {
        extractedName = possibleNames.slice(0, 2).join(' ');
        console.log('Extracted name:', extractedName);
      }

      // Intentar extraer el número de DNI (7 u 8 dígitos)
      // Primero limpiar el texto de caracteres especiales que OCR puede confundir
      const cleanText = text.replace(/[^0-9\s.-]/g, ' ');

      // Buscar diferentes patrones de DNI
      const dniPatterns = [
        /\b(\d{2}\.?\d{3}\.?\d{3})\b/,  // Formato: 12.345.678
        /\b(\d{1}\.?\d{3}\.?\d{3})\b/,  // Formato: 1.234.567
        /\b(\d{7,8})\b/                  // Formato: 12345678 o 1234567
      ];

      let extractedDNI = null;
      for (const pattern of dniPatterns) {
        const match = cleanText.match(pattern);
        if (match) {
          // Limpiar el DNI de puntos y espacios
          extractedDNI = match[1].replace(/[.\s-]/g, '');

          // Validar que tenga 7 u 8 dígitos
          if (/^\d{7,8}$/.test(extractedDNI)) {
            const dniNumber = parseInt(extractedDNI, 10);
            // Validar que esté en un rango razonable
            if (dniNumber >= 1000000 && dniNumber <= 99999999) {
              console.log('Extracted DNI:', extractedDNI);
              setDniNumber(extractedDNI);
              break;
            }
          }
          extractedDNI = null; // Reset si no pasó validación
        }
      }

      return {
        fullText: text,
        extractedName,
        extractedDNI,
        confidence: Math.round(confidence)
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        fullText: '',
        extractedName: null,
        extractedDNI: null,
        confidence: 0
      };
    }
  };

  const handleRetake = () => {
    if (step === 'processing' || step === 'error') {
      setDniFrontImg('');
      setDniBackImg('');
      setSelfieImg('');
      setError('');
      setStep('dni_front');
    }
  };


  if (step === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {dniFrontImg && (
              <Button onClick={handleRetake} className="bg-orange-500 hover:bg-orange-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Intentar de Nuevo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Verificación Enviada!</h2>
            <p className="text-gray-600 mb-6">
              Tu verificación ha sido enviada exitosamente. Puedes cerrar esta ventana.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Procesando...</h2>
            <p className="text-gray-600">{currentStep}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Inputs ocultos para captura de fotos */}
      <input
        ref={dniFrontInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'front')}
      />
      <input
        ref={dniBackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'back')}
      />
      <input
        ref={selfieInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'selfie')}
      />

      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center text-gray-800">Verificación de Identidad</h1>
          <div className="flex justify-center gap-2 mt-2">
            <div className={`h-2 w-16 rounded-full transition-colors ${step !== 'selfie' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step === 'dni_back' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step === 'selfie' ? 'bg-orange-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Ícono */}
          <div className="flex justify-center mb-6">
            {step === 'dni_front' && (
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">📄</span>
              </div>
            )}
            {step === 'dni_back' && (
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">📄</span>
              </div>
            )}
            {step === 'selfie' && (
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">🤳</span>
              </div>
            )}
          </div>

          {/* Instrucciones */}
          <div className="text-center mb-8">
            {step === 'dni_front' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Foto del DNI - Frente</h2>
                <p className="text-gray-600 text-sm">
                  Toma una foto clara del frente de tu DNI. Asegúrate de que todos los datos sean legibles.
                </p>
              </>
            )}
            {step === 'dni_back' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Foto del DNI - Dorso</h2>
                <p className="text-gray-600 text-sm">
                  Ahora toma una foto del dorso de tu DNI.
                </p>
              </>
            )}
            {step === 'selfie' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Selfie</h2>
                <p className="text-gray-600 text-sm">
                  Toma una selfie mirando a la cámara. Asegúrate de que tu rostro esté bien iluminado.
                </p>
              </>
            )}
          </div>

          {/* Botones */}
          <div className="space-y-3">
            {step === 'dni_front' && (
              <Button
                onClick={handleCaptureDNIFront}
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg font-semibold shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Tomar Foto del Frente
              </Button>
            )}

            {step === 'dni_back' && (
              <Button
                onClick={handleCaptureDNIBack}
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg font-semibold shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Tomar Foto del Dorso
              </Button>
            )}

            {step === 'selfie' && (
              <Button
                onClick={handleCaptureSelfie}
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg font-semibold shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Tomar Selfie
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
