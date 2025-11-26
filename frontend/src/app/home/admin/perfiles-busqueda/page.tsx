'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Users,
  Check,
  AlertCircle,
  Globe
} from 'lucide-react'

// Interfaces
interface Tenant {
  id: string
  full_name: string
  email: string
  phone?: string
  status?: string
  is_banned?: boolean
  created_at?: string
}

interface SearchProfile {
  id: string
  status: 'activo' | 'pausado' | 'archivado'
  visibility: 'publico' | 'privado'
  property_types: string[]
  budget_min: number
  budget_max: number
  rooms_min: number
  rooms_max: number
  bedroom_min: number
  bedroom_max: number
  bathrooms_min: number
  bathrooms_max: number
  furnished: boolean
  pets_allowed: boolean
  children: boolean
  lease_term_months: number
  amenities: string[]
  created_at: string
  updated_at: string
  tenant: Tenant
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// Translation helper functions
function translatePropertyType(type: string): string {
  const translations: Record<string, string> = {
    'departamento': 'Departamento',
    'casa': 'Casa',
    'ph': 'PH',
    'local': 'Local',
    'oficina': 'Oficina',
    'cochera': 'Cochera',
    'terreno': 'Terreno',
    'quinta': 'Quinta',
    'galpon': 'Galpón'
  }
  return translations[type.toLowerCase()] || type
}

function translateAmenity(amenity: string): string {
  const translations: Record<string, string> = {
    'pileta': 'Pileta',
    'gym': 'Gimnasio',
    'parrilla': 'Parrilla',
    'jardin': 'Jardín',
    'balcon': 'Balcón',
    'terraza': 'Terraza',
    'cochera': 'Cochera',
    'baulera': 'Baulera',
    'laundry': 'Lavadero',
    'seguridad': 'Seguridad 24hs',
    'sum': 'SUM',
    'aire_acondicionado': 'Aire acondicionado',
    'calefaccion': 'Calefacción',
    'wifi': 'WiFi',
    'cable': 'Cable',
    'gas': 'Gas natural'
  }
  return translations[amenity.toLowerCase()] || amenity
}

// Stats Card Component
function StatsCard({ title, value, icon, color }: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <div className="w-6 h-6 text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchProfilesManagement() {
  // State
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Advanced filters
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [minRooms, setMinRooms] = useState('')
  const [maxRooms, setMaxRooms] = useState('')
  const [minBedrooms, setMinBedrooms] = useState('')
  const [maxBedrooms, setMaxBedrooms] = useState('')
  const [furnishedFilter, setFurnishedFilter] = useState('all')
  const [petsFilter, setPetsFilter] = useState('all')
  const [childrenFilter, setChildrenFilter] = useState('all')

  // Modals
  const [selectedProfile, setSelectedProfile] = useState<SearchProfile | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Modal state
  const [newStatus, setNewStatus] = useState<'activo' | 'pausado' | 'archivado'>('activo')
  const [newVisibility, setNewVisibility] = useState<'publico' | 'privado'>('publico')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    archived: 0,
    public: 0
  })

  // Fetch search profiles
  const fetchSearchProfiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (visibilityFilter !== 'all') params.append('visibility', visibilityFilter)
      if (searchTerm) params.append('search', searchTerm)

      // Advanced filters
      if (minBudget) params.append('min_budget', minBudget)
      if (maxBudget) params.append('max_budget', maxBudget)
      if (propertyType !== 'all') params.append('property_type', propertyType)
      if (minRooms) params.append('min_rooms', minRooms)
      if (maxRooms) params.append('max_rooms', maxRooms)
      if (minBedrooms) params.append('min_bedrooms', minBedrooms)
      if (maxBedrooms) params.append('max_bedrooms', maxBedrooms)
      if (furnishedFilter !== 'all') params.append('furnished', furnishedFilter)
      if (petsFilter !== 'all') params.append('pets_allowed', petsFilter)
      if (childrenFilter !== 'all') params.append('children', childrenFilter)

      const response = await api.get('/api/admin/search-profiles?' + params.toString())
      const data = response.data

      setSearchProfiles(data.searchProfiles)
      setPagination(data.pagination)

      // Calculate stats
      const activeProfiles = data.searchProfiles.filter((p: SearchProfile) => p.status === 'activo').length
      const pausedProfiles = data.searchProfiles.filter((p: SearchProfile) => p.status === 'pausado').length
      const archivedProfiles = data.searchProfiles.filter((p: SearchProfile) => p.status === 'archivado').length
      const publicProfiles = data.searchProfiles.filter((p: SearchProfile) => p.visibility === 'publico').length

      setStats({
        total: data.pagination.total,
        active: activeProfiles,
        paused: pausedProfiles,
        archived: archivedProfiles,
        public: publicProfiles
      })
    } catch (error) {
      console.error('Error al cargar perfiles de búsqueda:', error)
      setErrorMessage('Error al cargar perfiles de búsqueda')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSearchProfiles()
  }, [pagination.page, statusFilter, visibilityFilter])

  // Handlers
  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchSearchProfiles()
  }

  const handleClearFilters = () => {
    setStatusFilter('all')
    setVisibilityFilter('all')
    setSearchTerm('')
    setMinBudget('')
    setMaxBudget('')
    setPropertyType('all')
    setMinRooms('')
    setMaxRooms('')
    setMinBedrooms('')
    setMaxBedrooms('')
    setFurnishedFilter('all')
    setPetsFilter('all')
    setChildrenFilter('all')
    setPagination({ ...pagination, page: 1 })
    setTimeout(() => fetchSearchProfiles(), 100)
  }

  const handleViewDetails = (profile: SearchProfile) => {
    setSelectedProfile(profile)
    setShowDetailsModal(true)
  }

  const handleChangeStatus = (profile: SearchProfile) => {
    setSelectedProfile(profile)
    setNewStatus(profile.status)
    setShowStatusModal(true)
  }

  const handleChangeVisibility = (profile: SearchProfile) => {
    setSelectedProfile(profile)
    setNewVisibility(profile.visibility)
    setShowVisibilityModal(true)
  }

  const handleDeleteProfile = (profile: SearchProfile) => {
    setSelectedProfile(profile)
    setShowDeleteModal(true)
  }

  const confirmStatusChange = async () => {
    if (!selectedProfile) return

    try {
      await api.patch('/api/admin/search-profiles/' + selectedProfile.id + '/status', {
        status: newStatus
      })

      setShowStatusModal(false)
      setSelectedProfile(null)
      fetchSearchProfiles()
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('Error al actualizar estado del perfil')
      setShowErrorModal(true)
    }
  }

  const confirmVisibilityChange = async () => {
    if (!selectedProfile) return

    try {
      await api.patch('/api/admin/search-profiles/' + selectedProfile.id + '/visibility', {
        visibility: newVisibility
      })

      setShowVisibilityModal(false)
      setSelectedProfile(null)
      fetchSearchProfiles()
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('Error al actualizar visibilidad del perfil')
      setShowErrorModal(true)
    }
  }

  const confirmDelete = async () => {
    if (!selectedProfile) return

    try {
      await api.delete('/api/admin/search-profiles/' + selectedProfile.id)

      setShowDeleteModal(false)
      setSelectedProfile(null)
      fetchSearchProfiles()
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('Error al eliminar perfil de búsqueda')
      setShowErrorModal(true)
    }
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      'activo': 'bg-green-100 text-green-800 border border-green-200',
      'pausado': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'archivado': 'bg-gray-100 text-gray-800 border border-gray-200'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getVisibilityBadge = (visibility: string) => {
    const badges = {
      'publico': 'bg-blue-100 text-blue-800 border border-blue-200',
      'privado': 'bg-purple-100 text-purple-800 border border-purple-200'
    }
    return badges[visibility as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  // Close modals on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDetailsModal(false)
        setShowStatusModal(false)
        setShowVisibilityModal(false)
        setShowDeleteModal(false)
        setShowErrorModal(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Perfiles de Búsqueda</h1>
        <p className="text-gray-600 mt-2">Gestiona los perfiles de búsqueda de inquilinos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total de Perfiles"
          value={stats.total}
          icon={<Users />}
          color="bg-purple-600"
        />
        <StatsCard
          title="Activos"
          value={stats.active}
          icon={<Check />}
          color="bg-green-600"
        />
        <StatsCard
          title="Pausados"
          value={stats.paused}
          icon={<AlertCircle />}
          color="bg-yellow-600"
        />
        <StatsCard
          title="Archivados"
          value={stats.archived}
          icon={<X />}
          color="bg-gray-600"
        />
        <StatsCard
          title="Públicos"
          value={stats.public}
          icon={<Globe />}
          color="bg-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Inquilino
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nombre o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilidad
            </label>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Buscar
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtros Avanzados</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto Mínimo
                </label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto Máximo
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Propiedad
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="ph">PH</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habitaciones Min
                </label>
                <input
                  type="number"
                  value={minRooms}
                  onChange={(e) => setMinRooms(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dormitorios Min
                </label>
                <input
                  type="number"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Furnished */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amueblado
                </label>
                <select
                  value={furnishedFilter}
                  onChange={(e) => setFurnishedFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Pets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acepta Mascotas
                </label>
                <select
                  value={petsFilter}
                  onChange={(e) => setPetsFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Children */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Con Niños
                </label>
                <select
                  value={childrenFilter}
                  onChange={(e) => setChildrenFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleClearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : searchProfiles.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron perfiles de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inquilino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipos de Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Presupuesto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Habitaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.tenant?.full_name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile.tenant?.email || 'Sin email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.property_types.slice(0, 2).map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {translatePropertyType(type)}
                            </span>
                          ))}
                          {profile.property_types.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{profile.property_types.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${profile.budget_min.toLocaleString('es-AR')} - ${profile.budget_max.toLocaleString('es-AR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {profile.rooms_min} - {profile.rooms_max} amb
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.bedroom_min} - {profile.bedroom_max} dorm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(profile.status)}`}>
                          {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisibilityBadge(profile.visibility)}`}>
                          {profile.visibility === 'publico' ? 'Público' : 'Privado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(profile)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleChangeStatus(profile)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Cambiar estado"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleChangeVisibility(profile)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Cambiar visibilidad"
                          >
                            {profile.visibility === 'publico' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de <span className="font-medium">{pagination.total}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Página {pagination.page} de {pagination.pages}
                      </span>
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Perfil de Búsqueda</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Tenant Info */}
              <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Información del Inquilino
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedProfile.tenant?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedProfile.tenant?.email || 'N/A'}</p>
                  </div>
                  {selectedProfile.tenant?.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.tenant.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Estado</p>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(selectedProfile.status)}`}>
                    {selectedProfile.status.charAt(0).toUpperCase() + selectedProfile.status.slice(1)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Visibilidad</p>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getVisibilityBadge(selectedProfile.visibility)}`}>
                    {selectedProfile.visibility === 'publico' ? 'Público' : 'Privado'}
                  </span>
                </div>
              </div>

              {/* Property Preferences */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Preferencias de Propiedad
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tipos de Propiedad</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.property_types.map((type, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {translatePropertyType(type)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Presupuesto</p>
                    <p className="text-lg font-bold text-blue-900">
                      ${selectedProfile.budget_min.toLocaleString('es-AR')} - ${selectedProfile.budget_max.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Habitaciones</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProfile.rooms_min} - {selectedProfile.rooms_max} ambientes
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Dormitorios</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProfile.bedroom_min} - {selectedProfile.bedroom_max} dormitorios
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Baños</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProfile.bathrooms_min} - {selectedProfile.bathrooms_max} baños
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Plazo de Alquiler</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProfile.lease_term_months} meses
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Requisitos
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedProfile.furnished ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Home className={`w-5 h-5 ${selectedProfile.furnished ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amueblado</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.furnished ? 'Sí' : 'No'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedProfile.pets_allowed ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Check className={`w-5 h-5 ${selectedProfile.pets_allowed ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mascotas</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.pets_allowed ? 'Sí' : 'No'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedProfile.children ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Users className={`w-5 h-5 ${selectedProfile.children ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Niños</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedProfile.children ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {selectedProfile.amenities && selectedProfile.amenities.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">Amenidades Deseadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                      >
                        {translateAmenity(amenity)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Creado</p>
                  <p>{new Date(selectedProfile.created_at).toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="font-medium">Última actualización</p>
                  <p>{new Date(selectedProfile.updated_at).toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Cambiar Estado</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Cambiar estado del perfil de <strong>{selectedProfile.tenant?.full_name}</strong>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Estado
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'activo' | 'pausado' | 'archivado')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Change Modal */}
      {showVisibilityModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Cambiar Visibilidad</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Cambiar visibilidad del perfil de <strong>{selectedProfile.tenant?.full_name}</strong>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Visibilidad
              </label>
              <select
                value={newVisibility}
                onChange={(e) => setNewVisibility(e.target.value as 'publico' | 'privado')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
              </select>

              <p className="text-sm text-gray-500 mt-3">
                {newVisibility === 'publico'
                  ? 'El perfil será visible para todos los propietarios'
                  : 'El perfil solo será visible para el inquilino'
                }
              </p>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowVisibilityModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmVisibilityChange}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-red-900">Eliminar Perfil de Búsqueda</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    ¿Estás seguro de eliminar este perfil?
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Perfil de {selectedProfile.tenant?.full_name}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Esta acción no se puede deshacer. El perfil será eliminado permanentemente.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-red-900">Error</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-900">{errorMessage}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
