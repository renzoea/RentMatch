'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarMenuInquilino from '@/components/sidebar-menu-inquilino'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'

export default function InquilinoLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarMenuInquilino onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            <span className="text-gray-600 text-sm font-medium">
              Dashboard / <span className="text-orange-600 font-semibold">Inquilino</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100/50 px-4 py-2 rounded-xl border border-orange-200">
              <Avatar className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {user?.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-orange-600 font-medium">
                  Inquilino
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}