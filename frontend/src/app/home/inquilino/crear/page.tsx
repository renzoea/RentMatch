'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-xs font-semibold text-gray-500 uppercase">{title}</h3>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </section>
)

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

  const numberInput = (val: number | null | undefined) => (val == null ? '' : val)

  const titleCase = (s: string) =>
    s.replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

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

  const BoolButton = useCallback(({ label, fieldKey }: { label: string; fieldKey: keyof FormData }) => (
    <button
      type="button"
      onClick={() => toggleBool(fieldKey)}
      className={`text-sm px-3 py-2 rounded border flex justify-between items-center ${
        form[fieldKey] ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-600'
      }`}
    >
      <span>{label}</span>
      <span className="font-semibold">{form[fieldKey] ? 'Sí' : 'No'}</span>
    </button>
  ), [form, toggleBool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const token = localStorage.getItem('access_token')
      await api.post('/api/search-profiles', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      router.push('/home/inquilino')
    } catch (err) {
      const e = err as AxiosError<ApiErrorPayload>
      setError(e.response?.data?.error || e.response?.data?.message || 'Error creando el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold mb-2">Crear Perfil de Búsqueda</h1>
        <p className="text-gray-600">
          Completa la información para que podamos encontrar la propiedad ideal para ti
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <Section title="Ubicación">
              <div>
                <label className="text-xs font-medium text-gray-600">Ciudad *</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.city || ''}
                  onChange={e => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Barrio</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.neighborhood || ''}
                  onChange={e => handleChange('neighborhood', e.target.value)}
                />
              </div>
            </Section>

            <Section title="Presupuesto">
              <div>
                <label className="text-xs font-medium text-gray-600">Presupuesto Mínimo *</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={numberInput(form.budget_min)}
                  onChange={e => handleChange('budget_min', e.target.value === '' ? undefined : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Presupuesto Máximo *</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={numberInput(form.budget_max)}
                  onChange={e => handleChange('budget_max', e.target.value === '' ? undefined : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Plazo (meses)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={numberInput(form.lease_term_months)}
                  onChange={e => handleChange('lease_term_months', e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Estado</label>
                <select
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{titleCase(s)}</option>
                  ))}
                </select>
              </div>
            </Section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Tipos de Propiedad *</h3>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map(pt => {
                  const active = form.property_types.includes(pt)
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => toggleInArray('property_types', pt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        active
                          ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600'
                      }`}
                    >
                      {titleCase(pt)}
                    </button>
                  )
                })}
              </div>
              {form.property_types.length === 0 && (
                <p className="text-xs text-red-600">Selecciona al menos un tipo de propiedad</p>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Amenidades</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(a => {
                  const active = form.amenities.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleInArray('amenities', a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        active
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                      }`}
                    >
                      {titleCase(a)}
                    </button>
                  )
                })}
              </div>

              <div className="pt-2 space-y-2">
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Añadir Amenidad Personalizada
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ej: cine, cowork..."
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
                    className="text-xs"
                    onClick={addCustomAmenity}
                  >
                    Agregar
                  </Button>
                </div>
                {newAmenityError && (
                  <p className="text-xs text-red-600">{newAmenityError}</p>
                )}
              </div>

              {form.amenities.some(a => !AMENITY_OPTIONS.includes(a)) && (
                <div className="pt-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Personalizadas</p>
                  <div className="flex flex-wrap gap-2">
                    {form.amenities
                      .filter(a => !AMENITY_OPTIONS.includes(a))
                      .map(a => (
                        <span
                          key={a}
                          className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {titleCase(a)}
                          <button
                            type="button"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => removeCustomAmenity(a)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </section>

            <Section title="Rangos / Cantidades">
              <div>
                <label className="text-xs font-medium text-gray-600">Dormitorios Mín - Máx</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.bedroom_min)}
                    onChange={e => handleChange('bedroom_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.bedroom_max)}
                    onChange={e => handleChange('bedroom_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Máx"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Ambientes Mín - Máx</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.rooms_min)}
                    onChange={e => handleChange('rooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.rooms_max)}
                    onChange={e => handleChange('rooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Máx"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Baños Mín - Máx</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.bathrooms_min)}
                    onChange={e => handleChange('bathrooms_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.bathrooms_max)}
                    onChange={e => handleChange('bathrooms_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Máx"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Área m² Mín - Máx</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.area_min)}
                    onChange={e => handleChange('area_min', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    className="mt-1 w-1/2 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.area_max)}
                    onChange={e => handleChange('area_max', e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="Máx"
                  />
                </div>
              </div>
            </Section>

            <Section title="Preferencias">
              <BoolButton label="Amoblado" fieldKey="furnished" />
              <BoolButton label="Mascotas" fieldKey="pets_allowed" />
              <BoolButton label="Fumadores" fieldKey="smokers_allowed" />
              <BoolButton label="Niños" fieldKey="children" />
              <BoolButton label="Estudiantes" fieldKey="students" />
              <BoolButton label="Estacionamiento Necesario" fieldKey="parking_needed" />
              <BoolButton label="Landlord Verificado" fieldKey="require_verified_landlord" />
              <BoolButton label="Balcón" fieldKey="balcony" />
              <BoolButton label="Terraza" fieldKey="terrace" />
              <BoolButton label="Lavadero" fieldKey="laundry" />
              <BoolButton label="Seguridad" fieldKey="security" />
              <BoolButton label="Ascensor" fieldKey="elevator" />
            </Section>

            <Section title="Notas Adicionales">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600">Preferencias (texto libre)</label>
                <textarea
                  className="mt-1 w-full rounded border px-3 py-2 text-sm h-20 resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.metadata?.preferencias || ''}
                  onChange={e =>
                    handleChange('metadata', {
                      ...(form.metadata || {}),
                      preferencias: e.target.value
                    })
                  }
                  placeholder="Ej: Prefiero zonas tranquilas, cerca del transporte público..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600">Notas</label>
                <textarea
                  className="mt-1 w-full rounded border px-3 py-2 text-sm h-20 resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.metadata?.notas || ''}
                  onChange={e =>
                    handleChange('metadata', {
                      ...(form.metadata || {}),
                      notas: e.target.value
                    })
                  }
                  placeholder="Cualquier otra información relevante..."
                />
              </div>
            </Section>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || form.property_types.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Perfil
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}