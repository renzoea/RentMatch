'use client'

import SidebarMenuAdmin from '@/components/sidebar-menu-admin'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth({ requiredRole: 'admin' })
  const pathname = usePathname()

  // Generar breadcrumb dinámico
  const getBreadcrumb = () => {
    const pathMap: Record<string, string> = {
      '/home/admin': 'Panel General',
      '/home/admin/usuarios': 'Usuarios',
      '/home/admin/contratos': 'Contratos',
      '/home/admin/depositos': 'Depósitos',
      '/home/admin/perfiles-busqueda': 'Perfiles de Búsqueda'
    };

    return pathMap[pathname] || 'Administrador';
  };

  const currentPage = getBreadcrumb();

  // Mostrar pantalla de carga mientras valida
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso administrativo...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, el hook redirigirá automáticamente
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarMenuAdmin onLogout={logout} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full"></div>
            <span className="text-gray-600 text-sm font-medium">
              Dashboard / <span className="text-gray-700">Admin</span>
              {currentPage !== 'Administrador' && currentPage !== 'Panel General' && (
                <> / <span className="text-purple-600 font-semibold">{currentPage}</span></>
              )}
              {currentPage === 'Panel General' && (
                <span className="text-purple-600 font-semibold"> / Panel General</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100/50 px-4 py-2 rounded-xl border border-purple-200">
              <Avatar className="h-9 w-9 bg-gradient-to-br from-purple-600 to-purple-700 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-sm">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <Shield className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {user?.full_name || 'Administrador'}
                </span>
                <span className="text-xs text-purple-600 font-medium">
                  Administrador
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
