'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card-standard'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import {
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react'

type Contract = {
  id: string
  status: 'draft' | 'pending_signatures' | 'pending_deposit' | 'active' | 'expired' | 'cancelled'
  rent_amount: number
  deposit_amount: number
  payment_day: number | null
  start_date: string
  end_date: string
  tenant_signature: 'unsigned' | 'signed'
  landlord_signature: 'unsigned' | 'signed'
  created_at: string
  updated_at: string
  document_url?: string | null
  generated_contract_url?: string | null
  terms?: string | null
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

type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export default function ContractsManagement() {
  const [contracts, setContracts] = useState<Contract[]>([])
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [signatureFilter, setSignatureFilter] = useState<string>('all')

  // Rangos de fechas separados
  const [startDateFrom, setStartDateFrom] = useState<string>('')
  const [startDateTo, setStartDateTo] = useState<string>('')
  const [endDateFrom, setEndDateFrom] = useState<string>('')
  const [endDateTo, setEndDateTo] = useState<string>('')

  const [minRent, setMinRent] = useState<string>('')
  const [maxRent, setMaxRent] = useState<string>('')
  const [minDeposit, setMinDeposit] = useState<string>('')
  const [maxDeposit, setMaxDeposit] = useState<string>('')

  // Modal de detalles
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Modal de cambio de estado
  const [contractToUpdate, setContractToUpdate] = useState<Contract | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  // Modal de visor de PDF
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfTitle, setPdfTitle] = useState<string>('')

  // Modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<{ id: string; status: string } | null>(null)

  // Modal de error
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadContracts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, searchQuery, signatureFilter, startDateFrom, startDateTo, endDateFrom, endDateTo, minRent, maxRent, minDeposit, maxDeposit])

  const loadContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      // Filtros básicos
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      // Filtros avanzados - Firmas
      if (signatureFilter !== 'all') params.append('signature_filter', signatureFilter)

      // Filtros avanzados - Rango de fecha de inicio del contrato
      if (startDateFrom) params.append('start_date_from', startDateFrom)
      if (startDateTo) params.append('start_date_to', startDateTo)

      // Filtros avanzados - Rango de fecha de fin del contrato
      if (endDateFrom) params.append('end_date_from', endDateFrom)
      if (endDateTo) params.append('end_date_to', endDateTo)

      // Filtros avanzados - Rango de montos (renta)
      if (minRent) params.append('min_rent', minRent)
      if (maxRent) params.append('max_rent', maxRent)

      // Filtros avanzados - Rango de montos (depósito)
      if (minDeposit) params.append('min_deposit', minDeposit)
      if (maxDeposit) params.append('max_deposit', maxDeposit)

      const response = await api.get(`/api/admin/contracts?${params.toString()}`)
      setContracts(response.data.contracts)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error loading contracts:', err)
      setError('Error al cargar los contratos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPagination({ ...pagination, page: 1 })
  }

  const clearAdvancedFilters = () => {
    setSignatureFilter('all')
    setStartDateFrom('')
    setStartDateTo('')
    setEndDateFrom('')
    setEndDateTo('')
    setMinRent('')
    setMaxRent('')
    setMinDeposit('')
    setMaxDeposit('')
    setPagination({ ...pagination, page: 1 })
  }

  const hasActiveFilters = () => {
    return signatureFilter !== 'all' ||
           startDateFrom !== '' || startDateTo !== '' || endDateFrom !== '' || endDateTo !== '' ||
           minRent !== '' || maxRent !== '' || minDeposit !== '' || maxDeposit !== ''
  }

  const handleViewDetails = async (contract: Contract) => {
    try {
      // Cargar detalles completos del contrato
      const response = await api.get(`/api/admin/contracts/${contract.id}`)
      setSelectedContract(response.data)
      setDetailsModalOpen(true)
    } catch (err) {
      console.error('Error loading contract details:', err)
      setErrorMessage('Error al cargar los detalles del contrato')
      setErrorModalOpen(true)
    }
  }

  const handleChangeStatus = (contract: Contract) => {
    setContractToUpdate(contract)
    setNewStatus(contract.status)
    setStatusModalOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!contractToUpdate || !newStatus) return

    try {
      await api.patch(`/api/admin/contracts/${contractToUpdate.id}/status`, {
        status: newStatus
      })
      setStatusModalOpen(false)
      setContractToUpdate(null)
      setNewStatus('')
      loadContracts()
    } catch (err) {
      console.error('Error updating contract status:', err)
      setStatusModalOpen(false)
      setContractToUpdate(null)
      setNewStatus('')
      setErrorMessage('Error al actualizar el estado del contrato')
      setErrorModalOpen(true)
    }
  }

  const handleDeleteContract = (contractId: string, contractStatus: string) => {
    if (contractStatus !== 'draft' && contractStatus !== 'cancelled') {
      setErrorMessage('Solo se pueden eliminar contratos en estado borrador o cancelado')
      setErrorModalOpen(true)
      return
    }

    setContractToDelete({ id: contractId, status: contractStatus })
    setDeleteModalOpen(true)
  }

  const confirmDeleteContract = async () => {
    if (!contractToDelete) return

    try {
      await api.delete(`/api/admin/contracts/${contractToDelete.id}`)
      setDeleteModalOpen(false)
      setContractToDelete(null)
      loadContracts()
    } catch (err) {
      console.error('Error deleting contract:', err)
      setDeleteModalOpen(false)
      setContractToDelete(null)
      setErrorMessage('Error al eliminar el contrato')
      setErrorModalOpen(true)
    }
  }

  const handleViewPdf = (url: string, title: string) => {
    setPdfUrl(url)
    setPdfTitle(title)
    setPdfViewerOpen(true)
  }

  if (loading && contracts.length === 0) {
    return <ContractsSkeleton />
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
        <p className="text-gray-600 mt-1">
          Administra todos los contratos de la plataforma
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Contratos"
          value={pagination.total}
          icon={<FileText />}
          color="blue"
        />
        <StatsCard
          title="Activos"
          value={contracts.filter(c => c.status === 'active').length}
          icon={<CheckCircle />}
          color="green"
        />
        <StatsCard
          title="Pendientes"
          value={contracts.filter(c => c.status === 'draft' || c.status === 'pending_signatures' || c.status === 'pending_deposit').length}
          icon={<Clock />}
          color="orange"
        />
        <StatsCard
          title="Expirados"
          value={contracts.filter(c => c.status === 'expired').length}
          icon={<AlertCircle />}
          color="gray"
        />
        <StatsCard
          title="Cancelados"
          value={contracts.filter(c => c.status === 'cancelled').length}
          icon={<XCircle />}
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
                <option value="draft">Borrador</option>
                <option value="pending_signatures">Pendiente de firmas</option>
                <option value="pending_deposit">Pendiente de depósito</option>
                <option value="active">Activo</option>
                <option value="expired">Expirado</option>
                <option value="cancelled">Cancelado</option>
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
                  {[signatureFilter !== 'all', startDateFrom, startDateTo, endDateFrom, endDateTo, minRent, maxRent, minDeposit, maxDeposit].filter(Boolean).length}
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
                {/* Filtro de Firmas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Firmas
                  </label>
                  <select
                    value={signatureFilter}
                    onChange={(e) => {
                      setSignatureFilter(e.target.value)
                      setPagination({ ...pagination, page: 1 })
                    }}
                    className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todas las firmas</option>
                    <option value="unsigned">Sin firmas</option>
                    <option value="landlord_only">Solo propietario firmó</option>
                    <option value="tenant_only">Solo inquilino firmó</option>
                    <option value="both_signed">Ambos firmaron</option>
                  </select>
                </div>

                {/* Fecha de Inicio del Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio del Contrato
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Desde</label>
                      <input
                        type="date"
                        value={startDateFrom}
                        onChange={(e) => {
                          setStartDateFrom(e.target.value)
                          setPagination({ ...pagination, page: 1 })
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                      <input
                        type="date"
                        value={startDateTo}
                        onChange={(e) => {
                          setStartDateTo(e.target.value)
                          setPagination({ ...pagination, page: 1 })
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha de Fin del Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin del Contrato
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Desde</label>
                      <input
                        type="date"
                        value={endDateFrom}
                        onChange={(e) => {
                          setEndDateFrom(e.target.value)
                          setPagination({ ...pagination, page: 1 })
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                      <input
                        type="date"
                        value={endDateTo}
                        onChange={(e) => {
                          setEndDateTo(e.target.value)
                          setPagination({ ...pagination, page: 1 })
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Rango de Renta Mensual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renta Mensual
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mínima</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={minRent}
                          onChange={(e) => {
                            setMinRent(e.target.value)
                            setPagination({ ...pagination, page: 1 })
                          }}
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Máxima</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={maxRent}
                          onChange={(e) => {
                            setMaxRent(e.target.value)
                            setPagination({ ...pagination, page: 1 })
                          }}
                          placeholder="999999"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rango de Depósito */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depósito de Garantía
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={minDeposit}
                          onChange={(e) => {
                            setMinDeposit(e.target.value)
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
                          value={maxDeposit}
                          onChange={(e) => {
                            setMaxDeposit(e.target.value)
                            setPagination({ ...pagination, page: 1 })
                          }}
                          placeholder="999999"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts Table */}
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p>{error}</p>
              <button
                onClick={loadContracts}
                className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          </CardContent>
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron contratos</p>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Partes</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Montos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Periodo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Firmas</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <ContractRow
                      key={contract.id}
                      contract={contract}
                      onViewDetails={() => handleViewDetails(contract)}
                      onChangeStatus={() => handleChangeStatus(contract)}
                      onDelete={() => handleDeleteContract(contract.id, contract.status)}
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
                  {pagination.total} contratos
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
      {detailsModalOpen && selectedContract && (
        <DetailsModal
          contract={selectedContract}
          onViewPdf={handleViewPdf}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedContract(null)
          }}
        />
      )}

      {/* Modal de Cambio de Estado */}
      {statusModalOpen && contractToUpdate && (
        <StatusModal
          contract={contractToUpdate}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onConfirm={confirmStatusChange}
          onCancel={() => {
            setStatusModalOpen(false)
            setContractToUpdate(null)
            setNewStatus('')
          }}
        />
      )}

      {/* Modal de Visor de PDF */}
      {pdfViewerOpen && (
        <PdfViewerModal
          url={pdfUrl}
          title={pdfTitle}
          onClose={() => {
            setPdfViewerOpen(false)
            setPdfUrl('')
            setPdfTitle('')
          }}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalOpen && contractToDelete && (
        <DeleteConfirmModal
          onConfirm={confirmDeleteContract}
          onCancel={() => {
            setDeleteModalOpen(false)
            setContractToDelete(null)
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

function StatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'gray' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500',
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

function ContractRow({
  contract,
  onViewDetails,
  onChangeStatus,
  onDelete
}: {
  contract: Contract
  onViewDetails: () => void
  onChangeStatus: () => void
  onDelete: () => void
}) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending_signatures: 'bg-orange-100 text-orange-700 border-orange-200',
    pending_deposit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200'
  }

  const statusLabels = {
    draft: 'Borrador',
    pending_signatures: 'Pendiente de firmas',
    pending_deposit: 'Pendiente de depósito',
    active: 'Activo',
    expired: 'Expirado',
    cancelled: 'Cancelado'
  }

  const statusIcons = {
    draft: <FileText className="w-3.5 h-3.5" />,
    pending_signatures: <Clock className="w-3.5 h-3.5" />,
    pending_deposit: <DollarSign className="w-3.5 h-3.5" />,
    active: <CheckCircle className="w-3.5 h-3.5" />,
    expired: <AlertCircle className="w-3.5 h-3.5" />,
    cancelled: <XCircle className="w-3.5 h-3.5" />
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {contract.landlord.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {contract.landlord.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-gray-500">Propietario</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {contract.tenant.full_name?.charAt(0).toUpperCase() || 'I'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {contract.tenant.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-gray-500">Inquilino</p>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[contract.status]}`}>
          {statusIcons[contract.status]}
          {statusLabels[contract.status]}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1.5 text-gray-900">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-semibold">
              ${contract.rent_amount.toLocaleString()}
            </span>
            <span className="text-gray-500">/mes</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="text-xs">Depósito:</span>
            <span className="font-medium">${contract.deposit_amount.toLocaleString()}</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(contract.start_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <span>hasta</span>
            <span>
              {new Date(contract.end_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {contract.landlord_signature === 'signed' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
            <span className="text-xs text-gray-600">Propietario</span>
          </div>
          <div className="flex items-center gap-1.5">
            {contract.tenant_signature === 'signed' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
            <span className="text-xs text-gray-600">Inquilino</span>
          </div>
        </div>
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

          {/* Cambiar Estado */}
          <button
            onClick={onChangeStatus}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Cambiar estado"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          {/* Eliminar */}
          {(contract.status === 'draft' || contract.status === 'cancelled') && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Eliminar contrato"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function DetailsModal({
  contract,
  onClose,
  onViewPdf
}: {
  contract: Contract
  onClose: () => void
  onViewPdf: (url: string, title: string) => void
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const statusLabels = {
    draft: 'Borrador',
    pending_signatures: 'Pendiente de firmas',
    pending_deposit: 'Pendiente de depósito',
    active: 'Activo',
    expired: 'Expirado',
    cancelled: 'Cancelado'
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
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalles del Contrato</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Contrato #{contract.id.slice(0, 8)}
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
            {/* Estado */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estado</h3>
              <p className="text-lg font-semibold text-gray-900">{statusLabels[contract.status]}</p>
            </div>

            {/* Partes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Partes</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">Propietario</p>
                  <p className="font-semibold text-gray-900">{contract.landlord.full_name}</p>
                  <p className="text-sm text-gray-600">{contract.landlord.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Firma:</span>
                    {contract.landlord_signature === 'signed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Firmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Inquilino</p>
                  <p className="font-semibold text-gray-900">{contract.tenant.full_name}</p>
                  <p className="text-sm text-gray-600">{contract.tenant.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Firma:</span>
                    {contract.tenant_signature === 'signed' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Firmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles Financieros */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detalles Financieros</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Renta Mensual</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${contract.rent_amount.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Depósito de Garantía</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${contract.deposit_amount.toLocaleString()}
                  </p>
                </div>
                {contract.payment_day && (
                  <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Día de Pago</p>
                    <p className="text-lg font-bold text-gray-900">
                      Día {contract.payment_day} de cada mes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Periodo del Contrato */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Periodo del Contrato</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Fecha de Inicio</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(contract.start_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Fecha de Fin</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(contract.end_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Documentos del Contrato */}
            {(contract.document_url || contract.generated_contract_url || contract.terms) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Documentos y Términos</h3>
                <div className="space-y-3">
                  {contract.document_url && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Documento Original</p>
                            <p className="text-xs text-gray-600">Documento adjunto por el usuario</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onViewPdf(contract.document_url!, 'Documento Original')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.generated_contract_url && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Contrato Generado</p>
                            <p className="text-xs text-gray-600">Documento generado por el sistema</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onViewPdf(contract.generated_contract_url!, 'Contrato Generado')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.terms && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Términos y Condiciones</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                    </div>
                  )}
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
                    {new Date(contract.created_at).toLocaleDateString('es-ES', {
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
                    {new Date(contract.updated_at).toLocaleDateString('es-ES', {
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

function StatusModal({
  contract,
  newStatus,
  onStatusChange,
  onConfirm,
  onCancel
}: {
  contract: Contract
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
    { value: 'draft', label: 'Borrador' },
    { value: 'pending_signatures', label: 'Pendiente de firmas' },
    { value: 'pending_deposit', label: 'Pendiente de depósito' },
    { value: 'active', label: 'Activo' },
    { value: 'expired', label: 'Expirado' },
    { value: 'cancelled', label: 'Cancelado' }
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
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cambiar Estado</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Contrato #{contract.id.slice(0, 8)}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Nota</p>
                <p>El cambio de estado se aplicará inmediatamente y puede afectar la disponibilidad y acceso al contrato.</p>
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
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function PdfViewerModal({
  url,
  title,
  onClose
}: {
  url: string
  title: string
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
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-0.5">Documento del contrato</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            className="w-full h-full"
            title={title}
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

function DeleteConfirmModal({
  onConfirm,
  onCancel
}: {
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
            <div className="bg-red-100 p-2.5 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">¿Estás seguro?</h2>
              <p className="text-sm text-gray-600 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700">
            ¿Estás seguro de eliminar este contrato? Esta acción no se puede deshacer.
          </p>
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
            Aceptar
          </button>
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

function ContractsSkeleton() {
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
