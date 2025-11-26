'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card-standard'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import {
  DollarSign,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Edit3,
  FileText,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Shield,
  TrendingUp,
  Percent
} from 'lucide-react'

type Deposit = {
  id: string
  amount: number
  status: 'awaiting_verification' | 'held' | 'returned_to_tenant' | 'returned_to_landlord' | 'disputed' | 'pending_payment'
  outcome: 'undecided' | 'return_to_tenant' | 'return_to_landlord' | 'split'
  proof_url?: string | null
  payment_status?: string | null
  payment_method?: string | null
  tenant_share?: number | null
  landlord_share?: number | null
  verified_at?: string | null
  released_at?: string | null
  created_at: string
  updated_at: string
  contract: {
    id: string
    rent_amount: number
    start_date: string
    end_date: string
    landlord: {
      id: string
      full_name: string
      email: string
    }
    tenant: {
      id: string
      full_name: string
      email: string
    }
  }
  submitted_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
  verified_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
  released_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
  notes?: string | null
}

type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export default function DepositsManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  })

  // Filtros básicos
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [hasProof, setHasProof] = useState<string>('all')
  const [verified, setVerified] = useState<string>('all')
  const [released, setReleased] = useState<string>('all')

  // Modal de detalles
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Modal de verificación
  const [depositToVerify, setDepositToVerify] = useState<Deposit | null>(null)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)

  // Modal de liberación
  const [depositToRelease, setDepositToRelease] = useState<Deposit | null>(null)
  const [releaseModalOpen, setReleaseModalOpen] = useState(false)
  const [releaseOutcome, setReleaseOutcome] = useState<string>('return_to_tenant')
  const [tenantShare, setTenantShare] = useState<string>('50')
  const [landlordShare, setLandlordShare] = useState<string>('50')
  const [releaseNotes, setReleaseNotes] = useState<string>('')

  // Modal de cambio de estado
  const [depositToUpdate, setDepositToUpdate] = useState<Deposit | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  // Modal de visor de comprobante
  const [proofViewerOpen, setProofViewerOpen] = useState(false)
  const [proofUrl, setProofUrl] = useState<string>('')

  // Modal de error
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadDeposits()
  }, [pagination.page, statusFilter, outcomeFilter, searchQuery, minAmount, maxAmount, hasProof, verified, released])

  const loadDeposits = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      // Filtros básicos
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (outcomeFilter !== 'all') params.append('outcome', outcomeFilter)
      if (searchQuery) params.append('search', searchQuery)

      // Filtros avanzados
      if (minAmount) params.append('min_amount', minAmount)
      if (maxAmount) params.append('max_amount', maxAmount)
      if (hasProof !== 'all') params.append('has_proof', hasProof)
      if (verified !== 'all') params.append('verified', verified)
      if (released !== 'all') params.append('released', released)

      const response = await api.get(`/api/admin/deposits?${params.toString()}`)
      setDeposits(response.data.deposits)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error loading deposits:', err)
      setError('Error al cargar los depósitos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPagination({ ...pagination, page: 1 })
  }

  const clearAdvancedFilters = () => {
    setMinAmount('')
    setMaxAmount('')
    setHasProof('all')
    setVerified('all')
    setReleased('all')
    setPagination({ ...pagination, page: 1 })
  }

  const hasActiveFilters = () => {
    return minAmount !== '' || maxAmount !== '' || hasProof !== 'all' || verified !== 'all' || released !== 'all'
  }

  const handleViewDetails = async (deposit: Deposit) => {
    try {
      const response = await api.get(`/api/admin/deposits/${deposit.id}`)
      setSelectedDeposit(response.data)
      setDetailsModalOpen(true)
    } catch (err) {
      console.error('Error loading deposit details:', err)
      setErrorMessage('Error al cargar los detalles del depósito')
      setErrorModalOpen(true)
    }
  }

  const handleVerify = (deposit: Deposit) => {
    setDepositToVerify(deposit)
    setVerifyModalOpen(true)
  }

  const confirmVerify = async () => {
    if (!depositToVerify) return

    try {
      await api.patch(`/api/admin/deposits/${depositToVerify.id}/verify`)
      setVerifyModalOpen(false)
      setDepositToVerify(null)
      loadDeposits()
    } catch (err) {
      console.error('Error verifying deposit:', err)
      setVerifyModalOpen(false)
      setDepositToVerify(null)
      setErrorMessage('Error al verificar el depósito')
      setErrorModalOpen(true)
    }
  }

  const handleRelease = (deposit: Deposit) => {
    setDepositToRelease(deposit)
    setReleaseOutcome('return_to_tenant')
    setTenantShare('50')
    setLandlordShare('50')
    setReleaseNotes('')
    setReleaseModalOpen(true)
  }

  const confirmRelease = async () => {
    if (!depositToRelease) return

    try {
      const payload: { outcome: string; notes?: string; tenant_share?: number; landlord_share?: number } = {
        outcome: releaseOutcome,
        notes: releaseNotes || undefined
      }

      if (releaseOutcome === 'split') {
        payload.tenant_share = parseFloat(tenantShare)
        payload.landlord_share = parseFloat(landlordShare)

        if (payload.tenant_share + payload.landlord_share !== 100) {
          setErrorMessage('Los porcentajes deben sumar 100%')
          setErrorModalOpen(true)
          return
        }
      }

      await api.patch(`/api/admin/deposits/${depositToRelease.id}/release`, payload)
      setReleaseModalOpen(false)
      setDepositToRelease(null)
      loadDeposits()
    } catch (err) {
      console.error('Error releasing deposit:', err)
      setReleaseModalOpen(false)
      setDepositToRelease(null)
      setErrorMessage('Error al liberar el depósito')
      setErrorModalOpen(true)
    }
  }

  const handleChangeStatus = (deposit: Deposit) => {
    setDepositToUpdate(deposit)
    setNewStatus(deposit.status)
    setStatusModalOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!depositToUpdate || !newStatus) return

    try {
      await api.patch(`/api/admin/deposits/${depositToUpdate.id}/status`, {
        status: newStatus
      })
      setStatusModalOpen(false)
      setDepositToUpdate(null)
      setNewStatus('')
      loadDeposits()
    } catch (err) {
      console.error('Error updating deposit status:', err)
      setStatusModalOpen(false)
      setDepositToUpdate(null)
      setNewStatus('')
      setErrorMessage('Error al actualizar el estado del depósito')
      setErrorModalOpen(true)
    }
  }

  const handleViewProof = (url: string) => {
    setProofUrl(url)
    setProofViewerOpen(true)
  }

  if (loading && deposits.length === 0) {
    return <DepositsSkeleton />
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Depósitos</h1>
        <p className="text-gray-600 mt-1">
          Administra todos los depósitos de garantía de la plataforma
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Depósitos"
          value={pagination.total}
          icon={<DollarSign />}
          color="blue"
        />
        <StatsCard
          title="Pendientes"
          value={deposits.filter(d => d.status === 'awaiting_verification').length}
          icon={<Clock />}
          color="orange"
        />
        <StatsCard
          title="Retenidos"
          value={deposits.filter(d => d.status === 'held').length}
          icon={<Shield />}
          color="purple"
        />
        <StatsCard
          title="Devueltos"
          value={deposits.filter(d => d.status === 'returned_to_tenant' || d.status === 'returned_to_landlord').length}
          icon={<CheckCircle />}
          color="green"
        />
        <StatsCard
          title="En Disputa"
          value={deposits.filter(d => d.status === 'disputed').length}
          icon={<AlertCircle />}
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
                  placeholder="Buscar por inquilino o propietario..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-56">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="awaiting_verification">Pendiente verificación</option>
                <option value="held">Retenido</option>
                <option value="returned_to_tenant">Devuelto a inquilino</option>
                <option value="returned_to_landlord">Devuelto a propietario</option>
                <option value="disputed">En disputa</option>
                <option value="pending_payment">Pago pendiente</option>
              </select>
            </div>

            {/* Outcome Filter */}
            <div className="lg:w-56">
              <select
                value={outcomeFilter}
                onChange={(e) => {
                  setOutcomeFilter(e.target.value)
                  setPagination({ ...pagination, page: 1 })
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los resultados</option>
                <option value="undecided">Sin decidir</option>
                <option value="return_to_tenant">Devolver a inquilino</option>
                <option value="return_to_landlord">Devolver a propietario</option>
                <option value="split">Dividir</option>
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

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`lg:w-auto px-6 py-2.5 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                hasActiveFilters()
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-600 hover:bg-purple-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {hasActiveFilters() && (
                <span className="ml-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {[minAmount, maxAmount, hasProof !== 'all', verified !== 'all', released !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase">Filtros Avanzados</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAdvancedFilters}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Rango de Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto del Depósito
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={minAmount}
                          onChange={(e) => {
                            setMinAmount(e.target.value)
                            setPagination({ ...pagination, page: 1 })
                          }}
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={maxAmount}
                          onChange={(e) => {
                            setMaxAmount(e.target.value)
                            setPagination({ ...pagination, page: 1 })
                          }}
                          placeholder="999999"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtros booleanos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comprobante
                    </label>
                    <select
                      value={hasProof}
                      onChange={(e) => {
                        setHasProof(e.target.value)
                        setPagination({ ...pagination, page: 1 })
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="true">Con comprobante</option>
                      <option value="false">Sin comprobante</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verificación
                    </label>
                    <select
                      value={verified}
                      onChange={(e) => {
                        setVerified(e.target.value)
                        setPagination({ ...pagination, page: 1 })
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="true">Verificados</option>
                      <option value="false">No verificados</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liberación
                    </label>
                    <select
                      value={released}
                      onChange={(e) => {
                        setReleased(e.target.value)
                        setPagination({ ...pagination, page: 1 })
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="true">Liberados</option>
                      <option value="false">No liberados</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposits Table */}
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p>{error}</p>
              <button
                onClick={loadDeposits}
                className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          </CardContent>
        </Card>
      ) : deposits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron depósitos</p>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contrato</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Resultado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Verificación</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <DepositRow
                      key={deposit.id}
                      deposit={deposit}
                      onViewDetails={() => handleViewDetails(deposit)}
                      onVerify={() => handleVerify(deposit)}
                      onRelease={() => handleRelease(deposit)}
                      onChangeStatus={() => handleChangeStatus(deposit)}
                      onViewProof={handleViewProof}
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
                  {pagination.total} depósitos
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

      {/* Modal de Detalles */}
      {detailsModalOpen && selectedDeposit && (
        <DetailsModal
          deposit={selectedDeposit}
          onViewProof={handleViewProof}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedDeposit(null)
          }}
        />
      )}

      {/* Modal de Verificación */}
      {verifyModalOpen && depositToVerify && (
        <VerifyModal
          deposit={depositToVerify}
          onConfirm={confirmVerify}
          onCancel={() => {
            setVerifyModalOpen(false)
            setDepositToVerify(null)
          }}
        />
      )}

      {/* Modal de Liberación */}
      {releaseModalOpen && depositToRelease && (
        <ReleaseModal
          deposit={depositToRelease}
          outcome={releaseOutcome}
          tenantShare={tenantShare}
          landlordShare={landlordShare}
          notes={releaseNotes}
          onOutcomeChange={setReleaseOutcome}
          onTenantShareChange={setTenantShare}
          onLandlordShareChange={setLandlordShare}
          onNotesChange={setReleaseNotes}
          onConfirm={confirmRelease}
          onCancel={() => {
            setReleaseModalOpen(false)
            setDepositToRelease(null)
          }}
        />
      )}

      {/* Modal de Cambio de Estado */}
      {statusModalOpen && depositToUpdate && (
        <StatusModal
          deposit={depositToUpdate}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onConfirm={confirmStatusChange}
          onCancel={() => {
            setStatusModalOpen(false)
            setDepositToUpdate(null)
            setNewStatus('')
          }}
        />
      )}

      {/* Modal de Visor de Comprobante */}
      {proofViewerOpen && (
        <ProofViewerModal
          url={proofUrl}
          onClose={() => {
            setProofViewerOpen(false)
            setProofUrl('')
          }}
        />
      )}

      {/* Modal de Error */}
      {errorModalOpen && (
        <ErrorModal
          message={errorMessage}
          onClose={() => {
            setErrorModalOpen(false)
            setErrorMessage('')
          }}
        />
      )}
    </div>
  )
}

// Funciones de traducción
function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    'credit_card': 'Tarjeta de crédito',
    'debit_card': 'Tarjeta de débito',
    'master': 'Mastercard',
    'mastercard': 'Mastercard',
    'visa': 'Visa',
    'amex': 'American Express',
    'bank_transfer': 'Transferencia bancaria',
    'cash': 'Efectivo',
    'mercadopago': 'Mercado Pago',
    'paypal': 'PayPal',
    'other': 'Otro'
  }
  return translations[method.toLowerCase()] || method
}

function translatePaymentStatus(status: string): string {
  const translations: Record<string, string> = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado',
    'in_process': 'En proceso',
    'completed': 'Completado',
    'failed': 'Fallido'
  }
  return translations[status.toLowerCase()] || status
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
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
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
          <div className={`${colors[color]} p-3 rounded-xl`}>
            <div className="w-6 h-6 text-white">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DepositRow({
  deposit,
  onViewDetails,
  onVerify,
  onRelease,
  onChangeStatus,
  onViewProof
}: {
  deposit: Deposit
  onViewDetails: () => void
  onVerify: () => void
  onRelease: () => void
  onChangeStatus: () => void
  onViewProof: (url: string) => void
}) {
  const statusColors = {
    awaiting_verification: 'bg-orange-100 text-orange-700 border-orange-200',
    held: 'bg-purple-100 text-purple-700 border-purple-200',
    returned_to_tenant: 'bg-green-100 text-green-700 border-green-200',
    returned_to_landlord: 'bg-blue-100 text-blue-700 border-blue-200',
    disputed: 'bg-red-100 text-red-700 border-red-200',
    pending_payment: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  const statusLabels = {
    awaiting_verification: 'Pendiente verificación',
    held: 'Retenido',
    returned_to_tenant: 'Devuelto a inquilino',
    returned_to_landlord: 'Devuelto a propietario',
    disputed: 'En disputa',
    pending_payment: 'Pago pendiente'
  }

  const outcomeColors = {
    undecided: 'bg-gray-100 text-gray-700',
    return_to_tenant: 'bg-green-100 text-green-700',
    return_to_landlord: 'bg-blue-100 text-blue-700',
    split: 'bg-purple-100 text-purple-700'
  }

  const outcomeLabels = {
    undecided: 'Sin decidir',
    return_to_tenant: 'Devolver a inquilino',
    return_to_landlord: 'Devolver a propietario',
    split: 'Dividir'
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {deposit.contract.landlord.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {deposit.contract.landlord.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-gray-500">Propietario</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {deposit.contract.tenant.full_name?.charAt(0).toUpperCase() || 'I'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {deposit.contract.tenant.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-gray-500">Inquilino</p>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900">
            ${deposit.amount.toLocaleString('es-AR')}
          </span>
        </div>
        {deposit.proof_url && (
          <button
            onClick={() => onViewProof(deposit.proof_url!)}
            className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Ver comprobante
          </button>
        )}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[deposit.status]}`}>
          {statusLabels[deposit.status]}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${outcomeColors[deposit.outcome]}`}>
          {outcomeLabels[deposit.outcome]}
        </span>
        {deposit.outcome === 'split' && deposit.tenant_share && deposit.landlord_share && (
          <div className="mt-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>Inquilino: {deposit.tenant_share}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>Propietario: {deposit.landlord_share}%</span>
            </div>
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        {deposit.verified_at ? (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">Verificado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Pendiente</span>
          </div>
        )}
        {deposit.released_at && (
          <div className="mt-1 flex items-center gap-1.5 text-purple-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Liberado</span>
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-2">
          {/* Ver Detalles */}
          <button
            onClick={onViewDetails}
            className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Verificar (solo si no está verificado) */}
          {!deposit.verified_at && deposit.status === 'awaiting_verification' && (
            <button
              onClick={onVerify}
              className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
              title="Verificar depósito"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          {/* Liberar (solo si está verificado y no liberado) */}
          {deposit.verified_at && !deposit.released_at && (
            <button
              onClick={onRelease}
              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
              title="Liberar depósito"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          )}

          {/* Cambiar Estado */}
          <button
            onClick={onChangeStatus}
            className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
            title="Cambiar estado"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function DetailsModal({
  deposit,
  onClose,
  onViewProof
}: {
  deposit: Deposit
  onClose: () => void
  onViewProof: (url: string) => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const statusLabels = {
    awaiting_verification: 'Pendiente verificación',
    held: 'Retenido',
    returned_to_tenant: 'Devuelto a inquilino',
    returned_to_landlord: 'Devuelto a propietario',
    disputed: 'En disputa',
    pending_payment: 'Pago pendiente'
  }

  const outcomeLabels = {
    undecided: 'Sin decidir',
    return_to_tenant: 'Devolver a inquilino',
    return_to_landlord: 'Devolver a propietario',
    split: 'Dividir'
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalles del Depósito</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Depósito #{deposit.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Monto y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Monto del Depósito</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${deposit.amount.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Estado Actual</p>
                <p className="text-lg font-semibold text-gray-900">
                  {statusLabels[deposit.status]}
                </p>
              </div>
            </div>

            {/* Resultado */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Resultado</h3>
              <p className="text-lg font-semibold text-gray-900">{outcomeLabels[deposit.outcome]}</p>
              {deposit.outcome === 'split' && deposit.tenant_share && deposit.landlord_share && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 mb-1">Porcentaje Inquilino</p>
                    <p className="text-xl font-bold text-blue-900">{deposit.tenant_share}%</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 mb-1">Porcentaje Propietario</p>
                    <p className="text-xl font-bold text-green-900">{deposit.landlord_share}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contrato Relacionado */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contrato Relacionado</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">Propietario</p>
                  <p className="font-semibold text-gray-900">{deposit.contract.landlord.full_name}</p>
                  <p className="text-sm text-gray-600">{deposit.contract.landlord.email}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Inquilino</p>
                  <p className="font-semibold text-gray-900">{deposit.contract.tenant.full_name}</p>
                  <p className="text-sm text-gray-600">{deposit.contract.tenant.email}</p>
                </div>
              </div>
            </div>

            {/* Periodo del Contrato */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Periodo del Contrato</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Fecha de Inicio</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(deposit.contract.start_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Fecha de Fin</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(deposit.contract.end_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Comprobante de Pago */}
            {deposit.proof_url && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Comprobante de Pago</h3>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Comprobante adjunto</p>
                        <p className="text-xs text-gray-600">Subido por el usuario</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewProof(deposit.proof_url!)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Pago */}
            {deposit.payment_method && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Información de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Método de Pago</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {translatePaymentMethod(deposit.payment_method)}
                    </p>
                  </div>
                  {deposit.payment_status && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Estado del Pago</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {translatePaymentStatus(deposit.payment_status)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verificación y Liberación */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Verificación y Liberación</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Verificación</p>
                  {deposit.verified_at ? (
                    <div>
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Verificado</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(deposit.verified_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {deposit.verified_by_profile && (
                        <p className="text-xs text-gray-600 mt-1">
                          Por: {deposit.verified_by_profile.full_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Pendiente de verificación</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Liberación</p>
                  {deposit.released_at ? (
                    <div>
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">Liberado</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(deposit.released_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {deposit.released_by_profile && (
                        <p className="text-xs text-gray-600 mt-1">
                          Por: {deposit.released_by_profile.full_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Aún no liberado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            {deposit.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas</h3>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{deposit.notes}</p>
                </div>
              </div>
            )}

            {/* Fechas del Sistema */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Información del Sistema</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Creado</p>
                  <p className="text-gray-900">
                    {new Date(deposit.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Última Actualización</p>
                  <p className="text-gray-900">
                    {new Date(deposit.updated_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function VerifyModal({
  deposit,
  onConfirm,
  onCancel
}: {
  deposit: Deposit
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verificar Depósito</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                ${deposit.amount.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Confirmas que has verificado este depósito y deseas marcarlo como <span className="font-semibold">retenido</span>?
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Acción de verificación</p>
                <p>El depósito pasará al estado <span className="font-semibold">&quot;Retenido&quot;</span> y quedará registrado que tú lo verificaste.</p>
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
            className="flex-1 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Verificar
          </button>
        </div>
      </div>
    </div>
  )
}

function ReleaseModal({
  deposit,
  outcome,
  tenantShare,
  landlordShare,
  notes,
  onOutcomeChange,
  onTenantShareChange,
  onLandlordShareChange,
  onNotesChange,
  onConfirm,
  onCancel
}: {
  deposit: Deposit
  outcome: string
  tenantShare: string
  landlordShare: string
  notes: string
  onOutcomeChange: (value: string) => void
  onTenantShareChange: (value: string) => void
  onLandlordShareChange: (value: string) => void
  onNotesChange: (value: string) => void
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

  const handleTenantShareChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    onTenantShareChange(value)
    onLandlordShareChange((100 - numValue).toString())
  }

  const handleLandlordShareChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    onLandlordShareChange(value)
    onTenantShareChange((100 - numValue).toString())
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Liberar Depósito</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                ${deposit.amount.toLocaleString('es-AR')}
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resultado de la Auditoría
            </label>
            <select
              value={outcome}
              onChange={(e) => onOutcomeChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="return_to_tenant">Devolver al inquilino (100%)</option>
              <option value="return_to_landlord">Devolver al propietario (100%)</option>
              <option value="split">Dividir entre ambas partes</option>
            </select>
          </div>

          {outcome === 'split' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distribución de Porcentajes
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Porcentaje para el Inquilino
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tenantShare}
                      onChange={(e) => handleTenantShareChange(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Porcentaje para el Propietario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={landlordShare}
                      onChange={(e) => handleLandlordShareChange(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Los porcentajes deben sumar 100%.
                    <span className="font-semibold ml-1">
                      Total actual: {(parseFloat(tenantShare) || 0) + (parseFloat(landlordShare) || 0)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Agrega notas sobre la decisión de liberación..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Acción de liberación</p>
                <p>Esta acción marcará el depósito como liberado y se guardará el resultado de la auditoría.</p>
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
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Liberar
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusModal({
  deposit,
  newStatus,
  onStatusChange,
  onConfirm,
  onCancel
}: {
  deposit: Deposit
  newStatus: string
  onStatusChange: (status: string) => void
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

  const statusOptions = [
    { value: 'awaiting_verification', label: 'Pendiente verificación' },
    { value: 'held', label: 'Retenido' },
    { value: 'returned_to_tenant', label: 'Devuelto a inquilino' },
    { value: 'returned_to_landlord', label: 'Devuelto a propietario' },
    { value: 'disputed', label: 'En disputa' },
    { value: 'pending_payment', label: 'Pago pendiente' }
  ]

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
            <div className="bg-orange-100 p-2.5 rounded-xl">
              <Edit3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cambiar Estado</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                ${deposit.amount.toLocaleString('es-AR')}
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
              Nuevo Estado
            </label>
            <select
              value={newStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Nota</p>
                <p>El cambio de estado se aplicará inmediatamente.</p>
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
            className="flex-1 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function ProofViewerModal({
  url,
  onClose
}: {
  url: string
  onClose: () => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Comprobante de Pago</h2>
              <p className="text-sm text-gray-600 mt-0.5">Documento del depósito</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            className="w-full h-full"
            title="Comprobante de Pago"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  )
}

function ErrorModal({
  message,
  onClose
}: {
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Error</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

function DepositsSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
