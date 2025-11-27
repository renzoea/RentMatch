'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { InputEnhanced } from '@/components/ui/input-enhanced'
import LocationSelector from '@/components/location-selector'
import { useToast } from '@/hooks/useToast'
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
import { searchProfileSchema, type SearchProfileFormData } from '@/lib/schemas'

interface ApiErrorPayload {
  error?: string
  message?: string
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

export default function CrearPerfilBusqueda() {
  const router = useRouter()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [newAmenityError, setNewAmenityError] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
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

  const toggleInArray = useCallback((field: 'propertyTypes' | 'amenities', value: string) => {
    const currentValue = watch(field) || []
    const next = currentValue.includes(value)
      ? currentValue.filter(v => v !== value)
      : [...currentValue, value]
    setValue(field, next, { shouldValidate: true })
  }, [watch, setValue])

  const addCustomAmenity = useCallback(() => {
    const v = newAmenity.trim().toLowerCase()
    setNewAmenityError(null)
    if (!v) return
    if (v.length < 3) {
      setNewAmenityError('Mínimo 3 caracteres')
      return
    }
    if (amenities.includes(v)) {
      setNewAmenityError('Ya agregada')
      return
    }
    setValue('amenities', [...amenities, v], { shouldValidate: true })
    setNewAmenity('')
  }, [newAmenity, amenities, setValue])

  const removeCustomAmenity = useCallback((a: string) => {
    setValue('amenities', amenities.filter(x => x !== a), { shouldValidate: true })
  }, [amenities, setValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ToggleSwitch = useCallback(({ label, fieldKey }: { label: string; fieldKey: any }) => {
    const isActive = !!watch(fieldKey)
    return (
      <button
        type="button"
        onClick={() => setValue(fieldKey, !watch(fieldKey), { shouldValidate: true })}
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

  const onSubmit = async (data: SearchProfileFormData) => {
    setError(null)
    setSaving(true)

    try {
      // Mapear los datos al formato del backend
      const payload = {
        city: data.city,
        neighborhood: data.neighborhood,
        budget_min: data.minBudget,
        budget_max: data.maxBudget,
        property_types: data.propertyTypes,
        status: data.status,
        rooms_min: data.minRooms,
        rooms_max: data.maxRooms,
        bathrooms_min: data.minBathrooms,
        bathrooms_max: data.maxBathrooms,
        bedroom_min: data.minBedrooms,
        bedroom_max: data.maxBedrooms,
        area_min: data.minArea,
        area_max: data.maxArea,
        furnished: data.furnished,
        pets_allowed: data.petsAllowed,
        smokers_allowed: data.smokersAllowed,
        children: data.childrenAllowed,
        students: data.studentsAllowed,
        parking_needed: data.parking,
        require_verified_landlord: data.verifiedLandlord,
        balcony: data.balcony,
        terrace: data.terrace,
        laundry: data.laundry,
        security: data.security,
        elevator: data.elevator,
        amenities: data.amenities,
        lease_term_months: data.contractDuration,
        metadata: {
          preferencias: data.preferences,
          notas: data.notes,
        },
      }

      await api.post('/api/search-profiles', payload)
      toast.success('¡Perfil creado!', 'Tu perfil de búsqueda se creó correctamente')
      router.push('/home/inquilino')
    } catch (err) {
      const e = err as AxiosError<ApiErrorPayload>
      const errorMsg = e.response?.data?.error || e.response?.data?.message || 'Error creando el perfil'
      setError(errorMsg)
      toast.error('Error al crear perfil', errorMsg)
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  required
                />
              )}
            />
            {errors.city && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                {errors.city.message}
              </p>
            )}
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
                <InputEnhanced
                  type="number"
                  {...register('minBudget', { valueAsNumber: true })}
                  placeholder="0"
                  error={errors.minBudget?.message}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Presupuesto Máx ($) *</label>
                <InputEnhanced
                  type="number"
                  {...register('maxBudget', { valueAsNumber: true })}
                  placeholder="∞"
                  error={errors.maxBudget?.message}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Plazo del Contrato (meses)</label>
                <InputEnhanced
                  type="number"
                  {...register('contractDuration', { valueAsNumber: true })}
                  placeholder="12"
                  error={errors.contractDuration?.message}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-green-700 block mb-2">Estado del Perfil</label>
                <select
                  className="w-full rounded-lg border-2 border-green-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tipos de Propiedad *</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {PROPERTY_TYPE_OPTIONS.map(pt => {
                const active = watch('propertyTypes')?.includes(pt) || false
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => toggleInArray('propertyTypes', pt)}
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
            {errors.propertyTypes && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyTypes.message}
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
                  <InputEnhanced
                    type="number"
                    {...register('minBedrooms', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <InputEnhanced
                    type="number"
                    {...register('maxBedrooms', { valueAsNumber: true })}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Ambientes (Mín - Máx)</label>
                <div className="flex gap-2">
                  <InputEnhanced
                    type="number"
                    {...register('minRooms', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <InputEnhanced
                    type="number"
                    {...register('maxRooms', { valueAsNumber: true })}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Baños (Mín - Máx)</label>
                <div className="flex gap-2">
                  <InputEnhanced
                    type="number"
                    {...register('minBathrooms', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <InputEnhanced
                    type="number"
                    {...register('maxBathrooms', { valueAsNumber: true })}
                    placeholder="∞"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-700 block mb-2">Área m² (Mín - Máx)</label>
                <div className="flex gap-2">
                  <InputEnhanced
                    type="number"
                    {...register('minArea', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <InputEnhanced
                    type="number"
                    {...register('maxArea', { valueAsNumber: true })}
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
                const active = watch('amenities')?.includes(a) || false
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
                <InputEnhanced
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

            {watch('amenities')?.some(a => !AMENITY_OPTIONS.includes(a)) && (
              <div className="mt-4 pt-4 border-t border-teal-200">
                <p className="text-xs font-semibold text-teal-700 mb-2">Amenidades personalizadas:</p>
                <div className="flex flex-wrap gap-2">
                  {watch('amenities')
                    ?.filter(a => !AMENITY_OPTIONS.includes(a))
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
              disabled={saving || errors.propertyTypes !== undefined}
              className={`${
                !errors.propertyTypes
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