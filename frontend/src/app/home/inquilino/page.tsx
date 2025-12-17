'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card-standard"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
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
  Sparkles,
  Info
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
    api.get("/api/search-profiles")
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2.5 rounded-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Perfiles de Búsqueda</h1>
                <p className="text-sm text-gray-600">
                  Gestiona tus perfiles para encontrar la propiedad ideal
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/home/inquilino/crear')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Perfil
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{activos}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pausados</p>
                  <p className="text-2xl font-bold text-gray-900">{pausados}</p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Archivados</p>
                  <p className="text-2xl font-bold text-gray-900">{archivados}</p>
                </div>
                <div className="bg-gray-500 p-3 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Perfiles */}
        {loading ? (
          <LoadingState message="Cargando perfiles..." />
        ) : searchProfiles.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No tienes perfiles de búsqueda"
            description="Crea tu primer perfil para que podamos ayudarte a encontrar la propiedad perfecta"
            action={{
              label: "Crear Primer Perfil",
              onClick: () => router.push('/home/inquilino/crear')
            }}
          />
        ) : (
          <div className="space-y-4">
            {searchProfiles.map(profile => (
              <Card key={profile.id} hover>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-orange-500" />
                        <h3 className="font-bold text-lg text-gray-900 capitalize">
                          {Array.isArray(profile.property_types) && profile.property_types.length > 0
                            ? profile.property_types.map(capitalize).join(', ')
                            : 'Sin especificar'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>
                          {profile.neighborhood && profile.city
                            ? `${profile.neighborhood}, ${profile.city}`
                            : profile.city || profile.neighborhood || 'Ubicación no especificada'}
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      variant={
                        profile.status === 'activo' ? 'active' :
                        profile.status === 'pausado' ? 'paused' :
                        'archived'
                      }
                    >
                      {capitalize(profile.status)}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Presupuesto</span>
                      </div>
                      <p className="font-bold text-base text-green-900">
                        ${profile.budget_min?.toLocaleString() || '0'} - ${profile.budget_max?.toLocaleString() || '∞'}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">Creado</span>
                      </div>
                      <p className="font-bold text-base text-blue-900">
                        {new Date(profile.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

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
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                          >
                            {capitalize(amenity)}
                          </span>
                        ))}
                        {profile.amenities.length > 5 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-300">
                            +{profile.amenities.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => openDetail(profile.id)}
                      className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-sm"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Detalles
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openEdit(profile.id)}
                      className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDelete(profile.id)}
                      className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Eliminar
                    </Button>
                  </div>
              </Card>
            ))}
          </div>
        )}

        {/* Sección educativa */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funcionan los perfiles de búsqueda?</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>1. Crea perfiles específicos:</strong> Puedes tener múltiples perfiles de búsqueda con diferentes criterios (ubicación, presupuesto, tipo de propiedad).
                  </p>
                  <p>
                    <strong>2. Activa o pausa:</strong> Marca un perfil como &quot;Activo&quot; cuando estés buscando activamente, o &quot;Pausado&quot; para guardar tus criterios sin recibir notificaciones.
                  </p>
                  <p>
                    <strong>3. Recibe coincidencias:</strong> El sistema te notificará cuando encuentre propiedades que coincidan con tus perfiles activos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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