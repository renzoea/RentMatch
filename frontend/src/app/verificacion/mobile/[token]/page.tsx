'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, CheckCircle, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Step = 'loading' | 'dni_front' | 'dni_back' | 'selfie' | 'dni_input' | 'processing' | 'success' | 'error';

export default function MobileVerificationPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [verificationResult, setVerificationResult] = useState<{status: string; notes: string} | null>(null);

  // Imágenes capturadas
  const [dniFrontImg, setDniFrontImg] = useState('');
  const [dniBackImg, setDniBackImg] = useState('');
  const [selfieImg, setSelfieImg] = useState('');
  const [manualDniInput, setManualDniInput] = useState('');

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
        // Ir a paso de ingreso de DNI en lugar de procesar directamente
        setStep('dni_input');
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

  const processVerification = async (dni: string) => {
    try {
      setStep('processing');
      setCurrentStep('Validando DNI...');

      // Crear elementos de imagen para procesamiento
      const dniFrontElement = document.createElement('img');
      dniFrontElement.src = dniFrontImg;
      await new Promise(resolve => dniFrontElement.onload = resolve);

      const selfieElement = document.createElement('img');
      selfieElement.src = selfieImg;
      await new Promise(resolve => selfieElement.onload = resolve);

      // Detectar rostros
      setCurrentStep('Detectando rostro en DNI...');
      const dniDetection = await detectFaceWithFallback(dniFrontElement);

      if (!dniDetection) {
        // Limpiar todas las fotos para empezar de nuevo
        setDniFrontImg('');
        setDniBackImg('');
        setSelfieImg('');
        setManualDniInput('');
        setError('No se pudo detectar el rostro en la foto del DNI. Intenta con mejor iluminación.');
        setStep('error');
        return;
      }

      setCurrentStep('Detectando rostro en selfie...');
      const selfieDetection = await detectFaceWithFallback(selfieElement);

      if (!selfieDetection) {
        // Limpiar todas las fotos para empezar de nuevo
        setDniFrontImg('');
        setDniBackImg('');
        setSelfieImg('');
        setManualDniInput('');
        setError('No se pudo detectar tu rostro en la selfie. Intenta de nuevo.');
        setStep('error');
        return;
      }

      // Calcular similitud facial
      setCurrentStep('Comparando rostros...');
      const distance = faceapi.euclideanDistance(dniDetection.descriptor, selfieDetection.descriptor);
      console.log('Face match distance:', distance);

      // Enviar al backend (el OCR se hará en el backend)
      setCurrentStep('Enviando verificación...');
      const response = await axios.post(`${API_URL}/api/verification/qr/submit/${token}`, {
        dni_number: dni,
        dni_front_base64: dniFrontImg,
        dni_back_base64: dniBackImg,
        selfie_base64: selfieImg,
        face_match_score: distance
      });

      // Guardar el resultado de la verificación
      if (response.data.verification) {
        setVerificationResult({
          status: response.data.verification.status,
          notes: response.data.verification.notes || ''
        });
      }

      setStep('success');
    } catch (error) {
      console.error('Error processing verification:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };

      // Log más detalles
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }

      const errorMessage = err.response?.data?.error || err.message || 'Error al procesar la verificación';
      console.error('Final error message:', errorMessage);

      // Limpiar todas las fotos para empezar de nuevo
      setDniFrontImg('');
      setDniBackImg('');
      setSelfieImg('');
      setManualDniInput('');
      setError(errorMessage);
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

  const handleDniSubmit = () => {
    // Validar que el DNI ingresado sea válido
    const cleanDNI = manualDniInput.replace(/[.\s-]/g, '');

    if (!/^\d{7,8}$/.test(cleanDNI)) {
      setError('Por favor ingresa un DNI válido de 7 u 8 dígitos');
      setStep('error');
      return;
    }

    const dniNum = parseInt(cleanDNI, 10);
    if (dniNum < 1000000 || dniNum > 99999999) {
      setError('El número de DNI ingresado no es válido');
      setStep('error');
      return;
    }

    // Procesar verificación con el DNI ingresado
    processVerification(cleanDNI);
  };

  const handleRetake = () => {
    if (step === 'processing' || step === 'error') {
      setDniFrontImg('');
      setDniBackImg('');
      setSelfieImg('');
      setManualDniInput('');
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
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error en la Verificación</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleRetake} className="w-full bg-orange-500 hover:bg-orange-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Volver a Empezar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    const isVerified = verificationResult?.status === 'verified';
    const isRejected = verificationResult?.status === 'rejected';
    const isPending = verificationResult?.status === 'pending';

    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            {isVerified && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">¡Verificación Aprobada!</h2>
                <p className="text-gray-600 mb-2">
                  Tu identidad ha sido verificada exitosamente.
                </p>
                {verificationResult.notes && (
                  <p className="text-sm text-gray-500 mb-4">{verificationResult.notes}</p>
                )}
                <p className="text-gray-600">
                  Puedes cerrar esta ventana.
                </p>
              </>
            )}
            {isRejected && (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-700 mb-2">Verificación Rechazada</h2>
                <p className="text-gray-600 mb-2">
                  No pudimos verificar tu identidad automáticamente.
                </p>
                {verificationResult.notes && (
                  <p className="text-sm text-gray-500 mb-4">{verificationResult.notes}</p>
                )}
                <p className="text-gray-600">
                  Por favor, intenta nuevamente con mejor iluminación o contacta a soporte.
                </p>
              </>
            )}
            {isPending && (
              <>
                <Loader2 className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-yellow-700 mb-2">Verificación en Proceso</h2>
                <p className="text-gray-600 mb-2">
                  Tu verificación está siendo revisada por nuestro equipo.
                </p>
                {verificationResult.notes && (
                  <p className="text-sm text-gray-500 mb-4">{verificationResult.notes}</p>
                )}
                <p className="text-gray-600">
                  Te notificaremos cuando esté lista. Puedes cerrar esta ventana.
                </p>
              </>
            )}
            {!verificationResult && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">¡Verificación Enviada!</h2>
                <p className="text-gray-600 mb-6">
                  Tu verificación ha sido enviada exitosamente. Puedes cerrar esta ventana.
                </p>
              </>
            )}
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
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 'dni_front' ? 'bg-orange-500' : step === 'dni_back' || step === 'selfie' || step === 'dni_input' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 'dni_back' ? 'bg-orange-500' : step === 'selfie' || step === 'dni_input' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 'selfie' ? 'bg-orange-500' : step === 'dni_input' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 'dni_input' ? 'bg-orange-500' : 'bg-gray-300'}`} />
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
            {step === 'dni_input' && (
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">🔢</span>
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
            {step === 'dni_input' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Número de DNI</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Ingresa tu número de DNI (7 u 8 dígitos) como aparece en tu documento.
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

            {step === 'dni_input' && (
              <>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 12345678"
                  value={manualDniInput}
                  onChange={(e) => {
                    // Solo permitir números, puntos y guiones
                    const value = e.target.value.replace(/[^0-9.-]/g, '');
                    setManualDniInput(value);
                  }}
                  className="text-center text-2xl py-6 font-semibold tracking-wider"
                  maxLength={10}
                />
                <Button
                  onClick={handleDniSubmit}
                  disabled={manualDniInput.length < 7}
                  className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg font-semibold shadow-lg disabled:opacity-50"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Continuar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
