'use client'
import Link from "next/link";

import { useState } from 'react'
import { FileText, Clock, CheckCircle, MapPin, Calendar, User, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContratosPage() {
  const [contratos] = useState([
    {
      id: 1,
      titulo: 'Contrato Departamento Palermo',
      estado: 'Vigente',
      direccion: 'Av. Santa Fe 3456, Palermo',
      fechas: '01/03/2024 – 01/03/2027',
      inquilino: 'María Rodríguez',
      firmado: true,
      deposito: true,
    },
    {
      id: 2,
      titulo: 'Contrato Casa Belgrano',
      estado: 'Pendiente de firma',
      direccion: 'Av. Cabildo 1234, Belgrano',
      fechas: '01/06/2025 – 01/06/2028',
      inquilino: 'Carlos Martínez',
      firmado: false,
      deposito: false,
    },
    {
      id: 3,
      titulo: 'Contrato Departamento Recoleta',
      estado: 'Pendiente de Depósito',
      direccion: 'Av. Las Heras 2890, Recoleta',
      fechas: '01/09/2025 – 01/09/2028',
      inquilino: 'Ana López',
      firmado: false,
      deposito: false,
    },
  ])

  const total = contratos.length
  const paraRevisar = contratos.filter(c => c.estado !== 'Vigente').length
  const vigentes = contratos.filter(c => c.estado === 'Vigente').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
            <p className="text-gray-600">Administra tus contratos de alquiler</p>
          </div>
          <Button
  asChild
  className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
>
  <Link href="/home/propietario/contratos/crear">+ Crear Contrato</Link>
</Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-3">
            <FileText className="text-orange-500 w-7 h-7" />
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-3">
            <Clock className="text-orange-500 w-7 h-7" />
            <div>
              <p className="text-gray-600 text-sm">Para Revisar</p>
              <p className="text-2xl font-bold text-gray-900">{paraRevisar}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-3">
            <CheckCircle className="text-green-500 w-7 h-7" />
            <div>
              <p className="text-gray-600 text-sm">Vigentes</p>
              <p className="text-2xl font-bold text-gray-900">{vigentes}</p>
            </div>
          </div>
        </div>

        {/* Lista de contratos */}
        <div className="space-y-5">
          {contratos.map(c => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <h2 className="font-bold text-gray-900 text-lg">
                  {c.titulo}
                </h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  c.estado === 'Vigente'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : c.estado === 'Pendiente de firma'
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                }`}>
                  {c.estado}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {c.direccion}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {c.fechas}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Inquilino: <span className="font-medium">{c.inquilino}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {c.firmado ? (
                    <span>✍️ Firmado</span>
                  ) : (
                    <span>✍️ Pendiente de firma de inquilino</span>
                  )}
                  {c.deposito ? (
                    <span>💰 Depósito realizado</span>
                  ) : (
                    <span>💰 Pendiente de depósito</span>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-wrap gap-2 mt-2">
                {c.estado !== 'Vigente' && (
                  <Button
                    variant="outline"
                    className="text-orange-700 border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </Button>
                )}
                <Button variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                  Ver detalle
                </Button>
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Descargar PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
