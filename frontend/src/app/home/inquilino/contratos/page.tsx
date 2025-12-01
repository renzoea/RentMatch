'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card-standard"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/useToast"
import {
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock,
  Archive,
  ShieldCheck,
  User,
  AlertCircle,
  DollarSign,
  Info
} from "lucide-react"
import ContractDetailModal from "@/components/contract-detail-modal"
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

export default function ContractDashboard() {
  const toast = useToast()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null)
  const [signingContractId, setSigningContractId] = useState<string | null>(null)
  const router = useRouter()

  const loadContracts = () => {
    setLoading(true)
    setError(null)
    api.get("/api/contracts/my")
      .then(res => setContracts(res.data))
      .catch((error) => {
        console.error('Error loading contracts:', error)
        const errorMsg = 'No se pudieron cargar los contratos. Verifica tu conexión.'
        setError(errorMsg)
        toast.error('Error al cargar contratos', errorMsg)
        setContracts([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContracts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignContract = async (contractId: string) => {
    setSigningContractId(contractId)
    try {
      const res = await api.post(`/api/contracts/my/${contractId}/sign`)
      localStorage.setItem('contractId', contractId)
      localStorage.setItem('envelopeId', res.data.envelopeId)
      window.location.href = res.data.url
    } catch {
      toast.error('Error al firmar contrato', 'No se pudo iniciar el proceso de firma del contrato')
      setSigningContractId(null)
    }
  }

  // Métricas por estado
  const activos = contracts.filter(c => c.status === 'active').length
  const pendientes = contracts.filter(c => c.status === 'pending_signatures').length
  const depositos = contracts.filter(c => c.status === 'pending_deposit').length
  const otros = contracts.filter(c => !['active', 'pending_signatures', 'pending_deposit'].includes(c.status)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <LoadingState message="Cargando contratos..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Contratos</h1>
          <p className="text-gray-600">
            Gestiona tus contratos de alquiler, firma documentos y realiza depósitos
          </p>
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
                  <p className="text-xs font-medium text-gray-600">Por firmar</p>
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
                  <p className="text-xs font-medium text-gray-600">Por depositar</p>
                  <p className="text-2xl font-bold text-gray-900">{depositos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-gray-500 p-2 rounded-lg">
                  <Archive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Otros</p>
                  <p className="text-2xl font-bold text-gray-900">{otros}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Contratos */}
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Error al cargar contratos"
            description={error}
            action={{
              label: "Reintentar",
              onClick: loadContracts
            }}
          />
        ) : contracts.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No tienes contratos"
            description="Cuando tengas contratos de alquiler, aparecerán aquí."
          />
        ) : (
          <div className="space-y-6">
            {contracts.map(contract => (
              <Card key={contract.id} hover>
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
                      {contract.status === 'pending_signatures' && contract.tenant_signature !== 'signed' && (
                        <Button
                          onClick={() => handleSignContract(contract.id)}
                          disabled={signingContractId === contract.id}
                          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                        >
                          {signingContractId === contract.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Firmar Contrato
                            </>
                          )}
                        </Button>
                      )}

                      {contract.status === 'pending_deposit' && (
                        <Button
                          onClick={() => router.push("/home/inquilino/depositos")}
                          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Realizar Depósito
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

                    {contract.landlord && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500">Propietario</p>
                          <p className="font-medium text-gray-900">{contract.landlord.full_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${contract.landlord_signature === 'signed' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-gray-500">Firma propietario</p>
                        <p className={`font-medium ${contract.landlord_signature === 'signed' ? 'text-green-600' : 'text-gray-500'}`}>
                          {contract.landlord_signature === 'signed' ? 'Firmado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${contract.tenant_signature === 'signed' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-gray-500">Tu firma</p>
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
                  </div>

                  {/* Mensaje de acción según estado */}
                  {contract.status === 'pending_signatures' && contract.tenant_signature !== 'signed' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-yellow-900 mb-1">
                            Acción requerida: Firmar contrato
                          </p>
                          <p className="text-yellow-800">
                            El propietario ya firmó el contrato. Haz clic en &quot;Firmar Contrato&quot; para completar tu firma digital.
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
                            Acción requerida: Realizar depósito de garantía
                          </p>
                          <p className="text-blue-800">
                            El contrato está firmado. Para activarlo, debes realizar el depósito de garantía de ${contract.deposit_amount?.toLocaleString()} ARS.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                  Proceso de firma
                </h3>
                <p>
                  Los contratos utilizan firma digital con DocuSign. Primero firma el propietario,
                  luego recibirás una notificación para firmar tú. El proceso es 100% digital y legalmente válido.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Depósito de garantía
                </h3>
                <p>
                  Una vez firmado el contrato por ambas partes, deberás realizar el depósito de garantía.
                  Este monto se retiene durante todo el contrato y se devuelve al finalizarlo si no hay daños.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Estados del contrato
                </h3>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 text-white">Pendiente de tu firma</Badge>
                    <span>Debes firmar el contrato digitalmente</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">Pendiente de depósito</Badge>
                    <span>Debes realizar el depósito de garantía</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Activo</Badge>
                    <span>El contrato está vigente y en curso</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-semibold text-blue-700">
                  Importante:
                </span>{' '}
                Todos los contratos están protegidos y respaldados por{' '}
                <span className="font-semibold text-orange-600">RentMatch</span>. Ante cualquier
                disputa, nuestro equipo legal te asistirá en el proceso de mediación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalle */}
      <ContractDetailModal
        open={detailOpen}
        id={selectedId}
        onClose={() => setDetailOpen(false)}
        onDeposit={() => router.push("/home/inquilino/depositos")}
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