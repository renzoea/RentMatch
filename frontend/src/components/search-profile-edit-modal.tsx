'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import type { AxiosInstance, AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { SearchProfileDetail } from './search-profile-detail-modal'

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

// Tipos de propiedad fijos
const PROPERTY_TYPE_OPTIONS = ['departamento', 'ph', 'duplex', 'casa', 'estudio'] as const
const isKnownPropertyType = (v: string): v is typeof PROPERTY_TYPE_OPTIONS[number] =>
  (PROPERTY_TYPE_OPTIONS as readonly string[]).includes(v)

// Amenidades sugeridas
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

// Componente Section fuera del componente principal
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-xs font-semibold text-gray-500 uppercase">{title}</h3>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </section>
)

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
      setSuccess('Perfil actualizado')
      setInitial(prev => prev ? { ...prev, ...diff } as SearchProfileDetail : prev)
      if (onUpdated) onUpdated({ id, ...diff })
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

  const BoolButton = useCallback(({ label, fieldKey }: { label: string; fieldKey: keyof FormState }) => (
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-gray-200 max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Editar Perfil de Búsqueda</h2>
          <button onClick={close} className="text-gray-500 hover:text-gray-800 text-sm">Cerrar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          )}
          {!loading && error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          {!loading && !error && initial && (
            <>
              {success && (
                <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">
                  {success}
                </div>
              )}

              <Section title="Ubicación">
                <div>
                  <label className="text-xs font-medium text-gray-600">Ciudad</label>
                  <input
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={form.city || ''}
                    onChange={e => handleChange('city', e.target.value)}
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

              <Section title="Economía / Estado">
                <div>
                  <label className="text-xs font-medium text-gray-600">Presupuesto Mín</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.budget_min)}
                    onChange={e => handleChange('budget_min', e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Presupuesto Máx</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={numberInput(form.budget_max)}
                    onChange={e => handleChange('budget_max', e.target.value === '' ? undefined : Number(e.target.value))}
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
                    value={form.status || STATUS_OPTIONS[0]}
                    onChange={e => handleChange('status', e.target.value as FormState['status'])}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </Section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Tipos de Propiedad</h3>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPE_OPTIONS.map(pt => {
                    const active = (form.property_types || []).includes(pt)
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
                {(form.property_types || []).some(t => !isKnownPropertyType(t)) && (
                  <div className="pt-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Otros</p>
                    <div className="flex flex-wrap gap-2">
                      {(form.property_types || [])
                        .filter(t => !isKnownPropertyType(t))
                        .map(t => (
                          <span
                            key={t}
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {titleCase(t)}
                            <button
                              type="button"
                              className="text-gray-500 hover:text-red-500"
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
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Amenidades</h3>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map(a => {
                    const active = (form.amenities || []).includes(a)
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
                  {newCustomAmenityError && (
                    <p className="text-xs text-red-600">{newCustomAmenityError}</p>
                  )}
                </div>

                {(form.amenities || []).some(a => !AMENITY_OPTIONS.includes(a)) && (
                  <div className="pt-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Personalizadas</p>
                    <div className="flex flex-wrap gap-2">
                      {(form.amenities || [])
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

              <Section title="Preferencias / Flags">
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

              <Section title="Notas">
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
                  />
                </div>
              </Section>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {isDirty ? `${Object.keys(diff).length} cambio(s) sin guardar` : 'Sin cambios'}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={close}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={!isDirty || saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}