'use client'

import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  Search,
  LogOut,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function SidebarMenuAdmin({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    // For home page, match exactly
    if (path === "/home/admin") {
      return pathname === "/home/admin"
    }
    // For other pages, match path and subpaths
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 block leading-tight">RentMatch</span>
            <span className="text-xs text-purple-600 font-semibold">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button
            variant={isActive("/home/admin") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/admin")
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/admin"}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Panel General
          </Button>

          <div className="pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
              Gestión
            </span>
          </div>

          <Button
            variant={isActive("/home/admin/usuarios") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/admin/usuarios")
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/admin/usuarios"}
          >
            <Users className="w-5 h-5 mr-3" />
            Usuarios
          </Button>

          <Button
            variant={isActive("/home/admin/contratos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/admin/contratos")
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/admin/contratos"}
          >
            <FileText className="w-5 h-5 mr-3" />
            Contratos
          </Button>

          <Button
            variant={isActive("/home/admin/depositos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/admin/depositos")
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/admin/depositos"}
          >
            <Wallet className="w-5 h-5 mr-3" />
            Depósitos
          </Button>

          <Button
            variant={isActive("/home/admin/perfiles-busqueda") ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive("/home/admin/perfiles-busqueda")
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => window.location.href = "/home/admin/perfiles-busqueda"}
          >
            <Search className="w-5 h-5 mr-3" />
            Perfiles de Búsqueda
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
