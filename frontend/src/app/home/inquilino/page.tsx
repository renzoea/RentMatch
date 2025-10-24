'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign,
  Home,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Archive,
  Sparkles
} from "lucide-react"
import SearchProfileDetailModal from "@/components/search-profile-detail-modal"
import SearchProfileEditModal from "@/components/search-profile-edit-modal"
import SearchProfileDeleteModal from "@/components/search-profile-delete-modal"

type SearchProfile = {
  id: string
  property_types: string[]
  status: string
  budget_min?: number
  budget_max?: number
  city?: string
  neighborhood?: string
  created_at: string
  amenities?: string[]
  metadata?: {
    preferencias?: string
    notas?: string
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function SearchProfileDashboard() {
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get("/api/search-profiles", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSearchProfiles(res.data))
      .catch(() => setSearchProfiles([]))
      .finally(() => setLoading(false))
  }, [])

  const openDetail = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const openEdit = (id: string) => {
    setSelectedId(id)
    setEditOpen(true)
  }

  const openDelete = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const activos = searchProfiles.filter(p => p.status === 'activo').length
  const pausados = searchProfiles.filter(p => p.status === 'pausado').length
  const archivados = searchProfiles.filter(p => p.status === 'archivado').length

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Mis Perfiles de Búsqueda</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tus perfiles para encontrar la propiedad ideal
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/home/inquilino/crear')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Perfil
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">Activos</p>
                <p className="text-3xl font-bold text-green-900">{activos}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-700">Pausados</p>
                <p className="text-3xl font-bold text-yellow-900">{pausados}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-gray-500 p-3 rounded-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Archivados</p>
                <p className="text-3xl font-bold text-gray-900">{archivados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Perfiles */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Cargando perfiles...</p>
          </div>
        ) : searchProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-full mb-6">
                <Search className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tienes perfiles de búsqueda</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Crea tu primer perfil para que podamos ayudarte a encontrar la propiedad perfecta
              </p>
              <Button
                onClick={() => router.push('/home/inquilino/crear')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Perfil
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {searchProfiles.map(profile => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-orange-200 transition-all duration-200 overflow-hidden"
              >
                {/* Header del Card */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-4 border-b border-orange-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-orange-600" />
                          <span className="font-bold text-lg text-gray-900">
                            {Array.isArray(profile.property_types) && profile.property_types.length > 0
                              ? profile.property_types.map(capitalize).join(', ')
                              : 'Sin especificar'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">
                          {profile.neighborhood && profile.city
                            ? `${profile.neighborhood}, ${profile.city}`
                            : profile.city || profile.neighborhood || 'Ubicación no especificada'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        profile.status === 'activo' 
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : profile.status === 'pausado'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                        {capitalize(profile.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido del Card */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {/* Presupuesto */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">Presupuesto</p>
                          <p className="font-bold text-lg text-green-900">
                            ${profile.budget_min?.toLocaleString() || '0'} - ${profile.budget_max?.toLocaleString() || '∞'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fecha de creación */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-700 mb-1">Creado</p>
                          <p className="font-bold text-lg text-blue-900">
                            {new Date(profile.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenidades Preview */}
                  {profile.amenities && profile.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Amenidades</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.amenities.slice(0, 5).map(amenity => (
                          <span
                            key={amenity}
                            className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium border border-purple-200"
                          >
                            {capitalize(amenity)}
                          </span>
                        ))}
                        {profile.amenities.length > 5 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            +{profile.amenities.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => openDetail(profile.id)}
                      className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Detalles
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openEdit(profile.id)}
                      className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDelete(profile.id)}
                      className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <SearchProfileDetailModal
        open={detailOpen}
        id={selectedId}
        onClose={() => setDetailOpen(false)}
        apiClient={api}
      />

      <SearchProfileEditModal
        open={editOpen}
        id={selectedId}
        onClose={() => setEditOpen(false)}
        apiClient={api}
        onUpdated={(partial) => {
          setSearchProfiles(prev =>
            prev.map(p => p.id === partial.id ? { ...p, ...partial } : p)
          )
        }}
      />

      <SearchProfileDeleteModal
        open={deleteOpen}
        id={deleteId}
        apiClient={api}
        onClose={() => { setDeleteOpen(false); setDeleteId(null) }}
        onDeleted={(deletedId) => {
          setSearchProfiles(prev => prev.filter(p => p.id !== deletedId))
          if (selectedId === deletedId) {
            setDetailOpen(false)
            setEditOpen(false)
            setSelectedId(null)
          }
        }}
      />
    </div>
  )
}