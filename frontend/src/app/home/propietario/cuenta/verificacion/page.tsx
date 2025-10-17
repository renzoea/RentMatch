'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, IdCard, ShieldAlert } from 'lucide-react';

export default function VerificacionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y verificación</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 text-sm mb-4">
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/propietario/cuenta')}
          >
            Datos personales
          </button>
          <span className="text-orange-600 font-semibold">Verificación</span>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/propietario/cuenta/seguridad')}
          >
            Seguridad
          </button>
        </div>

        {/* Panel principal */}
        <Card className="border border-gray-200">
          <CardContent className="p-6 md:p-8">
            {/* Título con icono */}
            <div className="flex items-start gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-gray-700 mt-0.5" />
              <h2 className="text-xl font-extrabold text-gray-900">Verificación de Identidad</h2>
            </div>
            <p className="text-gray-600 mb-6">
              La verificación de tu identidad y documentos aumenta la confianza de los propietarios y
              mejora tus posibilidades de ser contactado.
            </p>

            {/* Tarjeta DNI */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <IdCard className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-medium text-gray-900">DNI</p>
                    <p className="text-xs text-gray-500">Verificado</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                  Verificado
                </span>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="flex items-start gap-2 text-sm mb-6">
              <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-gray-700">
                <span className="text-red-600 font-semibold">Verificación con DNI argentino:</span>{' '}
                Para completar la verificación de identidad, necesitarás validar tu DNI a través de nuestro
                sistema seguro. Esto solo toma unos minutos.
              </p>
            </div>

            {/* CTA */}
            <Button
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6"
              onClick={() => alert('Flujo de verificación: aquí iría tu redirección al proveedor KYC.')}
            >
              Verificar mi identidad con DNI
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
