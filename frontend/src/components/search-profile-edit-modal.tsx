'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import type { AxiosInstance, AxiosError } from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { SearchProfileDetail } from './search-profile-detail-modal'
import LocationSelector from './location-selector'
import { Skeleton } from '@/components/ui/skeleton'
import { searchProfileSchema, type SearchProfileFormData } from '@/lib/schemas'
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

export default function SearchProfileEditModal({ open, id, onClose, apiClient, onUpdated }: Props) {
  const [initial, setInitial] = useState<SearchProfileDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [newCustomAmenityError, setNewCustomAmenityError] = useState<string | null>(null)

  const { register, control, watch, setValue, reset, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(searchProfileSchema),
    defaultValues: {
      city: '',
      neighborhood: '',
      minBudget: undefined,
      maxBudget: undefined,
      contractDuration: undefined,
      propertyTypes: [],
      status: 'activo' as const,
      amenities: [],
      preferences: '',
      notes: '',
      minBedrooms: undefined,
      maxBedrooms: undefined,
      minRooms: undefined,
      maxRooms: undefined,
      minBathrooms: undefined,
      maxBathrooms: undefined,
      minArea: undefined,
      maxArea: undefined,
    },
  })

  const amenities = watch('amenities') || []

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

        // Mapear los datos del backend al formato del formulario
        reset({
          city: res.data.city || '',
          neighborhood: res.data.neighborhood || '',
          minBudget: res.data.budget_min,
          maxBudget: res.data.budget_max,
          contractDuration: res.data.lease_term_months,
          propertyTypes: (res.data.property_types || []).filter(isKnownPropertyType),
          status: (STATUS_OPTIONS as readonly string[]).includes(res.data.status || '')
            ? (res.data.status as typeof STATUS_OPTIONS[number])
            : 'activo',
          amenities: res.data.amenities || [],
          preferences: res.data.metadata?.preferencias || '',
          notes: res.data.metadata?.notas || '',
          minBedrooms: res.data.bedroom_min,
          maxBedrooms: res.data.bedroom_max,
          minRooms: res.data.rooms_min,
          maxRooms: res.data.rooms_max,
          minBathrooms: res.data.bathrooms_min,
          maxBathrooms: res.data.bathrooms_max,
          minArea: res.data.area_min,
          maxArea: res.data.area_max,
          furnished: res.data.furnished,
          petsAllowed: res.data.pets_allowed,
          smokersAllowed: res.data.smokers_allowed,
          childrenAllowed: res.data.children,
          studentsAllowed: res.data.students,
          parking: res.data.parking_needed,
          verifiedLandlord: res.data.require_verified_landlord,
          balcony: res.data.balcony,
          terrace: res.data.terrace,
          laundry: res.data.laundry,
          security: res.data.security,
          elevator: res.data.elevator,
        })
      } catch (err) {
        const e = err as AxiosError<ApiErrorPayload>
        setError(e.response?.data?.error || e.response?.data?.message || 'Error cargando el perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [open, id, apiClient, reset])

  const close = useCallback(() => {
    if (saving) return
    onClose()
    setTimeout(() => {
      setInitial(null)
      reset()
      setError(null)
      setSuccess(null)
      setNewAmenity('')
      setNewCustomAmenityError(null)
    }, 200)
  }, [saving, onClose, reset])

  const isDirty = Object.keys(dirtyFields).length > 0

  const submit = useCallback(async () => {
    if (!id || !isDirty) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const formData = watch()

      // Mapear solo los campos modificados al formato del backend
      const diff: any = {}
      if (dirtyFields.city) diff.city = formData.city
      if (dirtyFields.neighborhood) diff.neighborhood = formData.neighborhood
      if (dirtyFields.minBudget) diff.budget_min = formData.minBudget
      if (dirtyFields.maxBudget) diff.budget_max = formData.maxBudget
      if (dirtyFields.contractDuration) diff.lease_term_months = formData.contractDuration
      if (dirtyFields.propertyTypes) diff.property_types = formData.propertyTypes
      if (dirtyFields.status) diff.status = formData.status
      if (dirtyFields.amenities) diff.amenities = formData.amenities
      if (dirtyFields.minBedrooms) diff.bedroom_min = formData.minBedrooms
      if (dirtyFields.maxBedrooms) diff.bedroom_max = formData.maxBedrooms
      if (dirtyFields.minRooms) diff.rooms_min = formData.minRooms
      if (dirtyFields.maxRooms) diff.rooms_max = formData.maxRooms
      if (dirtyFields.minBathrooms) diff.bathrooms_min = formData.minBathrooms
      if (dirtyFields.maxBathrooms) diff.bathrooms_max = formData.maxBathrooms
      if (dirtyFields.minArea) diff.area_min = formData.minArea
      if (dirtyFields.maxArea) diff.area_max = formData.maxArea
      if (dirtyFields.furnished) diff.furnished = formData.furnished
      if (dirtyFields.petsAllowed) diff.pets_allowed = formData.petsAllowed
      if (dirtyFields.smokersAllowed) diff.smokers_allowed = formData.smokersAllowed
      if (dirtyFields.childrenAllowed) diff.children = formData.childrenAllowed
      if (dirtyFields.studentsAllowed) diff.students = formData.studentsAllowed
      if (dirtyFields.parking) diff.parking_needed = formData.parking
      if (dirtyFields.verifiedLandlord) diff.require_verified_landlord = formData.verifiedLandlord
      if (dirtyFields.balcony) diff.balcony = formData.balcony
      if (dirtyFields.terrace) diff.terrace = formData.terrace
      if (dirtyFields.laundry) diff.laundry = formData.laundry
      if (dirtyFields.security) diff.security = formData.security
      if (dirtyFields.elevator) diff.elevator = formData.elevator
      if (dirtyFields.preferences || dirtyFields.notes) {
        diff.metadata = {
          preferencias: formData.preferences,
          notas: formData.notes
        }
      }

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
  }, [apiClient, dirtyFields, id, isDirty, onUpdated, watch])

  const toggleInArray = useCallback((field: 'propertyTypes' | 'amenities', value: string) => {
    const currentValue = watch(field) || []
    const next = currentValue.includes(value)
      ? currentValue.filter((v: string) => v !== value)
      : [...currentValue, value]
    setValue(field, next, { shouldDirty: true, shouldValidate: true })
  }, [watch, setValue])

  const addCustomAmenity = useCallback(() => {
    const v = newAmenity.trim().toLowerCase()
    setNewCustomAmenityError(null)
    if (!v) return
    if (v.length < 3) {
      setNewCustomAmenityError('Mínimo 3 caracteres')
      return
    }
    if (amenities.includes(v)) {
      setNewCustomAmenityError('Ya agregada')
      return
    }
    setValue('amenities', [...amenities, v], { shouldDirty: true, shouldValidate: true })
    setNewAmenity('')
  }, [newAmenity, amenities, setValue])

  const removeCustomAmenity = useCallback((a: string) => {
    setValue('amenities', amenities.filter(x => x !== a), { shouldDirty: true, shouldValidate: true })
  }, [amenities, setValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ToggleSwitch = useCallback(({ label, fieldKey }: { label: string; fieldKey: any }) => {
    const isActive = !!watch(fieldKey)
    return (
      <button
        type="button"
        onClick={() => setValue(fieldKey, !watch(fieldKey), { shouldDirty: true, shouldValidate: true })}
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
  }, [watch, setValue])

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
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <LocationSelector
                      selectedCity={field.value}
                      selectedNeighborhood={watch('neighborhood')}
                      onCityChange={city => {
                        field.onChange(city);
                        setValue('neighborhood', '');
                      }}
                      onNeighborhoodChange={neighborhood => setValue('neighborhood', neighborhood)}
                    />
                  )}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.city.message}
                  </p>
                )}
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
                      {...register('minBudget', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.minBudget && <p className="text-xs text-red-600 mt-1">{errors.minBudget.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Presupuesto Máx ($)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      {...register('maxBudget', { valueAsNumber: true })}
                      placeholder="∞"
                    />
                    {errors.maxBudget && <p className="text-xs text-red-600 mt-1">{errors.maxBudget.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Plazo del Contrato (meses)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      {...register('contractDuration', { valueAsNumber: true })}
                      placeholder="12"
                    />
                    {errors.contractDuration && <p className="text-xs text-red-600 mt-1">{errors.contractDuration.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Estado del Perfil</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white"
                      {...register('status')}
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
                    const active = watch('propertyTypes')?.includes(pt) || false
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => toggleInArray('propertyTypes', pt)}
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
                {errors.propertyTypes && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.propertyTypes.message}
                  </p>
                )}
                {watch('propertyTypes')?.some(t => !isKnownPropertyType(t)) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Otros tipos personalizados:</p>
                    <div className="flex flex-wrap gap-2">
                      {watch('propertyTypes')
                        ?.filter(t => !isKnownPropertyType(t))
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
                                setValue(
                                  'propertyTypes',
                                  watch('propertyTypes')?.filter(x => x !== t) || [],
                                  { shouldDirty: true }
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
                        {...register('minBedrooms', { valueAsNumber: true })}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        {...register('maxBedrooms', { valueAsNumber: true })}
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
                        {...register('minRooms', { valueAsNumber: true })}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        {...register('maxRooms', { valueAsNumber: true })}
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
                        {...register('minBathrooms', { valueAsNumber: true })}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        {...register('maxBathrooms', { valueAsNumber: true })}
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
                        {...register('minArea', { valueAsNumber: true })}
                        placeholder="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        {...register('maxArea', { valueAsNumber: true })}
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
                    const active = amenities.includes(a)
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

                {amenities.some(a => !AMENITY_OPTIONS.includes(a)) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Amenidades personalizadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {amenities
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
                      {...register('preferences')}
                      placeholder="Describe tus preferencias específicas..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Notas</label>
                    <textarea
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm h-24 resize-y focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      {...register('notes')}
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
                  {Object.keys(dirtyFields).length} cambio{Object.keys(dirtyFields).length !== 1 ? 's' : ''} sin guardar
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