'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card-standard'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import {
  Users,
  Search,
  Filter,
  Ban,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  UserCog,
  MoreVertical
} from 'lucide-react'

type User = {
  id: string
  full_name: string
  email: string
  role: 'inquilino' | 'propietario' | 'admin'
  status: string
  is_banned: boolean
  created_at: string
  updated_at: string
}

type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  })

  // Filtros
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Modal de baneo
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    loadUsers()
  }, [pagination.page, roleFilter, statusFilter, searchQuery])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await api.get(`/api/admin/users?${params.toString()}`)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPagination({ ...pagination, page: 1 })
  }

  const handleBanUser = async (user: User) => {
    if (user.is_banned) {
      // Desbanear directamente
      try {
        await api.patch(`/api/admin/users/${user.id}/unban`)
        loadUsers()
      } catch (err) {
        console.error('Error unbanning user:', err)
        alert('Error al desbanear el usuario')
      }
    } else {
      // Abrir modal para banear
      setUserToBan(user)
      setBanModalOpen(true)
    }
  }

  const confirmBan = async () => {
    if (!userToBan) return

    try {
      await api.patch(`/api/admin/users/${userToBan.id}/ban`, {
        reason: banReason || undefined
      })
      setBanModalOpen(false)
      setUserToBan(null)
      setBanReason('')
      loadUsers()
    } catch (err) {
      console.error('Error banning user:', err)
      alert('Error al banear el usuario')
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) {
      return
    }

    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole })
      loadUsers()
    } catch (err) {
      console.error('Error changing user role:', err)
      alert('Error al cambiar el rol del usuario')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await api.delete(`/api/admin/users/${userId}`)
      loadUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Error al eliminar el usuario')
    }
  }

  if (loading && users.length === 0) {
    return <UsersSkeleton />
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">
          Administra todos los usuarios de la plataforma
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Usuarios"
          value={pagination.total}
          icon={<Users />}
          color="blue"
        />
        <StatsCard
          title="Inquilinos"
          value={users.filter(u => u.role === 'inquilino').length}
          icon={<Users />}
          color="green"
        />
        <StatsCard
          title="Propietarios"
          value={users.filter(u => u.role === 'propietario').length}
          icon={<Shield />}
          color="orange"
        />
        <StatsCard
          title="Baneados"
          value={users.filter(u => u.is_banned).length}
          icon={<Ban />}
          color="red"
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="lg:w-48">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los roles</option>
                <option value="inquilino">Inquilinos</option>
                <option value="propietario">Propietarios</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="verified">Verificado</option>
                <option value="unverified">No verificado</option>
                <option value="pending">Pendiente</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="lg:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p>{error}</p>
              <button
                onClick={loadUsers}
                className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron usuarios</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha de Registro</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onBan={() => handleBanUser(user)}
                      onChangeRole={(newRole) => handleChangeRole(user.id, newRole)}
                      onDelete={() => handleDeleteUser(user.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} usuarios
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Baneo */}
      {banModalOpen && userToBan && (
        <BanModal
          user={userToBan}
          reason={banReason}
          onReasonChange={setBanReason}
          onConfirm={confirmBan}
          onCancel={() => {
            setBanModalOpen(false)
            setUserToBan(null)
            setBanReason('')
          }}
        />
      )}
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${colors[color]} p-3 rounded-xl flex items-center justify-center`}>
            <div className="w-6 h-6 text-white">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserRow({
  user,
  onBan,
  onChangeRole,
  onDelete
}: {
  user: User
  onBan: () => void
  onChangeRole: (newRole: string) => void
  onDelete: () => void
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const roleColors = {
    inquilino: 'bg-blue-100 text-blue-700 border-blue-200',
    propietario: 'bg-green-100 text-green-700 border-green-200',
    admin: 'bg-purple-100 text-purple-700 border-purple-200'
  }

  const roleLabels = {
    inquilino: 'Inquilino',
    propietario: 'Propietario',
    admin: 'Administrador'
  }

  const statusColors = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    unverified: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  }

  const statusLabels = {
    verified: 'Verificado',
    unverified: 'No verificado',
    pending: 'Pendiente',
    rejected: 'Rechazado'
  }

  const statusIcons = {
    verified: <CheckCircle className="w-3.5 h-3.5" />,
    unverified: <AlertCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
    rejected: <AlertCircle className="w-3.5 h-3.5" />
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleColors[user.role]}`}>
          {roleLabels[user.role]}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border w-fit ${statusColors[user.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {statusIcons[user.status as keyof typeof statusIcons]}
            {statusLabels[user.status as keyof typeof statusLabels] || user.status}
          </span>
          {user.is_banned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-100 text-red-700 border-red-200 w-fit">
              <Ban className="w-3.5 h-3.5" />
              Baneado
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(user.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-2">
          {/* Cambiar Rol */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
              title="Cambiar rol"
            >
              <UserCog className="w-5 h-5" />
            </button>

            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Cambiar rol a:</p>
                  </div>
                  {['inquilino', 'propietario', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onChangeRole(role)
                        setShowRoleMenu(false)
                      }}
                      disabled={user.role === role}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        user.role === role
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700'
                      }`}
                    >
                      {role === 'inquilino' && '👤 Inquilino'}
                      {role === 'propietario' && '🏠 Propietario'}
                      {role === 'admin' && '🔑 Administrador'}
                      {user.role === role && ' (actual)'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Banear/Desbanear */}
          <button
            onClick={onBan}
            className={`p-2 rounded-lg transition-colors ${
              user.is_banned
                ? 'hover:bg-green-50 text-green-600'
                : 'hover:bg-orange-50 text-orange-600'
            }`}
            title={user.is_banned ? 'Desbanear usuario' : 'Banear usuario'}
          >
            {user.is_banned ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              <Ban className="w-5 h-5" />
            )}
          </button>

          {/* Eliminar */}
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Eliminar usuario"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function BanModal({
  user,
  reason,
  onReasonChange,
  onConfirm,
  onCancel
}: {
  user: User
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-xl">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Banear Usuario</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {user.full_name || user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Razón del baneo (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Describe la razón por la cual se está baneando este usuario..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">¿Estás seguro?</p>
                <p>El usuario no podrá acceder a la plataforma hasta que sea desbaneado.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
          >
            Banear Usuario
          </button>
        </div>
      </div>
    </div>
  )
}

function UsersSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-12 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
