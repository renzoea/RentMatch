'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Home,
  X,
  CheckCircle2,
  ShieldCheck,
  Dog,
  ClipboardCheck,
  Bed,
  Bath,
  StickyNote,
  Sparkles,
  Sun,
  Wind,
  Lock,
  MoveUp,
  Waves,
  Car,
  User,
  Mail,
  Phone
} from 'lucide-react'
import api from '@/lib/api'
import PDFViewerModal from './pdf-viewer-modal'
import { Skeleton } from '@/components/ui/skeleton'

type ContractDetail = {
  id: string
  status: string
  rent_amount: number
  rent_currency: string
  deposit_amount: number
  start_date: string
  end_date: string
  terms?: string
  property?: {
    address_line: string
    city: string
    neighborhood?: string
    property_type: string
    rooms?: number
    bathrooms?: number
    furnished?: boolean
    amenities?: string[]
    pets_allowed?: boolean
    notes?: string
    // Boolean amenities
    wifi?: boolean
    pileta?: boolean
    gimnasio?: boolean
    sum?: boolean
    parrilla?: boolean
    jardin?: boolean
    balcon?: boolean
    terraza?: boolean
    seguridad_24h?: boolean
    cochera?: boolean
    bicicletero?: boolean
    ascensor?: boolean
    calefaccion?: boolean
    aire_acondicionado?: boolean
    portero?: boolean
    mascotas?: boolean
    accesibilidad?: boolean
    lavadero?: boolean
  }
  landlord?: {
    full_name: string
    email: string
    phone: string
  }
  document_url?: string
  created_at: string
}

interface Props {
  open: boolean
  id: string | null
  onClose: () => void
  onDeposit?: () => void
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft": return "Borrador"
    case "pending_signatures": return "Pendiente de firmas"
    case "pending_deposit": return "Pendiente de depósito"
    case "active": return "Activo"
    case "terminated": return "Terminado"
    default: return status
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700"
    case "pending_signatures": return "bg-yellow-100 text-yellow-700"
    case "pending_deposit": return "bg-blue-100 text-blue-700"
    case "terminated": return "bg-gray-100 text-gray-700"
    default: return "bg-orange-100 text-orange-700"
  }
}

const BooleanBadge = ({ value, trueText = 'Sí', falseText = 'No' }: { value?: boolean; trueText?: string; falseText?: string }) => {
  if (value === undefined) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      value 
        ? 'bg-green-100 text-green-700' 
        : 'bg-gray-100 text-gray-600'
    }`}>
      {value && <CheckCircle2 className="w-3 h-3" />}
      {value ? trueText : falseText}
    </span>
  )
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wifi',
  pileta: 'Pileta',
  gimnasio: 'Gimnasio',
  sum: 'SUM',
  parrilla: 'Parrilla',
  jardin: 'Jardín',
  balcon: 'Balcón',
  terraza: 'Terraza',
  seguridad_24h: 'Seguridad 24h',
  cochera: 'Cochera',
  bicicletero: 'Bicicletero',
  ascensor: 'Ascensor',
  calefaccion: 'Calefacción',
  aire_acondicionado: 'Aire Acondicionado',
  portero: 'Portero',
  mascotas: 'Mascotas',
  accesibilidad: 'Accesibilidad',
  lavadero: 'Lavadero'
}

const BOOLEAN_AMENITIES = [
  { key: 'wifi', label: 'Wifi', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'pileta', label: 'Pileta', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'gimnasio', label: 'Gimnasio', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'sum', label: 'SUM', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'parrilla', label: 'Parrilla', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'jardin', label: 'Jardín', icon: <Home className="w-4 h-4 text-teal-600" /> },
  { key: 'balcon', label: 'Balcón', icon: <Sun className="w-4 h-4 text-teal-600" /> },
  { key: 'terraza', label: 'Terraza', icon: <Waves className="w-4 h-4 text-teal-600" /> },
  { key: 'seguridad_24h', label: 'Seguridad 24h', icon: <Lock className="w-4 h-4 text-teal-600" /> },
  { key: 'cochera', label: 'Cochera', icon: <Car className="w-4 h-4 text-teal-600" /> },
  { key: 'bicicletero', label: 'Bicicletero', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'ascensor', label: 'Ascensor', icon: <MoveUp className="w-4 h-4 text-teal-600" /> },
  { key: 'calefaccion', label: 'Calefacción', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'aire_acondicionado', label: 'Aire Acondicionado', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'portero', label: 'Portero', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'mascotas', label: 'Mascotas', icon: <Dog className="w-4 h-4 text-teal-600" /> },
  { key: 'accesibilidad', label: 'Accesibilidad', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
  { key: 'lavadero', label: 'Lavadero', icon: <Wind className="w-4 h-4 text-teal-600" /> }
];

export default function ContractDetailModal({ open, id, onClose, onDeposit }: Props) {
  const [data, setData] = useState<ContractDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)

  useEffect(() => {
    if (!open || !id) return
    setLoading(true)
    setError(null)
    setData(null)
    api.get(`/api/contracts/my/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError('Error obteniendo el contrato'))
      .finally(() => setLoading(false))
  }, [open, id])

  const handleSign = async () => {
    if (!id) return
    setSigning(true)
    try {
        const res = await api.post(`/api/contracts/my/${id}/sign`, {})
        localStorage.setItem('contractId', id)
        localStorage.setItem('envelopeId', res.data.envelopeId)
        window.location.href = res.data.url
    } catch {
        setError('Error al iniciar la firma del contrato')
    } finally {
        setSigning(false)
    }
    }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Detalle del Contrato</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {loading && (
            <div className="space-y-5">
              {/* Estado skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>

              {/* Propietario skeleton */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              {/* Propiedad skeleton */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              {/* Contrato skeleton */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                <Skeleton className="h-5 w-28" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-0.5">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-semibold text-sm">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-5">
              {/* Estado */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs ${getStatusBadgeClass(data.status)}`}>
                  <ShieldCheck className="w-4 h-4" />
                  {getStatusLabel(data.status)}
                </span>
                {data.status === "active" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Información del Propietario */}
              {data.landlord && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Propietario</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Nombre:</span>{" "}
                      <span className="text-gray-900">{data.landlord.full_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      <span className="text-gray-900">{data.landlord.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Teléfono:</span>{" "}
                      <span className="text-gray-900">{data.landlord.phone || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Propiedad */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Propiedad</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.property?.address_line && (
                    <div>
                      <span className="font-medium text-gray-700">Dirección:</span>{" "}
                      <span className="text-gray-900">{data.property.address_line}</span>
                    </div>
                  )}
                  {data.property?.neighborhood && (
                    <div>
                      <span className="font-medium text-gray-700">Barrio:</span>{" "}
                      <span className="text-gray-900">{data.property.neighborhood}</span>
                    </div>
                  )}
                  {data.property?.city && (
                    <div>
                      <span className="font-medium text-gray-700">Ciudad:</span>{" "}
                      <span className="text-gray-900">{data.property.city}</span>
                    </div>
                  )}
                  {data.property?.property_type && (
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>{" "}
                      <span className="text-gray-900">{data.property.property_type}</span>
                    </div>
                  )}
                  {data.property?.rooms !== undefined && data.property?.rooms !== null && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Ambientes:</span>{" "}
                      <span className="text-gray-900">{data.property.rooms}</span>
                    </div>
                  )}
                  {data.property?.bathrooms !== undefined && data.property?.bathrooms !== null && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Baños:</span>{" "}
                      <span className="text-gray-900">{data.property.bathrooms}</span>
                    </div>
                  )}
                  {data.property?.furnished !== undefined && data.property?.furnished !== null && (
                    <div>
                      <span className="font-medium text-gray-700">Amoblado:</span>{" "}
                      <BooleanBadge value={data.property.furnished} />
                    </div>
                  )}
                  {data.property?.pets_allowed !== undefined && data.property?.pets_allowed !== null && (
                    <div className="flex items-center gap-1">
                      <Dog className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700">Mascotas:</span>{" "}
                      <BooleanBadge value={data.property.pets_allowed} />
                    </div>
                  )}
                </div>
                {/* Comodidades */}
                {(data.property?.amenities?.length ||
                  BOOLEAN_AMENITIES.some(a => data.property?.[a.key as keyof typeof data.property])) && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Comodidades</h3>
                    </div>
                    {data.property?.amenities && data.property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {data.property.amenities.map(a => (
                            <span key={a} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                              {AMENITY_LABELS[a] || a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {BOOLEAN_AMENITIES.map(({ key, label, icon }) =>
                        data.property && data.property[key as keyof typeof data.property] ? (
                          <div key={key} className="flex items-center gap-2">
                            {icon}
                            <span className="text-teal-900 text-sm">{label}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contrato */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contrato</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.rent_amount !== undefined && data.rent_amount !== null && (
                    <div>
                      <span className="font-medium text-gray-700">Alquiler mensual:</span>{" "}
                      ${data.rent_amount.toLocaleString()} ARS
                    </div>
                  )}
                  {data.deposit_amount !== undefined && data.deposit_amount !== null && (
                    <div>
                      <span className="font-medium text-gray-700">Depósito:</span>{" "}
                      ${data.deposit_amount.toLocaleString()} ARS
                    </div>
                  )}
                  {data.start_date && data.end_date && (
                    <div>
                      <span className="font-medium text-gray-700">Fechas:</span>{" "}
                      {formatDate(data.start_date)} - {formatDate(data.end_date)}
                    </div>
                  )}
                  {data.terms && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Términos:</span>{" "}
                      <span className="text-gray-900">{data.terms}</span>
                    </div>
                  )}
                </div>
                {data.document_url && (
                <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPdfViewerOpen(true)}
                      className="bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 border-blue-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Contrato PDF
                    </Button>
                </div>
                )}
              </div>

              {/* Notas de la propiedad */}
              {data.property?.notes && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notas de la propiedad</h3>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-slate-600 text-sm leading-relaxed">{data.property.notes}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end pt-4 border-t border-gray-200 gap-2">
                {data.status === "pending_signatures" && (
                  <Button variant="default" onClick={handleSign} disabled={signing}>
                    {signing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Firmando...
                      </span>
                    ) : (
                      "Firmar Contrato"
                    )}
                  </Button>
                )}
                {data.status === "pending_deposit" && (
                  <Button variant="default" onClick={onDeposit}>
                    Ir a Depósitos
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visor PDF */}
      {data?.document_url && (
        <PDFViewerModal
          open={pdfViewerOpen}
          pdfUrl={data.document_url}
          onClose={() => setPdfViewerOpen(false)}
          title="Contrato PDF"
        />
      )}
    </div>
  )
}