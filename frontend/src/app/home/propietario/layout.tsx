"use client";

import SidebarMenuPropietario from "@/components/sidebar-menu-propietario";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PropietarioLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth({ requiredRole: 'propietario' });

  // Mostrar pantalla de carga mientras valida
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, el hook redirigirá automáticamente
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar del propietario */}
      <SidebarMenuPropietario onLogout={logout} />

      <div className="flex-1 flex flex-col">
        {/* Header superior igual al del inquilino */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            <span className="text-gray-600 text-sm font-medium">
              Dashboard / <span className="text-orange-600 font-semibold">Propietario</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100/50 px-4 py-2 rounded-xl border border-orange-200">
              <Avatar className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm">
                  {user?.full_name
                    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
                    : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {user?.full_name || "Usuario"}
                </span>
                <span className="text-xs text-orange-600 font-medium">Propietario</span>
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

        {/* Contenido dinámico */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
