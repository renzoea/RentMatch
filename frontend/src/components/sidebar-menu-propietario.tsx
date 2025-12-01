'use client'

import { Home, FileText, User as UserIcon, LogOut, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function SidebarMenuPropietario({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    // For home page, match exactly
    if (path === "/home/propietario") {
      return pathname === "/home/propietario"
    }
    // For other pages, match path and subpaths
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 block leading-tight">RentMatch</span>
            <span className="text-xs text-green-600 font-semibold">Panel Propietario</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button
            variant={isActive("/home/propietario") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/propietario")
                ? "bg-green-100 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/propietario"}
          >
            <Home className="w-5 h-5 mr-3" />
            Inicio
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Gestión
            </span>
          </div>

          <Button
            variant={isActive("/home/propietario/contratos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/propietario/contratos")
                ? "bg-green-100 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/propietario/contratos"}
          >
            <FileText className="w-5 h-5 mr-3" />
            Contratos
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Configuración
            </span>
          </div>

          <Button
            variant={isActive("/home/propietario/cuenta") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/propietario/cuenta")
                ? "bg-green-100 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/propietario/cuenta"}
          >
            <UserIcon className="w-5 h-5 mr-3" />
            Mi Cuenta
          </Button>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </div>
    </aside>
  )
}
