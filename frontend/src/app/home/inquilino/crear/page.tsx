'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import LocationSelector from '@/components/location-selector'
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  DollarSign, 
  Building2, 
  Users, 
  Sparkles, 
  StickyNote,
  AlertCircle,
  Home as HomeIcon
} from 'lucide-react'
import type { AxiosError } from 'axios'

interface ApiErrorPayload {
  error?: string
  message?: string
}

type FormData = {
  city?: string
  neighborhood?: string
  budget_min?: number
  budget_max?: number
  property_types: string[]
  rooms_min?: number
  rooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  furnished?: boolean
  pets_allowed?: boolean
  smokers_allowed?: boolean
  amenities: string[]
  lease_term_months?: number
  occupants?: number
  children?: boolean
  students?: boolean
  parking_needed?: boolean
  require_verified_landlord?: boolean
  status: string
  bedroom_min?: number
  bedroom_max?: number
  balcony?: boolean
  terrace?: boolean
  laundry?: boolean
  security?: boolean
  elevator?: boolean
  area_min?: number
  area_max?: number
  metadata?: {
    preferencias?: string
    notas?: string
  }
}

const STATUS_OPTIONS = ['activo', 'pausado', 'archivado'] as const
const PROPERTY_TYPE_OPTIONS = ['departamento', 'ph', 'duplex', 'casa', 'estudio'] as const
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

export default function CrearPerfilBusqueda() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [newAmenityError, setNewAmenityError] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    status: 'activo',
    property_types: [],
    amenities: [],
  })

  const handleChange = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleBool = useCallback(<K extends keyof FormData>(key: K) => {
    setForm(prev => {
      const current = prev[key]
      const nextValue = typeof current === 'boolean' ? !current : true
      return { ...prev, [key]: nextValue as FormData[K] }
    })
  }, [])

  const toggleInArray = useCallback((field: 'property_types' | 'amenities', value: string) => {
    setForm(prev => {
      const current = prev[field]
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [field]: next }
    })
  }, [])

  const addCustomAmenity = useCallback(() => {
    const v = newAmenity.trim().toLowerCase()
    setNewAmenityError(null)
    if (!v) return
    if (v.length < 3) {
      setNewAmenityError('Mínimo 3 caracteres')
      return
    }
    if (form.amenities.includes(v)) {
      setNewAmenityError('Ya agregada')
      return
    }
    setForm(prev => ({ ...prev, amenities: [...prev.amenities, v] }))
    setNewAmenity('')
  }, [newAmenity, form.amenities])

  const removeCustomAmenity = useCallback((a: string) => {
    setForm(prev => ({ ...prev, amenities: prev.amenities.filter(x => x !== a) }))
  }, [])

  const ToggleSwitch = useCallback(({ label, fieldKey }: { label: string; fieldKey: keyof FormData }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      await api.post('/api/search-profiles', form)
      router.push('/home/inquilino')
    } catch (err) {
      const e = err as AxiosError<ApiErrorPayload>
      setError(e.response?.data?.error || e.response?.data?.message || 'Error creando el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-orange-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Crear Perfil de Búsqueda</h1>
              <p className="text-gray-600 mt-1">
                Completa la información para que podamos encontrar la propiedad ideal para ti
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Ubicación */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Ubicación</h3>
            </div>
            <LocationSelector
              selectedCity={form.city}
              selectedNeighborhood={form.neighborhood}
              onCityChange={city => handleChange('city', city)}
              onNeighborhoodChange={neighborhood => handleChange('neighborhood', neighborhood)}
              required
            />
          </div>

          {/* Economía */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Economía & Estado</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Presupuesto Mín ($) *</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-2 border-green-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  value={numberInput(form.budget_min)}
                  onChange={e => handleChange('budget_min', e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Presupuesto Máx ($) *</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-2 border-green-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  value={numberInput(form.budget_max)}
                  onChange={e => handleChange('budget_max', e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="∞"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Plazo del Contrato (meses)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-2 border-green-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  value={numberInput(form.lease_term_months)}
                  onChange={e => handleChange('lease_term_months', e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="12"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Estado del Perfil</label>
                <select
                  className="w-full rounded-lg border-2 border-green-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{titleCase(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tipos de Propiedad */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tipos de Propiedad *</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {PROPERTY_TYPE_OPTIONS.map(pt => {
                const active = form.property_types.includes(pt)
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => toggleInArray('property_types', pt)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      active
                        ? 'bg-purple-500 border-purple-600 text-white shadow-md scale-105'
                        : 'bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    {titleCase(pt)}
                  </button>
                )
              })}
            </div>
            {form.property_types.length === 0 && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Selecciona al menos un tipo de propiedad
              </p>
            )}
          </div>

          {/* Características */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Características de la Propiedad</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Dormitorios (Mín - Máx)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.bedroom_min)}
                    onChange={e => handleChange('bedroom_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.bedroom_max)}
                    onChange={e => handleChange('bedroom_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Ambientes (Mín - Máx)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.rooms_min)}
                    onChange={e => handleChange('rooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.rooms_max)}
                    onChange={e => handleChange('rooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Baños (Mín - Máx)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.bathrooms_min)}
                    onChange={e => handleChange('bathrooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.bathrooms_max)}
                    onChange={e => handleChange('bathrooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Área m² (Mín - Máx)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.area_min)}
                    onChange={e => handleChange('area_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="0"
                  />
                  <input
                    type="number"
                    className="w-1/2 rounded-lg border-2 border-indigo-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    value={numberInput(form.area_max)}
                    onChange={e => handleChange('area_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="∞"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preferencias & Condiciones</h3>
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Amenidades</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {AMENITY_OPTIONS.map(a => {
                const active = form.amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleInArray('amenities', a)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      active
                        ? 'bg-teal-500 border-teal-600 text-white shadow-md'
                        : 'bg-white border-teal-200 text-teal-700 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    {titleCase(a)}
                  </button>
                )
              })}
            </div>

            <div className="pt-4 border-t border-teal-200">
              <label className="block text-xs font-semibold text-teal-700 mb-2">
                Añadir Amenidad Personalizada
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border-2 border-teal-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={addCustomAmenity}
                >
                  Agregar
                </Button>
              </div>
              {newAmenityError && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {newAmenityError}
                </p>
              )}
            </div>

            {form.amenities.some(a => !AMENITY_OPTIONS.includes(a)) && (
              <div className="mt-4 pt-4 border-t border-teal-200">
                <p className="text-xs font-semibold text-teal-700 mb-2">Amenidades personalizadas:</p>
                <div className="flex flex-wrap gap-2">
                  {form.amenities
                    .filter(a => !AMENITY_OPTIONS.includes(a))
                    .map(a => (
                      <span
                        key={a}
                        className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {titleCase(a)}
                        <button
                          type="button"
                          className="text-teal-600 hover:text-red-600 font-bold"
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <StickyNote className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notas Adicionales</h3>
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

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || form.property_types.length === 0}
              className={`${
                form.property_types.length > 0
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-gray-300'
              } text-white transition-all shadow-lg`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Crear Perfil
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}