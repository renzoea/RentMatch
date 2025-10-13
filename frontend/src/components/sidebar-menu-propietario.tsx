'use client'

import { Home, Users, FileText, Wallet, User as UserIcon, LogOut, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function SidebarMenuPropietario({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">RentMatch</span>
        </div>

        {/* Menú de navegación */}
        <nav className="space-y-2">
          <Button
            variant={isActive("/home/propietario") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/propietario") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/propietario"}
          >
            <Home className="w-5 h-5 mr-3" />
            Inicio
          </Button>

          {/* <Button
            variant={isActive("/home/propietario/perfiles") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/propietario/perfiles") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/propietario/perfiles"}
          >
            <Users className="w-5 h-5 mr-3" />
            Perfiles de Inquilinos
          </Button> */}

          <Button
            variant={isActive("/home/propietario/contratos") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/propietario/contratos") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/propietario/contratos"}
          >
            <FileText className="w-5 h-5 mr-3" />
            Contratos
          </Button>


          <Button
            variant={isActive("/home/propietario/cuenta") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/propietario/cuenta") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/propietario/cuenta"}
          >
            <UserIcon className="w-5 h-5 mr-3" />
            Mi Cuenta
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </nav>
      </div>
    </aside>
  )
}
