'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, FileText, Edit, Trash2, Wallet, MapPin } from "lucide-react"
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

function getStatusLabel(status: string) {
  switch (status) {
    case "activo": return "Activo"
    case "pausado": return "Pausado"
    case "archivado": return "Archivado"
    default: return status
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "activo": return "bg-green-500 text-white text-sm px-3 py-1 shadow-sm"
    case "pausado": return "bg-yellow-400 text-white text-sm px-3 py-1 shadow-sm"
    case "archivado": return "bg-gray-400 text-white text-sm px-3 py-1 shadow-sm"
    default: return "bg-orange-500 text-white text-sm px-3 py-1 shadow-sm"
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

  // Métricas
  const activos = searchProfiles.filter(p => p.status === 'activo').length
  const pausados = searchProfiles.filter(p => p.status === 'pausado').length
  const archivados = searchProfiles.filter(p => p.status === 'archivado').length

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Perfiles de Búsqueda</h1>
      <p className="text-gray-600 mb-8">
        Gestiona tus perfiles de búsqueda de propiedades.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Search className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold">{activos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <FileText className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Pausados</p>
              <p className="text-2xl font-bold">{pausados}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <FileText className="w-8 h-8 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Archivados</p>
              <p className="text-2xl font-bold">{archivados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : searchProfiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <Search className="w-10 h-10 text-gray-400 mb-4" />
            <p className="font-semibold text-gray-700 mb-2">No tienes perfiles de búsqueda</p>
            <Button
              className="bg-orange-500 text-white mt-4"
              onClick={() => router.push('/home/inquilino/crear')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Crear Primer Perfil
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {searchProfiles.map(profile => (
            <div
              key={profile.id}
              className="rounded-xl border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-200 overflow-hidden bg-white"
            >
              <div className="bg-gradient-to-b from-orange-100 to-white px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {Array.isArray(profile.property_types) &&
                        profile.property_types.map(type => (
                          <Badge
                            key={type}
                            className="bg-white text-orange-700 border border-orange-200 text-sm font-medium px-3 py-1 shadow-sm"
                          >
                            {capitalize(type)}
                          </Badge>
                        ))
                      }
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-lg text-gray-900">
                        {profile.neighborhood || 'Sin especificar'}
                      </span>
                      {profile.city && (
                        <span className="text-gray-500">• {profile.city}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getStatusBadgeClass(profile.status)}>
                      {getStatusLabel(profile.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-xs text-gray-500">Presupuesto</div>
                      <div className="font-bold text-lg text-gray-900">
                        ${profile.budget_min?.toLocaleString()} - ${profile.budget_max?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Creado</div>
                      <div className="font-bold text-lg text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openDetail(profile.id)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openEdit(profile.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => openDelete(profile.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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