'use client'

import { Home, Plus, FileText, Wallet, User as UserIcon, LogOut, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function SidebarMenu({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    // For home page, match exactly
    if (path === "/home/inquilino") {
      return pathname === "/home/inquilino"
    }
    // For other pages, match path and subpaths
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 block leading-tight">RentMatch</span>
            <span className="text-xs text-orange-600 font-semibold">Panel Inquilino</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button
            variant={isActive("/home/inquilino") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/inquilino")
                ? "bg-orange-100 text-orange-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/inquilino"}
          >
            <Home className="w-5 h-5 mr-3" />
            Inicio
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Búsqueda
            </span>
          </div>

          <Button
            variant={isActive("/home/inquilino/crear") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/inquilino/crear")
                ? "bg-orange-100 text-orange-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/inquilino/crear"}
          >
            <Plus className="w-5 h-5 mr-3" />
            Crear Perfil
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Mi Alquiler
            </span>
          </div>

          <Button
            variant={isActive("/home/inquilino/contratos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/inquilino/contratos")
                ? "bg-orange-100 text-orange-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/inquilino/contratos"}
          >
            <FileText className="w-5 h-5 mr-3" />
            Contratos
          </Button>

          <Button
            variant={isActive("/home/inquilino/depositos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/inquilino/depositos")
                ? "bg-orange-100 text-orange-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/inquilino/depositos"}
          >
            <Wallet className="w-5 h-5 mr-3" />
            Depósitos
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Configuración
            </span>
          </div>

          <Button
            variant={isActive("/home/inquilino/cuenta") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/inquilino/cuenta")
                ? "bg-orange-100 text-orange-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/inquilino/cuenta"}
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