'use client'

import { Home, Plus, FileText, Wallet, User as UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function SidebarMenu({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path

  return (
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
            variant={isActive("/home/inquilino") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/inquilino") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/inquilino"}
          >
            <Home className="w-5 h-5 mr-3" />
            Inicio
          </Button>
          <Button
            variant={isActive("/home/inquilino/crear") ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive("/home/inquilino/crear") ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => window.location.href = "/home/inquilino/crear"}
          >
            <Plus className="w-5 h-5 mr-3" />
            Crear Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100" onClick={() => window.location.href = "/home/contratos"}>
            <FileText className="w-5 h-5 mr-3" />
            Contratos
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100" onClick={() => window.location.href = "/home/deposito"}>
            <Wallet className="w-5 h-5 mr-3" />
            Depósito
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100" onClick={() => window.location.href = "/home/cuenta"}>
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