'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock,
  Archive,
  ShieldCheck,
  Plus,
  User,
  Edit,
  Trash2,
  AlertCircle,
  DollarSign,
  Info
} from "lucide-react"
import ContractLandlordDetailModal from "@/components/contract-landlord-detail-modal"
import PDFViewerModal from "@/components/pdf-viewer-modal"

type Contract = {
  id: string
  status: string
  rent_amount: number
  deposit_amount: number
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
  tenant?: {
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
    case "pending_signatures": return "Pendiente de firma del inquilino"
    case "pending_deposit": return "Pendiente de depósito"
    case "active": return "Activo"
    case "expired": return "Expirado"
    case "cancelled": return "Cancelado"
    default: return status
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active": return "bg-green-500 text-white"
    case "pending_signatures": return "bg-yellow-500 text-white"
    case "pending_deposit": return "bg-blue-500 text-white"
    case "draft": return "bg-gray-400 text-white"
    case "expired": return "bg-gray-400 text-white"
    case "cancelled": return "bg-red-500 text-white"
    default: return "bg-orange-500 text-white"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active": return <CheckCircle2 className="w-4 h-4" />
    case "pending_signatures": return <Clock className="w-4 h-4" />
    case "pending_deposit": return <AlertCircle className="w-4 h-4" />
    case "draft": return <FileText className="w-4 h-4" />
    case "expired": return <Archive className="w-4 h-4" />
    case "cancelled": return <AlertCircle className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function LandlordContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null)
  const [signingContractId, setSigningContractId] = useState<string | null>(null)

  const fetchContracts = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    api.get("/api/contracts/landlord/my", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contrato?')) return

    const token = localStorage.getItem('access_token')
    try {
      await api.delete(`/api/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchContracts()
    } catch (error) {
      alert('Error al eliminar el contrato')
    }
  }

  const handleSignContract = async (contractId: string) => {
    setSigningContractId(contractId)
    const token = localStorage.getItem('access_token')
    try {
      const res = await api.post(`/api/contracts/landlord/my/${contractId}/sign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.setItem('contractId', contractId)
      localStorage.setItem('envelopeId', res.data.envelopeId)
      window.location.href = res.data.url
    } catch (error) {
      alert('Error al iniciar la firma del contrato')
      setSigningContractId(null)
    }
  }

  // Métricas por estado
  const activos = contracts.filter(c => c.status === 'active').length
  const pendientes = contracts.filter(c => c.status === 'pending_signatures').length
  const depositos = contracts.filter(c => c.status === 'pending_deposit').length
  const borradores = contracts.filter(c => c.status === 'draft').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contratos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Contratos</h1>
            <p className="text-gray-600">
              Gestiona los contratos de alquiler de tus propiedades
            </p>
          </div>
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <Link href="/home/propietario/contratos/crear">
              <Plus className="w-4 h-4" />
              Crear Contrato
            </Link>
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{activos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{pendientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Esperando depósito</p>
                  <p className="text-2xl font-bold text-gray-900">{depositos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-gray-500 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-gray-900">{borradores}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Contratos */}
        {contracts.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No tienes contratos
              </h2>
              <p className="text-gray-500 mb-6">
                Comienza creando tu primer contrato de alquiler.
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/home/propietario/contratos/crear">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Contrato
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contracts.map(contract => (
              <Card key={contract.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Header: Dirección + Estado */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 capitalize">
                          {contract.property?.property_type || 'Propiedad'}
                        </h3>
                        <Badge className={`${getStatusBadgeClass(contract.status)} flex items-center gap-1.5 text-sm px-3 py-1`}>
                          {getStatusIcon(contract.status)}
                          {getStatusLabel(contract.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        {contract.property?.address_line}
                        {contract.property?.city && ` • ${contract.property.city}`}
                        {contract.property?.neighborhood && `, ${contract.property.neighborhood}`}
                      </p>
                    </div>

                    {/* Botones de acción principales */}
                    <div className="flex flex-wrap gap-2">
                      {contract.status === 'draft' && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                        >
                          <Link href={`/home/propietario/contratos/crear?edit=${contract.id}`}>
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                        </Button>
                      )}

                      {contract.status === 'draft' && contract.landlord_signature !== 'signed' && (
                        <Button
                          onClick={() => handleSignContract(contract.id)}
                          disabled={signingContractId === contract.id}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                        >
                          {signingContractId === contract.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Firmar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Grid de información */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500">Alquiler mensual</p>
                        <p className="font-medium text-gray-900">
                          ${contract.rent_amount?.toLocaleString()} ARS
                        </p>
                      </div>
                    </div>

                    {contract.deposit_amount && (
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Depósito requerido</p>
                          <p className="font-medium text-gray-900">
                            ${contract.deposit_amount.toLocaleString()} ARS
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-500">Vigencia</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                        </p>
                      </div>
                    </div>

                    {contract.tenant && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Inquilino</p>
                          <p className="font-medium text-gray-900">{contract.tenant.full_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${contract.landlord_signature === 'signed' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-gray-500">Tu firma</p>
                        <p className={`font-medium ${contract.landlord_signature === 'signed' ? 'text-green-600' : 'text-gray-500'}`}>
                          {contract.landlord_signature === 'signed' ? 'Firmado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${contract.tenant_signature === 'signed' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-gray-500">Firma inquilino</p>
                        <p className={`font-medium ${contract.tenant_signature === 'signed' ? 'text-green-600' : 'text-gray-500'}`}>
                          {contract.tenant_signature === 'signed' ? 'Firmado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones secundarios */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedId(contract.id)
                        setDetailOpen(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
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
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Ver PDF
                      </Button>
                    )}

                    {contract.status === 'draft' && contract.tenant_signature !== 'signed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>

                  {/* Mensaje de acción según estado */}
                  {contract.status === 'draft' && contract.landlord_signature !== 'signed' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-yellow-900 mb-1">
                            Acción requerida: Firmar contrato
                          </p>
                          <p className="text-yellow-800">
                            Una vez que firmes el contrato, el inquilino recibirá una notificación para firmar también.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {contract.status === 'pending_signatures' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">
                            Esperando firma del inquilino
                          </p>
                          <p className="text-blue-800">
                            El contrato fue firmado por ti. El inquilino debe firmar para continuar.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {contract.status === 'pending_deposit' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">
                            Esperando depósito del inquilino
                          </p>
                          <p className="text-blue-800">
                            El contrato está firmado por ambas partes. El inquilino debe realizar el depósito de ${contract.deposit_amount?.toLocaleString()} ARS para activarlo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Información sobre contratos */}
        <Card className="border border-gray-200 shadow-sm mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-extrabold text-gray-900">
                Información sobre Contratos
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Proceso de creación
                </h3>
                <p>
                  Crea un contrato ingresando los datos de la propiedad, el inquilino y los términos del alquiler.
                  Una vez creado, debes firmarlo digitalmente con DocuSign para que el inquilino pueda verlo.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Flujo de firma
                </h3>
                <p>
                  Primero firmas tú como propietario, luego el inquilino recibe una notificación para firmar.
                  Una vez firmado por ambas partes, el inquilino debe realizar el depósito de garantía.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Estados del contrato
                </h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-gray-400 text-white">Borrador</Badge>
                    <span>Pendiente de tu firma</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 text-white">Pendiente firma inquilino</Badge>
                    <span>Esperando que el inquilino firme</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">Pendiente de depósito</Badge>
                    <span>Esperando el depósito de garantía</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Activo</Badge>
                    <span>El contrato está vigente</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-700">
                  Importante:
                </span>{' '}
                Los contratos creados en{' '}
                <span className="font-semibold text-orange-600">RentMatch</span> son legalmente vinculantes.
                Asegúrate de revisar todos los términos antes de firmar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalle */}
      <ContractLandlordDetailModal
        open={detailOpen}
        id={selectedId}
        onClose={() => setDetailOpen(false)}
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