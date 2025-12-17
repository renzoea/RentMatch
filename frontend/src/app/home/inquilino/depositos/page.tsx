'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card-standard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/skeleton';
import {
  CalendarDays,
  FileText,
  Info,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';

type Deposit = {
  id: string;
  contract_id: string;
  amount: number;
  status: 'pending_payment' | 'awaiting_verification' | 'held' | 'returned_to_tenant' | 'returned_to_landlord' | 'disputed';
  proof_url?: string;
  verified_at?: string;
  released_at?: string;
  outcome?: string;
  notes?: string;
  preference_id?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  contract?: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    rent_amount: number;
  };
  property?: {
    address_line: string;
    city: string;
    neighborhood?: string;
    property_type: string;
  };
  landlord?: {
    full_name: string;
    email: string;
  };
};

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending_payment': return 'Pendiente de pago';
    case 'awaiting_verification': return 'En verificación';
    case 'held': return 'Retenido';
    case 'returned_to_tenant': return 'Devuelto';
    case 'returned_to_landlord': return 'Retenido por propietario';
    case 'disputed': return 'En disputa';
    default: return status;
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'pending_payment': return 'bg-yellow-500 text-white';
    case 'awaiting_verification': return 'bg-blue-500 text-white';
    case 'held': return 'bg-green-500 text-white';
    case 'returned_to_tenant': return 'bg-emerald-600 text-white';
    case 'returned_to_landlord': return 'bg-red-500 text-white';
    case 'disputed': return 'bg-orange-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending_payment': return <Clock className="w-4 h-4" />;
    case 'awaiting_verification': return <AlertCircle className="w-4 h-4" />;
    case 'held': return <CheckCircle2 className="w-4 h-4" />;
    case 'returned_to_tenant': return <CheckCircle2 className="w-4 h-4" />;
    case 'returned_to_landlord': return <AlertCircle className="w-4 h-4" />;
    case 'disputed': return <AlertCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

export default function DepositosPage() {
  const toast = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/deposits/my');
      setDeposits(res.data);
    } catch (error) {
      console.error('Error cargando depósitos:', error);
      toast.error('Error al cargar depósitos', 'Por favor intenta recargar la página');
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithMercadoPago = async (deposit: Deposit) => {
    // Validar que el monto sea mayor a 0
    if (!deposit.amount || deposit.amount <= 0) {
      toast.error('Monto inválido', 'El monto del depósito debe ser mayor a 0. Contacta al propietario.');
      return;
    }

    setProcessingId(deposit.id);
    try {
      const response = await api.post(`/api/deposits/${deposit.id}/create-payment`);

      const { init_point } = response.data;

      if (!init_point) {
        throw new Error('No se recibió la URL de pago de Mercado Pago');
      }

      // Guardar el depositId para cuando vuelva del checkout
      localStorage.setItem('pending_deposit_id', deposit.id);

      // Redirigir al Checkout Pro de Mercado Pago
      window.location.href = init_point;
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error('Error al procesar el pago', err.response?.data?.error || 'No se pudo iniciar el pago con Mercado Pago.');
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <LoadingState message="Cargando depósitos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Depósitos</h1>
          <p className="text-gray-600">
            Gestiona los depósitos de garantía de tus contratos
          </p>
        </div>

        {/* Lista de depósitos */}
        {deposits.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No tienes depósitos"
            description="Los depósitos se crean automáticamente cuando firmas un contrato."
          />
        ) : (
          <div className="space-y-6">
            {deposits.map((deposit) => {
              const progress = deposit.contract?.start_date && deposit.contract?.end_date
                ? calculateProgress(deposit.contract.start_date, deposit.contract.end_date)
                : 0;

              return (
                <Card key={deposit.id} hover>
                    {/* Header: Monto + Estado */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-3xl font-extrabold text-gray-900">
                            ${deposit.amount.toLocaleString()} ARS
                          </p>
                          <Badge className={`${getStatusBadgeClass(deposit.status)} flex items-center gap-1.5 text-sm px-3 py-1`}>
                            {getStatusIcon(deposit.status)}
                            {getStatusLabel(deposit.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600">
                          <strong className="text-gray-900">{deposit.property?.property_type || 'Propiedad'}</strong>
                          {' • '}
                          {deposit.property?.address_line}
                        </p>
                      </div>

                      {/* Botón de acción según estado */}
                      {deposit.status === 'pending_payment' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => handlePayWithMercadoPago(deposit)}
                            disabled={processingId === deposit.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
                          >
                            {processingId === deposit.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4" />
                                Pagar con Mercado Pago
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {deposit.status === 'held' && deposit.proof_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(deposit.proof_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Ver Comprobante
                        </Button>
                      )}
                    </div>

                    {/* Progreso del contrato (solo si está activo) */}
                    {deposit.status === 'held' && deposit.contract && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                          Progreso del contrato:
                        </p>
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                          <span>Inicio: {formatDate(deposit.contract.start_date)}</span>
                          <span className="font-semibold text-orange-600">{progress}%</span>
                          <span>Fin: {formatDate(deposit.contract.end_date)}</span>
                        </div>
                      </div>
                    )}

                    {/* Grid de información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Fecha de creación</p>
                          <p className="font-medium text-gray-900">{formatDate(deposit.created_at)}</p>
                        </div>
                      </div>

                      {deposit.verified_at && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500">Verificado el</p>
                            <p className="font-medium text-gray-900">{formatDate(deposit.verified_at)}</p>
                          </div>
                        </div>
                      )}

                      {deposit.released_at && (
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500">Liberado el</p>
                            <p className="font-medium text-gray-900">{formatDate(deposit.released_at)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Home className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Ubicación</p>
                          <p className="font-medium text-gray-900">
                            {deposit.property?.city}
                            {deposit.property?.neighborhood && `, ${deposit.property.neighborhood}`}
                          </p>
                        </div>
                      </div>

                      {deposit.landlord && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500">Propietario</p>
                            <p className="font-medium text-gray-900">{deposit.landlord.full_name}</p>
                          </div>
                        </div>
                      )}

                      {deposit.contract?.rent_amount && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500">Alquiler mensual</p>
                            <p className="font-medium text-gray-900">
                              ${deposit.contract.rent_amount.toLocaleString()} ARS
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notas (si existen) */}
                    {deposit.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <strong className="text-gray-900">Notas:</strong> {deposit.notes}
                        </p>
                      </div>
                    )}

                    {/* Mensaje de acción para pending_payment */}
                    {deposit.status === 'pending_payment' && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-yellow-900 mb-1">
                              Acción requerida: Realizar pago del depósito
                            </p>
                            <p className="text-yellow-800">
                              Haz clic en &quot;Pagar con Mercado Pago&quot; para realizar el pago del depósito de garantía de forma segura.
                              Tu contrato se activará automáticamente una vez que se confirme el pago.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Información sobre el depósito */}
        <Card className="border border-gray-200 shadow-sm mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-extrabold text-gray-900">
                Información sobre los Depósitos
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Qué es el depósito de garantía?
                </h3>
                <p>
                  El depósito de garantía es un monto que se retiene durante toda la
                  duración del contrato como respaldo ante posibles daños o incumplimientos.
                  No es utilizado por el propietario ni por RentMatch durante el contrato.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Cuándo se devuelve?
                </h3>
                <p>
                  Al finalizar el contrato, se realizará una inspección final. Si no hay
                  daños que excedan el desgaste normal, el depósito completo se devuelve
                  en un plazo de 10 días hábiles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Estados del depósito
                </h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 text-white">Pendiente de pago</Badge>
                    <span>Debes realizar el pago y marcarlo como pagado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Retenido</Badge>
                    <span>El depósito está activo durante el contrato</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white">Devuelto</Badge>
                    <span>El depósito fue devuelto al finalizar el contrato</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-700">
                  Nota:
                </span>{' '}
                Cualquier disputa sobre el depósito será mediada por el equipo de{' '}
                <span className="font-semibold text-orange-600">RentMatch</span> para
                garantizar un proceso justo y transparente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
