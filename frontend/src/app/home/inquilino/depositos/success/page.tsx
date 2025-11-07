'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface PaymentInfo {
  deposit_status: string;
  payment_status: string;
  payment_id: string | number;
  has_payment: boolean;
  amount?: number;
  payment_method?: string;
  payment_type?: string;
  date_approved?: string;
  payment_status_detail?: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Intentar obtener el deposit_id de varias fuentes
      let depositId = localStorage.getItem('pending_deposit_id');
      const depositIdFromUrl = searchParams.get('deposit_id');
      const preferenceId = searchParams.get('preference_id') || searchParams.get('preference-id');

      // Priorizar el ID de la URL sobre el de localStorage
      if (depositIdFromUrl) {
        depositId = depositIdFromUrl;
      }

      try {
        const token = localStorage.getItem('access_token');

        // Si tenemos preference_id pero no deposit_id, usar el endpoint alternativo
        if (preferenceId && !depositId) {
          console.log('🔍 Verificando pago usando preference_id:', preferenceId);
          const response = await api.post(`/api/deposits/verify-by-preference/${preferenceId}`);

          setPaymentInfo({
            deposit_status: response.data.deposit_status,
            payment_status: response.data.payment_status,
            payment_id: response.data.payment_id,
            has_payment: true
          });

          console.log('✅ Pago verificado con preference_id:', response.data);
          localStorage.removeItem('pending_deposit_id');
          return;
        }

        if (!depositId) {
          console.error('No deposit ID found in localStorage, URL, or preference_id available');
          setVerifying(false);
          return;
        }

        // Obtener el estado actualizado del pago
        const response = await api.get(`/api/deposits/${depositId}/payment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPaymentInfo(response.data);
        console.log('✅ Pago verificado:', response.data);

        // Limpiar localStorage
        localStorage.removeItem('pending_deposit_id');
      } catch (error) {
        console.error('Error verificando pago:', error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verificando pago...</h2>
            <p className="text-gray-600">
              Estamos confirmando tu pago con Mercado Pago. Esto tomará solo un momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con animación de éxito */}
        <div className="text-center mb-8">
          <div className="bg-green-500 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-gray-600">
            Tu depósito de garantía ha sido procesado correctamente
          </p>
        </div>

        {/* Detalles del pago */}
        {paymentInfo && (
          <Card className="border border-gray-200 shadow-sm mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles del Pago</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-semibold text-green-600">
                    {paymentInfo.payment_status === 'approved' ? 'Aprobado' : paymentInfo.payment_status}
                  </span>
                </div>
                {paymentInfo.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-gray-900">
                      ${paymentInfo.amount.toLocaleString()} ARS
                    </span>
                  </div>
                )}
                {paymentInfo.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentInfo.payment_method}
                    </span>
                  </div>
                )}
                {paymentInfo.date_approved && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(paymentInfo.date_approved).toLocaleString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximos pasos */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué sigue ahora?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contrato Activado</h3>
                  <p className="text-sm text-gray-600">
                    Tu contrato de alquiler ha sido activado automáticamente y ya está vigente.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Depósito Retenido</h3>
                  <p className="text-sm text-gray-600">
                    El depósito quedará retenido durante todo el contrato y se devolverá al finalizar,
                    siempre que no haya daños en la propiedad.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                  <Home className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Coordina la Entrega</h3>
                  <p className="text-sm text-gray-600">
                    Ponte en contacto con el propietario para coordinar la entrega de llaves y
                    el ingreso a la propiedad.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/home/inquilino/contratos')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver Mis Contratos
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/home/inquilino/depositos')}
          >
            Ver Depósitos
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