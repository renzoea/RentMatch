'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarMenuInquilino from '@/components/sidebar-menu-inquilino'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'

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
      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="text-gray-500 text-sm">
            Dashboard / Inquilino
          </span>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-orange-500">
              <AvatarFallback className="bg-orange-500 text-white font-semibold">
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-gray-900">{user?.full_name || 'Usuario'}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 p-2 rounded"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}