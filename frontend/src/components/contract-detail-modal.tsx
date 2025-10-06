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
  Car 
} from 'lucide-react'
import api from '@/lib/api'

type ContractDetail = {
  id: string
  status: string
  rent_amount: number
  rent_currency: string
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
  document_url?: string
  created_at: string
}

interface Props {
  open: boolean
  id: string | null
  onClose: () => void
  onDeposit?: () => void
  onSigned?: () => void
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

export default function ContractDetailModal({ open, id, onClose, onDeposit, onSigned }: Props) {
  const [data, setData] = useState<ContractDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    if (!open || !id) return
    setLoading(true)
    setError(null)
    setData(null)
    const token = localStorage.getItem('access_token')
    api.get(`/api/contracts/my/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(() => setError('Error obteniendo el contrato'))
      .finally(() => setLoading(false))
  }, [open, id])

  const handleSign = async () => {
    if (!id) return
    setSigning(true)
    const token = localStorage.getItem('access_token')
    try {
        const res = await api.post(`/api/contracts/my/${id}/sign`, {}, { headers: { Authorization: `Bearer ${token}` } })
        localStorage.setItem('contractId', id) // <-- Guarda el id aquí
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
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
              <p className="mt-4 text-gray-500 text-sm">Cargando información...</p>
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

              {/* Propiedad */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Propiedad</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-blue-700">Dirección:</span>{" "}
                    <span className="text-blue-900">{data.property?.address_line || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Barrio:</span>{" "}
                    <span className="text-blue-900">{data.property?.neighborhood || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Ciudad:</span>{" "}
                    <span className="text-blue-900">{data.property?.city || "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Tipo:</span>{" "}
                    <span className="text-blue-900">{data.property?.property_type || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Ambientes:</span>{" "}
                    <span className="text-blue-900">{data.property?.rooms ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Baños:</span>{" "}
                    <span className="text-blue-900">{data.property?.bathrooms ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Amoblado:</span>{" "}
                    <BooleanBadge value={data.property?.furnished} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Dog className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Mascotas:</span>{" "}
                    <BooleanBadge value={data.property?.pets_allowed} />
                  </div>
                </div>
                {/* Comodidades */}
                {(data.property?.amenities?.length ||
                  BOOLEAN_AMENITIES.some(a => data.property?.[a.key as keyof typeof data.property])) && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-5 border border-teal-200 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wide">Comodidades</h3>
                    </div>
                    {data.property?.amenities && data.property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {data.property.amenities.map(a => (
                            <span key={a} className="px-3 py-1.5 bg-teal-200 text-teal-800 rounded-lg text-xs font-medium">
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
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contrato</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Monto:</span>{" "}
                    ${data.rent_amount?.toLocaleString()} {data.rent_currency}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fechas:</span>{" "}
                    {formatDate(data.start_date)} - {formatDate(data.end_date)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Términos:</span>{" "}
                    {data.terms || "—"}
                  </div>
                </div>
                {data.document_url && (
                <div className="mt-4">
                    <a
                    href={data.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
                    download
                    >
                    <FileText className="w-4 h-4" />
                    Descargar contrato (PDF)
                    </a>
                </div>
                )}
              </div>

              {/* Notas de la propiedad */}
              {data.property?.notes && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="w-5 h-5 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Notas de la propiedad</h3>
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
    </div>
  )
}