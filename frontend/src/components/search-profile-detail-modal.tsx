'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AxiosInstance, AxiosError } from 'axios'

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

  const bool = (v?: boolean) => (v ? 'Sí' : 'No')
  const cap = (s?: string) =>
    s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : s

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Detalle del Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            Cerrar
          </button>
        </div>
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          {!loading && !error && data && (
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ubicación</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Ciudad:</span> {cap(data.city) || '—'}</div>
                  <div><span className="font-medium">Barrio:</span> {cap(data.neighborhood) || '—'}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Economía</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Presupuesto Mín:</span> ${data.budget_min?.toLocaleString() || '—'}</div>
                  <div><span className="font-medium">Presupuesto Máx:</span> ${data.budget_max?.toLocaleString() || '—'}</div>
                  <div><span className="font-medium">Meses de contrato:</span> {data.lease_term_months || '—'}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Propiedad</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Tipos:</span>{' '}
                    {data.property_types?.map(t => cap(t)).join(', ') || '—'}
                  </div>
                  <div><span className="font-medium">Dormitorios:</span> {data.bedroom_min || '—'} - {data.bedroom_max || '—'}</div>
                  <div><span className="font-medium">Ambientes:</span> {data.rooms_min || '—'} - {data.rooms_max || '—'}</div>
                  <div><span className="font-medium">Baños:</span> {data.bathrooms_min || '—'} - {data.bathrooms_max || '—'}</div>
                  <div><span className="font-medium">Área (m²):</span> {data.area_min || '—'} - {data.area_max || '—'}</div>
                  <div><span className="font-medium">Amoblado:</span> {bool(data.furnished)}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Preferencias</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Mascotas:</span> {bool(data.pets_allowed)}</div>
                  <div><span className="font-medium">Fumadores:</span> {bool(data.smokers_allowed)}</div>
                  <div><span className="font-medium">Niños:</span> {bool(data.children)}</div>
                  <div><span className="font-medium">Estudiantes:</span> {bool(data.students)}</div>
                  <div><span className="font-medium">Estacionamiento:</span> {data.parking_needed ? 'Necesario' : 'Opcional'}</div>
                  <div><span className="font-medium">Landlord verificado:</span> {bool(data.require_verified_landlord)}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Comodidades</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.amenities?.length
                    ? data.amenities.map(a => (
                      <span key={a} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                        {cap(a)}
                      </span>
                    ))
                    : <span className="text-gray-500">—</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Balcón:</span> {bool(data.balcony)}</div>
                  <div><span className="font-medium">Terraza:</span> {bool(data.terrace)}</div>
                  <div><span className="font-medium">Lavadero:</span> {bool(data.laundry)}</div>
                  <div><span className="font-medium">Seguridad:</span> {bool(data.security)}</div>
                  <div><span className="font-medium">Ascensor:</span> {bool(data.elevator)}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Notas</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Preferencias:</span><br />
                    {data.metadata?.preferencias || <span className="text-gray-500">—</span>}
                  </div>
                  <div>
                    <span className="font-medium">Notas:</span><br />
                    {data.metadata?.notas || <span className="text-gray-500">—</span>}
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}