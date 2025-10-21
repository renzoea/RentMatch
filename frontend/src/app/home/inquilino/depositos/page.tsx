'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileText, Info } from 'lucide-react';

export default function DepositoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Depósito</h1>
          <p className="text-gray-600">
            Información sobre tu depósito de garantía
          </p>
        </div>

        {/* Card principal */}
        <Card className="border border-gray-200 mb-8 shadow-sm">
          <CardContent className="p-6">
            {/* Monto + estado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <p className="text-3xl font-extrabold text-gray-900">$ 600.000</p>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                  Retenido
                </span>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 shadow-sm"
              >
                📄 Descargar Comprobante
              </Button>
            </div>

            <p className="text-gray-700 mb-4">
              Depósito de garantía para <strong>Departamento Palermo</strong>
            </p>

            {/* Progreso del contrato */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Progreso del contrato:
              </p>
              <div className="relative w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute left-0 top-0 h-2 bg-orange-500 rounded-full"
                  style={{ width: '51%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Inicio: 01/03/2024</span>
                <span>51%</span>
                <span>Finalización: 01/03/2027</span>
              </div>
            </div>

            {/* Fechas y datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 mt-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-orange-600" />
                <span>
                  <strong>Fecha de depósito:</strong> 01/03/2024
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-orange-600" />
                <span>
                  <strong>Fecha de liberación:</strong> 01/03/2027
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>
                  <strong>Contrato asociado:</strong> Departamento Palermo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>
                  <strong>Dirección:</strong> Av. Santa Fe 3456, Palermo
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información sobre el depósito */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-extrabold text-gray-900">
                Información sobre el Depósito
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Retención del Depósito
                </h3>
                <p>
                  Tu depósito se mantiene en una cuenta segura durante toda la
                  duración del contrato. No es utilizado por el propietario ni
                  por RentMatch.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Inspección Final
                </h3>
                <p>
                  Al finalizar el contrato, se realizará una inspección
                  comparando con el inventario inicial. Solo se descontarán
                  daños comprobados que excedan el desgaste normal.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Liberación Automática
                </h3>
                <p>
                  El depósito se libera automáticamente a los 10 días hábiles
                  después de finalizado el contrato, a menos que exista un
                  reclamo formal por daños.
                </p>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                <span className="font-semibold text-blue-700">
                  Nota:
                </span>{' '}
                Cualquier disputa sobre el depósito será mediada por el equipo
                legal de <span className="font-semibold text-orange-600">RentMatch</span> para garantizar un proceso justo y transparente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
