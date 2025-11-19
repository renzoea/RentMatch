'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CheckCircle, Loader2, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import Tesseract from 'tesseract.js';

const MODEL_URL = '/models';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Step = 'loading' | 'dni_front' | 'dni_back' | 'selfie' | 'processing' | 'success' | 'error';

export default function MobileVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('');

  // Imágenes capturadas
  const [dniFrontImg, setDniFrontImg] = useState('');
  const [dniBackImg, setDniBackImg] = useState('');
  const [selfieImg, setSelfieImg] = useState('');
  const [dniNumber, setDniNumber] = useState('');

  // Cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Face API
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    validateSession();
  }, [token]);

  useEffect(() => {
    if (step === 'dni_front' || step === 'dni_back' || step === 'selfie') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [step, facingMode]);

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

  const startCamera = async () => {
    try {
      stopCamera(); // Detener cámara anterior si existe

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCaptureDNIFront = () => {
    const photo = capturePhoto();
    if (photo) {
      setDniFrontImg(photo);
      setStep('dni_back');
    }
  };

  const handleCaptureDNIBack = () => {
    const photo = capturePhoto();
    if (photo) {
      setDniBackImg(photo);
      // Cambiar a cámara frontal para la selfie
      setFacingMode('user');
      setStep('selfie');
    }
  };

  const handleCaptureSelfie = () => {
    const photo = capturePhoto();
    if (photo) {
      setSelfieImg(photo);
      stopCamera();
      setStep('processing');
      processVerification(dniFrontImg, dniBackImg, photo);
    }
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

      // Enviar al backend
      setCurrentStep('Enviando verificación...');
      await axios.post(`${API_URL}/api/verification/qr/submit/${token}`, {
        dni_number: dniNumber || '00000000', // Requiere número de DNI
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

      return {
        fullText: text,
        extractedName,
        confidence: Math.round(confidence)
      };
    } catch (error) {
      console.error('OCR error:', error);
      return {
        fullText: '',
        extractedName: null,
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
      setFacingMode('environment');
      setStep('dni_front');
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
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
    <div className="min-h-screen bg-gray-100 pb-safe">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Verificación de Identidad</h1>
          <div className="flex justify-center gap-2 mt-2">
            <div className={`h-2 w-16 rounded-full ${step !== 'selfie' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded-full ${step === 'dni_back' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded-full ${step === 'selfie' ? 'bg-orange-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Instrucciones */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {step === 'dni_front' && (
              <>
                <h2 className="font-bold text-lg mb-2">Foto del DNI (Frente)</h2>
                <p className="text-gray-600 text-sm mb-3">
                  Coloca tu DNI sobre una superficie plana y toma una foto clara del frente
                </p>
                <input
                  type="number"
                  placeholder="Número de DNI (ej: 12345678)"
                  value={dniNumber}
                  onChange={(e) => setDniNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />
              </>
            )}
            {step === 'dni_back' && (
              <>
                <h2 className="font-bold text-lg mb-2">Foto del DNI (Dorso)</h2>
                <p className="text-gray-600 text-sm">
                  Ahora toma una foto del dorso de tu DNI
                </p>
              </>
            )}
            {step === 'selfie' && (
              <>
                <h2 className="font-bold text-lg mb-2">Selfie</h2>
                <p className="text-gray-600 text-sm">
                  Toma una selfie mirando a la cámara. Asegúrate de tener buena iluminación
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vista previa de la cámara */}
        <Card className="mb-4">
          <CardContent className="p-0 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Botón para cambiar cámara */}
            {(step === 'dni_front' || step === 'dni_back') && (
              <Button
                onClick={toggleCamera}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="space-y-3">
          {step === 'dni_front' && (
            <Button
              onClick={handleCaptureDNIFront}
              disabled={!dniNumber}
              className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              Capturar DNI Frente
            </Button>
          )}

          {step === 'dni_back' && (
            <Button
              onClick={handleCaptureDNIBack}
              className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              Capturar DNI Dorso
            </Button>
          )}

          {step === 'selfie' && (
            <Button
              onClick={handleCaptureSelfie}
              className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              Capturar Selfie
            </Button>
          )}
        </div>

        {/* Miniaturas de fotos capturadas */}
        {(dniFrontImg || dniBackImg) && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {dniFrontImg && (
              <div>
                <p className="text-xs text-gray-600 mb-1">DNI Frente</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dniFrontImg} alt="DNI Frente" className="w-full h-auto rounded border-2 border-green-500" />
              </div>
            )}
            {dniBackImg && (
              <div>
                <p className="text-xs text-gray-600 mb-1">DNI Dorso</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dniBackImg} alt="DNI Dorso" className="w-full h-auto rounded border-2 border-green-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
