'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AxiosInstance, AxiosError } from 'axios'
import { 
  MapPin, 
  DollarSign, 
  Home, 
  Users, 
  Sparkles, 
  StickyNote,
  X,
  Bed,
  Bath,
  Calendar,
  Maximize,
  Check,
  Building2,
  Car,
  Shield,
  Sun,
  Waves,
  Wind,
  Lock,
  MoveUp
} from 'lucide-react'

export type SearchProfileDetail = {
  id: string
  property_types: string[]
  status: string
  budget_min?: number
  budget_max?: number
  city?: string
  neighborhood?: string
  created_at: string
  amenities?: string[]
  metadata?: { preferencias?: string; notas?: string }
  rooms_min?: number
  rooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  furnished?: boolean
  pets_allowed?: boolean
  smokers_allowed?: boolean
  lease_term_months?: number
  occupants?: number
  children?: boolean
  students?: boolean
  parking_needed?: boolean
  require_verified_landlord?: boolean
  bedroom_min?: number
  bedroom_max?: number
  balcony?: boolean
  terrace?: boolean
  laundry?: boolean
  security?: boolean
  elevator?: boolean
  area_min?: number
  area_max?: number
}

interface ApiErrorPayload {
  error?: string
  message?: string
}

interface Props {
  open: boolean
  id: string | null
  onClose: () => void
  apiClient: AxiosInstance
}

export default function SearchProfileDetailModal({ open, id, onClose, apiClient }: Props) {
  const [data, setData] = useState<SearchProfileDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache] = useState<Map<string, SearchProfileDetail>>(() => new Map())

  useEffect(() => {
    if (!open || !id) return
    if (cache.has(id)) {
      setData(cache.get(id) || null)
      return
    }

    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const token = localStorage.getItem('access_token')
        const res = await apiClient.get<SearchProfileDetail>(`/api/search-profiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data)
        cache.set(id, res.data)
      } catch (err: unknown) {
        const axiosErr = err as AxiosError<ApiErrorPayload>
        setError(
          axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          'Error obteniendo el perfil'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [open, id, apiClient, cache])

  if (!open) return null

  const cap = (s?: string) =>
    s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : s

  const BooleanBadge = ({ value, trueText = 'Sí', falseText = 'No' }: { value?: boolean; trueText?: string; falseText?: string }) => {
    if (value === undefined) return null
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        value 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {value && <Check className="w-3 h-3" />}
        {value ? trueText : falseText}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Detalle del Perfil</h2>
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
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
              {/* Ubicación */}
              {(data.city || data.neighborhood) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Ubicación</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.city && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-700 font-medium text-sm">Ciudad:</span>
                        <span className="text-gray-900 text-sm">{cap(data.city)}</span>
                      </div>
                    )}
                    {data.neighborhood && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-700 font-medium text-sm">Barrio:</span>
                        <span className="text-gray-900 text-sm">{cap(data.neighborhood)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Economía */}
              {(data.budget_min || data.budget_max || data.lease_term_months) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Economía</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.budget_min && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-sm">Presupuesto Mín:</span>
                        <span className="text-gray-900 font-bold text-sm">${data.budget_min.toLocaleString()}</span>
                      </div>
                    )}
                    {data.budget_max && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-sm">Presupuesto Máx:</span>
                        <span className="text-gray-900 font-bold text-sm">${data.budget_max.toLocaleString()}</span>
                      </div>
                    )}
                    {data.lease_term_months && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700 font-medium text-sm">Contrato:</span>
                        <span className="text-gray-900 text-sm">{data.lease_term_months} meses</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Propiedad */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Propiedad</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.property_types?.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-gray-700 font-medium text-sm block mb-2">Tipos:</span>
                      <div className="flex flex-wrap gap-2">
                        {data.property_types.map(t => (
                          <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {cap(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(data.bedroom_min || data.bedroom_max) && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Dormitorios:</span>
                      <span className="text-gray-900 text-sm">{data.bedroom_min || 0} - {data.bedroom_max || '∞'}</span>
                    </div>
                  )}
                  {(data.rooms_min || data.rooms_max) && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Ambientes:</span>
                      <span className="text-gray-900 text-sm">{data.rooms_min || 0} - {data.rooms_max || '∞'}</span>
                    </div>
                  )}
                  {(data.bathrooms_min || data.bathrooms_max) && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Baños:</span>
                      <span className="text-gray-900 text-sm">{data.bathrooms_min || 0} - {data.bathrooms_max || '∞'}</span>
                    </div>
                  )}
                  {(data.area_min || data.area_max) && (
                    <div className="flex items-center gap-2">
                      <Maximize className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Área (m²):</span>
                      <span className="text-gray-900 text-sm">{data.area_min || 0} - {data.area_max || '∞'}</span>
                    </div>
                  )}
                  {data.furnished !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">Amoblado:</span>
                      <BooleanBadge value={data.furnished} />
                    </div>
                  )}
                </div>
              </div>

              {/* Preferencias */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preferencias</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.pets_allowed !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">Mascotas:</span>
                      <BooleanBadge value={data.pets_allowed} />
                    </div>
                  )}
                  {data.smokers_allowed !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">Fumadores:</span>
                      <BooleanBadge value={data.smokers_allowed} />
                    </div>
                  )}
                  {data.children !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">Niños:</span>
                      <BooleanBadge value={data.children} />
                    </div>
                  )}
                  {data.students !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium text-sm">Estudiantes:</span>
                      <BooleanBadge value={data.students} />
                    </div>
                  )}
                  {data.parking_needed !== undefined && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Estacionamiento:</span>
                      <BooleanBadge value={data.parking_needed} trueText="Necesario" falseText="Opcional" />
                    </div>
                  )}
                  {data.require_verified_landlord !== undefined && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700 font-medium text-sm">Landlord verificado:</span>
                      <BooleanBadge value={data.require_verified_landlord} />
                    </div>
                  )}
                </div>
              </div>

              {/* Comodidades */}
              {(data.amenities?.length || data.balcony || data.terrace || data.laundry || data.security || data.elevator) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Comodidades</h3>
                  </div>
                  {data.amenities && data.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {data.amenities.map(a => (
                          <span key={a} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {cap(a)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.balcony && (
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-900 text-sm">Balcón</span>
                      </div>
                    )}
                    {data.terrace && (
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-900 text-sm">Terraza</span>
                      </div>
                    )}
                    {data.laundry && (
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-900 text-sm">Lavadero</span>
                      </div>
                    )}
                    {data.security && (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-900 text-sm">Seguridad</span>
                      </div>
                    )}
                    {data.elevator && (
                      <div className="flex items-center gap-2">
                        <MoveUp className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-900 text-sm">Ascensor</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              {(data.metadata?.preferencias || data.metadata?.notas) && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <StickyNote className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notas</h3>
                  </div>
                  <div className="space-y-3">
                    {data.metadata?.preferencias && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium text-sm block mb-1">Preferencias:</span>
                        <p className="text-gray-600 text-sm leading-relaxed">{data.metadata.preferencias}</p>
                      </div>
                    )}
                    {data.metadata?.notas && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium text-sm block mb-1">Notas:</span>
                        <p className="text-gray-600 text-sm leading-relaxed">{data.metadata.notas}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}