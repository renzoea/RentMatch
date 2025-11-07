'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar el depositId pendiente
    localStorage.removeItem('pending_deposit_id');
  }, []);

  const handleRetry = () => {
    router.push('/home/inquilino/depositos');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con icono de error */}
        <div className="text-center mb-8">
          <div className="bg-red-500 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pago No Procesado
          </h1>
          <p className="text-xl text-gray-600">
            No se pudo completar el pago del depósito
          </p>
        </div>

        {/* Explicación */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué sucedió?</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                El pago del depósito de garantía no pudo ser procesado. Esto puede ocurrir por varios motivos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fondos insuficientes en la cuenta o tarjeta</li>
                <li>Datos de pago incorrectos</li>
                <li>Cancelaste el proceso de pago</li>
                <li>Problemas temporales con Mercado Pago</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Qué hacer ahora */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué puedes hacer?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reintentar el Pago</h3>
                  <p className="text-sm text-gray-600">
                    Vuelve a intentar realizar el pago asegurándote de que tu método de pago esté activo
                    y tenga fondos suficientes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contactar Soporte</h3>
                  <p className="text-sm text-gray-600">
                    Si el problema persiste, contacta con nuestro equipo de soporte para recibir ayuda.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Importante */}
        <Card className="border border-yellow-200 bg-yellow-50 shadow-sm mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Importante
            </h3>
            <p className="text-sm text-yellow-800">
              Tu contrato seguirá en estado <strong>&quot;Pendiente de depósito&quot;</strong> hasta que
              completes el pago exitosamente. No podrás acceder a la propiedad hasta que el depósito
              sea confirmado.
            </p>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar Pago
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/home/inquilino')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}