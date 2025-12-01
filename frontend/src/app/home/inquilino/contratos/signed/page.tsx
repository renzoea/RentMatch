'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  FileText, 
  Home, 
  ArrowRight,
  Sparkles,
  Calendar,
  User
} from "lucide-react";

export default function ContractSignedPage() {
  const [isConfirming, setIsConfirming] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const contractId = localStorage.getItem("contractId");
    const envelopeId = localStorage.getItem("envelopeId");
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (contractId) {
      fetch(`${API}/api/contracts/${contractId}/confirm-tenant-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureUrl: window.location.href,
          envelopeId: envelopeId
        }),
      })
      .then(() => {
        setIsConfirming(false);
      })
      .catch(() => {
        setIsConfirming(false);
      });
      localStorage.removeItem("contractId");
      localStorage.removeItem("envelopeId");
    } else {
      setIsConfirming(false);
    }
  }, []);

  const handleGoToContracts = () => {
    router.push('/home/inquilino/contratos');
  };

  const handleGoToDashboard = () => {
    router.push('/home/inquilino');
  };

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmando firma...</h2>
          <p className="text-gray-600 text-sm">
            Estamos procesando tu firma digital
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con animación de éxito */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-full shadow-2xl mx-auto w-24 h-24 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-full shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡Contrato Firmado con Éxito!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu firma digital ha sido registrada correctamente. El contrato ahora está activo y en proceso.
          </p>
        </div>

        {/* Tarjeta principal de información */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-green-900">Estado del Contrato</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Estado actual */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Estado Actual</p>
                    <p className="text-lg font-bold text-green-900">Firmado</p>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  Tu firma ha sido registrada exitosamente
                </p>
              </div>

              {/* Próximo paso */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Próximo Paso</p>
                    <p className="text-lg font-bold text-yellow-900">Depósito</p>
                  </div>
                </div>
                <p className="text-sm text-yellow-700">
                  Ahora debes realizar el pago del depósito
                </p>
              </div>

              {/* Proceso */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Proceso</p>
                    <p className="text-lg font-bold text-blue-900">Activo</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  El propietario será notificado de tu firma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pasos siguientes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-orange-600" />
            ¿Qué sigue ahora?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Espera la confirmación</h4>
                <p className="text-sm text-gray-600">
                  El propietario recibirá una notificación de que has firmado el contrato.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Prepara el depósito</h4>
                <p className="text-sm text-gray-600">
                  Tendrás que realizar el pago del depósito para activar completamente el contrato.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">¡Listo para mudarte!</h4>
                <p className="text-sm text-gray-600">
                  Una vez completado el depósito, podrás coordinar la entrega de llaves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToContracts}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg px-8 py-3 text-lg"
          >
            <FileText className="w-5 h-5 mr-2" />
            Ver Mis Contratos
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoToDashboard}
            className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 px-8 py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Dashboard
          </Button>
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Importante:</strong> Recibirás notificaciones por email sobre el progreso de tu contrato.
            </p>
            <p className="text-xs text-gray-500">
              Si tienes alguna pregunta, no dudes en contactar al propietario a través de la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}