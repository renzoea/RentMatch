'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Home,
  CalendarDays,
  CheckCircle2,
  Clock,
  Archive,
  ShieldCheck,
  User,
  AlertCircle
} from "lucide-react"
import ContractDetailModal from "@/components/contract-detail-modal"
import PDFViewerModal from "@/components/pdf-viewer-modal"

type Contract = {
  id: string
  status: string
  rent_amount: number
  rent_currency: string
  start_date: string
  end_date: string
  landlord_signature: string
  tenant_signature: string
  property?: {
    address_line: string
    city: string
    neighborhood?: string
    property_type: string
  }
  landlord?: {
    full_name: string
    email: string
    phone?: string
  }
  document_url?: string
  created_at: string
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft": return "Borrador"
    case "pending_signatures": return "Pendiente de tu firma"
    case "pending_deposit": return "Pendiente de depósito"
    case "active": return "Activo"
    case "terminated": return "Terminado"
    default: return status
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active": return "bg-green-500 text-white text-sm px-3 py-1 shadow-sm"
    case "pending_signatures": return "bg-yellow-400 text-white text-sm px-3 py-1 shadow-sm"
    case "pending_deposit": return "bg-blue-500 text-white text-sm px-3 py-1 shadow-sm"
    case "terminated": return "bg-gray-400 text-white text-sm px-3 py-1 shadow-sm"
    default: return "bg-orange-500 text-white text-sm px-3 py-1 shadow-sm"
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function ContractDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    
    api.get("/api/contracts/my", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false))
  }, [])

  // Refresca la lista después de firmar
  const handleSigned = () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    api.get("/api/contracts/my", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false))
  }

  const handleSignContract = async (contractId: string) => {
    const token = localStorage.getItem('access_token')
    try {
      const res = await api.post(`/api/contracts/my/${contractId}/sign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.setItem('contractId', contractId)
      localStorage.setItem('envelopeId', res.data.envelopeId)
      window.location.href = res.data.url
    } catch (error) {
      alert('Error al iniciar la firma del contrato')
    }
  }

  // Métricas por estado
  const activos = contracts.filter(c => c.status === 'active').length
  const pendientes = contracts.filter(c => c.status === 'pending_signatures').length
  const depositos = contracts.filter(c => c.status === 'pending_deposit').length
  const terminados = contracts.filter(c => c.status === 'terminated').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mis Contratos</h1>
              <p className="text-gray-600 mt-1">
                Consulta tus contratos de alquiler, firma y descarga el PDF adjunto.
              </p>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">Activos</p>
                <p className="text-3xl font-bold text-green-900">{activos}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-700">Pendientes de firma</p>
                <p className="text-3xl font-bold text-yellow-900">{pendientes}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700">Pendientes de depósito</p>
                <p className="text-3xl font-bold text-blue-900">{depositos}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-gray-500 p-3 rounded-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Terminados</p>
                <p className="text-3xl font-bold text-gray-900">{terminados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Contratos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Cargando contratos...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-full mb-6">
                <ShieldCheck className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tienes contratos</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Cuando tengas contratos de alquiler, aparecerán aquí para que puedas gestionarlos.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {contracts.map(contract => (
              <div
                key={contract.id}
                className="bg-white rounded-2xl shadow-md border border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all duration-200 overflow-hidden"
              >
                {/* Header del Card */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-4 border-b border-orange-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-orange-600" />
                          <span className="font-bold text-lg text-gray-900">
                            {contract.property?.address_line || 'Sin dirección'}
                          </span>
                        </div>
                        {contract.property?.neighborhood && (
                          <span className="text-gray-500">• {contract.property.neighborhood}</span>
                        )}
                        {contract.property?.city && (
                          <span className="text-gray-500">• {contract.property.city}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {contract.landlord?.full_name || 'Sin propietario asignado'}
                        </span>
                        {contract.landlord?.email && (
                          <span className="text-gray-500">• {contract.landlord.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusBadgeClass(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contenido del Card */}
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                      </span>
                    </div>
                    <div className="font-bold text-xl text-gray-900">
                      ${contract.rent_amount?.toLocaleString()} {contract.rent_currency}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className={contract.landlord_signature === 'signed' ? 'text-green-600' : 'text-gray-400'}>
                        {contract.landlord_signature === 'signed' ? '✓ Firma propietario' : '○ Firma propietario pendiente'}
                      </span>
                      <span className={contract.tenant_signature === 'signed' ? 'text-green-600' : 'text-orange-600'}>
                        {contract.tenant_signature === 'signed' ? '✓ Tu firma' : '○ Tu firma pendiente'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedId(contract.id)
                        setDetailOpen(true)
                      }}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    {contract.document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPdfUrl(contract.document_url || null)
                          setPdfViewerOpen(true)
                        }}
                        className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Ver Contrato PDF
                      </Button>
                    )}
                    {contract.status === 'pending_signatures' && contract.tenant_signature !== 'signed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSignContract(contract.id)}
                        className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 border-orange-200 text-orange-600"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Firmar Contrato
                      </Button>
                    )}
                    {contract.status === 'pending_deposit' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/home/inquilino/depositos")}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border-blue-200 text-blue-600"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Realizar Depósito
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <ContractDetailModal
        open={detailOpen}
        id={selectedId}
        onClose={() => setDetailOpen(false)}
        onDeposit={() => router.push("/home/inquilino/depositos")}
        onSigned={handleSigned}
      />

      {/* Modal de Visor PDF */}
      <PDFViewerModal
        open={pdfViewerOpen}
        pdfUrl={selectedPdfUrl}
        onClose={() => setPdfViewerOpen(false)}
        title="Contrato PDF"
      />
    </div>
  )
}