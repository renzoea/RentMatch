'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card-standard';
import { Clock, Home, FileText, Info } from 'lucide-react';

export default function PaymentPendingPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar el depositId pendiente
    localStorage.removeItem('pending_deposit_id');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con icono de pendiente */}
        <div className="text-center mb-8">
          <div className="bg-yellow-500 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pago Pendiente
          </h1>
          <p className="text-xl text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        {/* Explicación */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué significa esto?</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Tu pago del depósito de garantía está siendo procesado por Mercado Pago.
                Esto puede ocurrir en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pagos con transferencia bancaria (pueden tardar hasta 3 días hábiles)</li>
                <li>Pagos en efectivo (Rapipago, Pago Fácil, etc.)</li>
                <li>Verificaciones adicionales de seguridad</li>
                <li>Procesamiento de algunos métodos de pago específicos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Qué hacer ahora */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué sigue ahora?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Espera la Confirmación</h3>
                  <p className="text-sm text-gray-600">
                    Recibirás una notificación por email cuando el pago sea confirmado.
                    Esto puede tomar desde unos minutos hasta 3 días hábiles según el método de pago.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Revisa el Estado</h3>
                  <p className="text-sm text-gray-600">
                    Puedes revisar el estado de tu depósito en cualquier momento desde la sección
                    &quot;Mis Depósitos&quot;.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                  <Info className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Activación Automática</h3>
                  <p className="text-sm text-gray-600">
                    Una vez que el pago sea confirmado, tu contrato se activará automáticamente
                    y podrás coordinar la entrega de llaves.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado del contrato */}
        <Card className="border border-blue-200 bg-blue-50 shadow-sm mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Estado de tu Contrato
            </h3>
            <p className="text-sm text-blue-800">
              Mientras el pago está pendiente, tu contrato permanecerá en estado
              <strong> &quot;Pendiente de depósito&quot;</strong>. Una vez confirmado el pago,
              el estado cambiará automáticamente a <strong>&quot;Activo&quot;</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/home/inquilino/depositos')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver Mis Depósitos
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/home/inquilino/contratos')}
          >
            Ver Mis Contratos
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/home/inquilino')}
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}