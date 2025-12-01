'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import type { AxiosInstance, AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { SearchProfileDetail } from './search-profile-detail-modal'
import LocationSelector from './location-selector'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MapPin, 
  DollarSign, 
  Building2, 
  Users, 
  Sparkles, 
  StickyNote,
  X,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface ApiErrorPayload { error?: string; message?: string }

interface Props {
  open: boolean
  id: string | null
  onClose: () => void
  apiClient: AxiosInstance
  onUpdated?: (data: Partial<SearchProfileDetail> & { id: string }) => void
}

type FormState = Partial<SearchProfileDetail>

const STATUS_OPTIONS = ['activo', 'pausado', 'archivado'] as const

const PROPERTY_TYPE_OPTIONS = ['departamento', 'ph', 'duplex', 'casa', 'estudio'] as const
const isKnownPropertyType = (v: string): v is typeof PROPERTY_TYPE_OPTIONS[number] =>
  (PROPERTY_TYPE_OPTIONS as readonly string[]).includes(v)

const AMENITY_OPTIONS = [
  'wifi',
  'pileta',
  'gimnasio',
  'sum',
  'parrilla',
  'jardin',
  'balcon',
  'terraza',
  'seguridad_24h',
  'cochera',
  'bicicletero',
  'ascensor',
  'calefaccion',
  'aire_acondicionado',
  'portero',
  'mascotas',
  'accesibilidad',
  'lavadero',
  'deposito'
]

const titleCase = (s: string) =>
  s.replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const numberInput = (val: number | null | undefined) => (val == null ? '' : val)

export default function SearchProfileEditModal({ open, id, onClose, apiClient, onUpdated }: Props) {
  const [initial, setInitial] = useState<SearchProfileDetail | null>(null)
  const [form, setForm] = useState<FormState>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [newCustomAmenityError, setNewCustomAmenityError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !id) return
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const token = localStorage.getItem('access_token')
        const res = await apiClient.get<SearchProfileDetail>(`/api/search-profiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setInitial(res.data)
        setForm({
          ...res.data,
          status: res.data.status || STATUS_OPTIONS[0],
          property_types: res.data.property_types || [],
          amenities: res.data.amenities || []
        })
      } catch (err) {
        const e = err as AxiosError<ApiErrorPayload>
        setError(e.response?.data?.error || e.response?.data?.message || 'Error cargando el perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [open, id, apiClient])

  const close = useCallback(() => {
    if (saving) return
    onClose()
    setTimeout(() => {
      setInitial(null)
      setForm({})
      setError(null)
      setSuccess(null)
      setNewAmenity('')
      setNewCustomAmenityError(null)
    }, 200)
  }, [saving, onClose])

  const handleChange = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleBool = useCallback(<K extends keyof FormState>(key: K) => {
    setForm(prev => {
      const current = prev[key]
      const nextValue = typeof current === 'boolean' ? !current : true
      return { ...prev, [key]: nextValue as FormState[K] }
    })
  }, [])

  const diff = useMemo(() => {
    if (!initial) return {}

    type K = keyof FormState
    const changed: Record<K, FormState[K]> = {} as Record<K, FormState[K]>

    for (const key of Object.keys(form) as K[]) {
      const a = form[key]
      const b = initial[key]

      if (Array.isArray(a) && Array.isArray(b)) {
        const same = a.length === b.length && a.every((v, i) => v === b[i])
        if (!same) {
          changed[key] = a as FormState[K]
        }
      } else if (a !== b) {
        changed[key] = a as FormState[K]
      }
    }

    return changed
  }, [form, initial])

  const isDirty = Object.keys(diff).length > 0

  const submit = useCallback(async () => {
    if (!id || !isDirty) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem('access_token')
      await apiClient.patch(`/api/search-profiles/${id}`, diff, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('✅ Perfil actualizado correctamente')
      setInitial(prev => prev ? { ...prev, ...diff } as SearchProfileDetail : prev)
      if (onUpdated) onUpdated({ id, ...diff })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const e = err as AxiosError<ApiErrorPayload>
      setError(e.response?.data?.error || e.response?.data?.message || 'Error guardando')
    } finally {
      setSaving(false)
    }
  }, [apiClient, diff, id, isDirty, onUpdated])

  const toggleInArray = useCallback((field: 'property_types' | 'amenities', value: string) => {
    setForm(prev => {
      const current = (prev[field] ?? []) as string[]
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [field]: next as FormState[typeof field] }
    })
  }, [])

  const addCustomAmenity = useCallback(() => {
    const v = newAmenity.trim().toLowerCase()
    setNewCustomAmenityError(null)
    if (!v) return
    if (v.length < 3) {
      setNewCustomAmenityError('Mínimo 3 caracteres')
      return
    }
    const current = form.amenities || []
    if (current.includes(v)) {
      setNewCustomAmenityError('Ya agregada')
      return
    }
    setForm(prev => ({ ...prev, amenities: [...(prev.amenities || []), v] }))
    setNewAmenity('')
  }, [newAmenity, form.amenities])

  const removeCustomAmenity = useCallback((a: string) => {
    setForm(prev => ({ ...prev, amenities: (prev.amenities || []).filter(x => x !== a) }))
  }, [])

  const ToggleSwitch = useCallback(({ label, fieldKey }: { label: string; fieldKey: keyof FormState }) => {
    const isActive = !!form[fieldKey]
    return (
      <button
        type="button"
        onClick={() => toggleBool(fieldKey)}
        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
          isActive 
            ? 'bg-green-50 border-green-300 hover:bg-green-100' 
            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={`text-sm font-medium ${isActive ? 'text-green-900' : 'text-gray-700'}`}>
          {label}
        </span>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${
          isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            isActive ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </button>
    )
  }, [form, toggleBool])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Save className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Editar Perfil de Búsqueda</h2>
          </div>
          <button
            onClick={close}
            disabled={saving}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading && (
            <div className="space-y-5">
              {/* Ubicación skeleton */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Economía skeleton */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200 space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Características skeleton */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200 space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-semibold text-sm">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          {!loading && !error && initial && (
            <>
              {/* Ubicación */}
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Ubicación</h3>
                </div>
                <LocationSelector
                  selectedCity={form.city}
                  selectedNeighborhood={form.neighborhood}
                  onCityChange={city => handleChange('city', city)}
                  onNeighborhoodChange={neighborhood => handleChange('neighborhood', neighborhood)}
                />
              </div>

              {/* Economía */}
              <div className="bg-orange-50/30 rounded-xl p-5 border border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Economía & Estado</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Presupuesto Mín ($)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      value={numberInput(form.budget_min)}
                      onChange={e => handleChange('budget_min', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Presupuesto Máx ($)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      value={numberInput(form.budget_max)}
                      onChange={e => handleChange('budget_max', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="∞"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Plazo del Contrato (meses)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      value={numberInput(form.lease_term_months)}
                      onChange={e => handleChange('lease_term_months', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Estado del Perfil</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      value={form.status || STATUS_OPTIONS[0]}
                      onChange={e => handleChange('status', e.target.value as FormState['status'])}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{titleCase(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tipos de Propiedad */}
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Tipos de Propiedad</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPE_OPTIONS.map(pt => {
                    const active = (form.property_types || []).includes(pt)
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => toggleInArray('property_types', pt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          active
                            ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {titleCase(pt)}
                      </button>
                    )
                  })}
                </div>
                {(form.property_types || []).some(t => !isKnownPropertyType(t)) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Otros tipos personalizados:</p>
                    <div className="flex flex-wrap gap-2">
                      {(form.property_types || [])
                        .filter(t => !isKnownPropertyType(t))
                        .map(t => (
                          <span
                            key={t}
                            className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            {titleCase(t)}
                            <button
                              type="button"
                              className="text-orange-600 hover:text-red-600 font-bold"
                              onClick={() =>
                                handleChange(
                                  'property_types',
                                  (form.property_types || []).filter(x => x !== t)
                                )
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rangos */}
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Características de la Propiedad</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Dormitorios (Mín - Máx)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.bedroom_min)}
                        onChange={e => handleChange('bedroom_min', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.bedroom_max)}
                        onChange={e => handleChange('bedroom_max', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="∞"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Ambientes (Mín - Máx)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.rooms_min)}
                        onChange={e => handleChange('rooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.rooms_max)}
                        onChange={e => handleChange('rooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="∞"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Baños (Mín - Máx)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.bathrooms_min)}
                        onChange={e => handleChange('bathrooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.bathrooms_max)}
                        onChange={e => handleChange('bathrooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="∞"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Área m² (Mín - Máx)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.area_min)}
                        onChange={e => handleChange('area_min', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        value={numberInput(form.area_max)}
                        onChange={e => handleChange('area_max', e.target.value === '' ? undefined : Number(e.target.value))}
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferencias */}
              <div className="bg-orange-50/30 rounded-xl p-5 border border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Preferencias & Condiciones</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <ToggleSwitch label="Amoblado" fieldKey="furnished" />
                  <ToggleSwitch label="Mascotas Permitidas" fieldKey="pets_allowed" />
                  <ToggleSwitch label="Fumadores Permitidos" fieldKey="smokers_allowed" />
                  <ToggleSwitch label="Niños" fieldKey="children" />
                  <ToggleSwitch label="Estudiantes" fieldKey="students" />
                  <ToggleSwitch label="Estacionamiento Necesario" fieldKey="parking_needed" />
                  <ToggleSwitch label="Landlord Verificado" fieldKey="require_verified_landlord" />
                  <ToggleSwitch label="Balcón" fieldKey="balcony" />
                  <ToggleSwitch label="Terraza" fieldKey="terrace" />
                  <ToggleSwitch label="Lavadero" fieldKey="laundry" />
                  <ToggleSwitch label="Seguridad" fieldKey="security" />
                  <ToggleSwitch label="Ascensor" fieldKey="elevator" />
                </div>
              </div>

              {/* Amenidades */}
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Amenidades</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {AMENITY_OPTIONS.map(a => {
                    const active = (form.amenities || []).includes(a)
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleInArray('amenities', a)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          active
                            ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {titleCase(a)}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Añadir Amenidad Personalizada
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                      placeholder="Ej: cine, cowork..."
                      value={newAmenity}
                      onChange={e => setNewAmenity(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomAmenity()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300"
                      onClick={addCustomAmenity}
                    >
                      Agregar
                    </Button>
                  </div>
                  {newCustomAmenityError && (
                    <p className="text-xs text-red-600 mt-2">{newCustomAmenityError}</p>
                  )}
                </div>

                {(form.amenities || []).some(a => !AMENITY_OPTIONS.includes(a)) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Amenidades personalizadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {(form.amenities || [])
                        .filter(a => !AMENITY_OPTIONS.includes(a))
                        .map(a => (
                          <span
                            key={a}
                            className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            {titleCase(a)}
                            <button
                              type="button"
                              className="text-orange-600 hover:text-red-600 font-bold"
                              onClick={() => removeCustomAmenity(a)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <StickyNote className="w-5 h-5 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Notas Adicionales</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                      Preferencias (texto libre)
                    </label>
                    <textarea
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm h-24 resize-y focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      value={form.metadata?.preferencias || ''}
                      onChange={e =>
                        handleChange('metadata', {
                          ...(form.metadata || {}),
                          preferencias: e.target.value
                        })
                      }
                      placeholder="Describe tus preferencias específicas..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Notas</label>
                    <textarea
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm h-24 resize-y focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      value={form.metadata?.notas || ''}
                      onChange={e =>
                        handleChange('metadata', {
                          ...(form.metadata || {}),
                          notas: e.target.value
                        })
                      }
                      placeholder="Agrega notas adicionales..."
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">
                  {Object.keys(diff).length} cambio{Object.keys(diff).length !== 1 ? 's' : ''} sin guardar
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Sin cambios pendientes</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={close}
              disabled={saving}
              className="hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={!isDirty || saving}
              className={`${
                isDirty 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-gray-300'
              } text-white transition-all`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}