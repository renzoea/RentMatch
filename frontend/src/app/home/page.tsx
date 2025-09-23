'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home,
  Plus,
  FileText,
  Wallet,
  User as UserIcon,
  LogOut,
  Search,
  Users,
  MapPin,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Define los tipos correctos
type User = {
  full_name: string;
  role: string;
};

type SearchProfile = {
  id: string;
  property_type: string;
  preferred_neighborhoods?: string;
  status: string;
  min_budget?: number;
  max_budget?: number;
  interested_owners?: number;
  created_at: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    if (userData) {
      try {
        const parsedUser: User = JSON.parse(userData)
        setUser(parsedUser)
        fetchSearchProfiles()
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        router.push('/auth/login')
        return
      }
    }
    
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const fetchSearchProfiles = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    setProfilesLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/search-profiles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSearchProfiles(data.searchProfiles || [])
      } else if (response.status === 401) {
        handleLogout()
      } else {
        console.error('Error obteniendo perfiles:', response.status)
      }
    } catch (error) {
      console.error('Error de red:', error)
    } finally {
      setProfilesLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Inicio / {user.role === 'inquilino' ? 'Inquilino' : 'Propietario'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-orange-500">
              <AvatarFallback className="bg-orange-500 text-white font-semibold">
                {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900">{user.full_name || 'Usuario'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">RentMatch</span>
            </div>

            <nav className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                <Home className="w-5 h-5 mr-3" />
                Inicio
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                <Plus className="w-5 h-5 mr-3" />
                Crear Perfil
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                <FileText className="w-5 h-5 mr-3" />
                Contratos
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                <Wallet className="w-5 h-5 mr-3" />
                Depósito
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                <UserIcon className="w-5 h-5 mr-3" />
                Mi Cuenta
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido, {user.full_name?.split(' ')[0] || 'Usuario'}!
                </h1>
                <p className="text-gray-600">
                  {user.role === 'inquilino' 
                    ? 'Gestiona tus perfiles de búsqueda de propiedades' 
                    : 'Gestiona tus propiedades disponibles para alquilar'
                  }
                </p>
              </div>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  alert('Función de crear perfil en desarrollo')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Perfil de Búsqueda
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Search className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Perfiles Activos</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {profilesLoading ? '...' : searchProfiles.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Propietarios Interesados</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {profilesLoading ? '...' : searchProfiles.reduce((total, profile) => total + (profile.interested_owners || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Zonas de Búsqueda</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {profilesLoading ? '...' : new Set(searchProfiles.flatMap(profile => 
                          profile.preferred_neighborhoods ? profile.preferred_neighborhoods.split(',') : []
                        )).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Profiles Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Perfiles de Búsqueda</h2>

              {profilesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : searchProfiles.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes perfiles de búsqueda</h3>
                    <p className="text-gray-600 mb-4">
                      Crea tu primer perfil de búsqueda para empezar a encontrar propiedades.
                    </p>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Perfil
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                searchProfiles.map((profile) => (
                  <Card key={profile.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {profile.property_type} en {profile.preferred_neighborhoods?.split(',')[0] || 'Zona preferida'}
                            </h3>
                            <Badge className={`${
                              profile.status === 'active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                            }`}>
                              {profile.status === 'active' ? 'Activo' : 'Pendiente'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Wallet className="w-4 h-4" />
                              <span>
                                ${profile.min_budget?.toLocaleString()} - ${profile.max_budget?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {profile.preferred_neighborhoods || 'Sin barrios especificados'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{profile.interested_owners || 0} Propietarios interesados</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              profile.status === 'active' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                profile.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                            <span>
                              Creado {new Date(profile.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-6">
                          <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400">
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}


            </div>
          </div>
        </main>
      </div>
    </div>
  )
}