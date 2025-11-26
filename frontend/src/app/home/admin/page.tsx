'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card-standard'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import {
  Users,
  FileText,
  Wallet,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  X,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

type DashboardStats = {
  users: {
    total: number
    inquilinos: number
    propietarios: number
    admins: number
    verified: number
    pending: number
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number | string
  }
  contracts: {
    total: number
    active: number
    pending: number
    completed: number
    cancelled: number
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number | string
  }
  deposits: {
    total: number
    pending: number
    received: number
    returned: number
    disputed: number
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number | string
    totalValue: number
    currentMonthValue: number
    previousMonthValue: number
  }
  searchProfiles: {
    total: number
    active: number
    paused: number
    archived: number
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number | string
  }
  kpis: {
    totalRevenue: number
    monthlyGrowth: number | string
    activeContracts: number
    conversionRate: number | string
    averageDepositValue: number | string
  }
}

type ChartData = {
  timeline: Array<{
    month: string
    usuarios: number
    inquilinos: number
    propietarios: number
    contratos: number
    depositos: number
    contractsActive: number
    contractsPending: number
    contractsCompleted: number
    contractsCancelled: number
  }>
  summary: {
    totalUsers: number
    totalContracts: number
    totalDeposits: number
  }
  predictions?: {
    nextMonth?: {
      month: string
      predictedUsers: number
      predictedContracts: number
      predictedDeposits: number
      confidence: 'high' | 'medium' | 'low'
    }
    alerts?: Array<{
      type: 'warning' | 'success' | 'danger'
      metric: string
      message: string
      severity: 'high' | 'medium' | 'low'
    }>
    trends?: {
      userGrowthRate: string
      contractGrowthRate: string
      avgMonthlyUsers: number
      avgMonthlyContracts: number
    }
  }
}

type RecentActivity = {
  id: string
  type: 'user' | 'contract' | 'deposit' | 'profile'
  description: string
  timestamp: string
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, activityRes, chartsRes] = await Promise.all([
        api.get('/api/admin/dashboard/stats'),
        api.get('/api/admin/dashboard/recent-activity'),
        api.get('/api/admin/dashboard/charts?months=6')
      ])

      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
      setChartData(chartsRes.data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 md:p-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">Error al cargar el dashboard</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Datos para gráfico circular de contratos
  const contractsPieData = [
    { name: 'Activos', value: stats?.contracts.active || 0, color: '#10b981' },
    { name: 'Pendientes', value: stats?.contracts.pending || 0, color: '#f59e0b' },
    { name: 'Completados', value: stats?.contracts.completed || 0, color: '#3b82f6' },
    { name: 'Cancelados', value: stats?.contracts.cancelled || 0, color: '#ef4444' }
  ]

  // Datos para gráfico de barras de roles
  const rolesBarData = [
    { name: 'Inquilinos', value: stats?.users.inquilinos || 0, color: '#3b82f6' },
    { name: 'Propietarios', value: stats?.users.propietarios || 0, color: '#10b981' },
    { name: 'Admins', value: stats?.users.admins || 0, color: '#9333ea' }
  ]

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel General</h1>
        <p className="text-gray-600 mt-1">Vista general de RentMatch</p>
      </div>

      {/* Hero KPIs Section */}
      {stats?.kpis && (
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Métricas Clave del Negocio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* KPI 1 - Revenue Total */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-200" />
                <p className="text-sm text-purple-100">Ingresos Totales</p>
              </div>
              <p className="text-3xl font-bold">
                ${stats.kpis.totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-purple-200 mt-1">En depósitos gestionados</p>
            </div>

            {/* KPI 2 - Monthly Growth */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-200" />
                <p className="text-sm text-purple-100">Crecimiento Mensual</p>
              </div>
              <p className="text-3xl font-bold">
                {typeof stats.kpis.monthlyGrowth === 'string'
                  ? parseFloat(stats.kpis.monthlyGrowth) > 0 ? '+' : ''
                  : stats.kpis.monthlyGrowth > 0 ? '+' : ''}
                {stats.kpis.monthlyGrowth}%
              </p>
              <p className="text-xs text-purple-200 mt-1">Nuevos usuarios</p>
            </div>

            {/* KPI 3 - Active Contracts */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-200" />
                <p className="text-sm text-purple-100">Contratos Activos</p>
              </div>
              <p className="text-3xl font-bold">{stats.kpis.activeContracts}</p>
              <p className="text-xs text-purple-200 mt-1">En proceso</p>
            </div>

            {/* KPI 4 - Conversion Rate */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-200" />
                <p className="text-sm text-purple-100">Tasa de Conversión</p>
              </div>
              <p className="text-3xl font-bold">{stats.kpis.conversionRate}%</p>
              <p className="text-xs text-purple-200 mt-1">Usuarios → Contratos</p>
            </div>

            {/* KPI 5 - Avg Deposit Value */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-200" />
                <p className="text-sm text-purple-100">Depósito Promedio</p>
              </div>
              <p className="text-3xl font-bold">
                ${parseFloat(stats.kpis.averageDepositValue.toString()).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-purple-200 mt-1">Por contrato</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - 4 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Totales"
          value={stats?.users.total || 0}
          icon={<Users />}
          color="blue"
          comparison={{
            change: stats?.users.change || 0,
            changePercent: stats?.users.changePercent || 0
          }}
          trend={{
            value: stats?.users.verified || 0,
            label: 'verificados',
            type: 'neutral'
          }}
          onClick={() => router.push('/home/admin/usuarios')}
        />
        <StatCard
          title="Contratos Activos"
          value={stats?.contracts.active || 0}
          icon={<FileText />}
          color="green"
          comparison={{
            change: stats?.contracts.change || 0,
            changePercent: stats?.contracts.changePercent || 0
          }}
          trend={{
            value: stats?.contracts.pending || 0,
            label: 'pendientes',
            type: 'warning'
          }}
          onClick={() => router.push('/home/admin/contratos')}
        />
        <StatCard
          title="Depósitos"
          value={stats?.deposits.total || 0}
          icon={<Wallet />}
          color="orange"
          comparison={{
            change: stats?.deposits.change || 0,
            changePercent: stats?.deposits.changePercent || 0
          }}
          trend={{
            value: stats?.deposits.disputed || 0,
            label: 'en disputa',
            type: stats?.deposits.disputed ? 'down' : 'neutral'
          }}
          onClick={() => router.push('/home/admin/depositos')}
        />
        <StatCard
          title="Perfiles Activos"
          value={stats?.searchProfiles.active || 0}
          icon={<Search />}
          color="purple"
          comparison={{
            change: stats?.searchProfiles.change || 0,
            changePercent: stats?.searchProfiles.changePercent || 0
          }}
          trend={{
            value: stats?.searchProfiles.total || 0,
            label: 'totales',
            type: 'neutral'
          }}
          onClick={() => router.push('/home/admin/perfiles-busqueda')}
        />
      </div>

      {/* Predictions & Alerts Section */}
      {chartData?.predictions && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximo Mes - Predicción */}
          {chartData.predictions.nextMonth && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Proyección Próximo Mes</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Usuarios</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {chartData.predictions.nextMonth.predictedUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Contratos</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {chartData.predictions.nextMonth.predictedContracts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-700">Depósitos</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {chartData.predictions.nextMonth.predictedDeposits}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>
                        Confianza:{' '}
                        <span className={`font-semibold ${
                          chartData.predictions.nextMonth.confidence === 'high'
                            ? 'text-green-600'
                            : chartData.predictions.nextMonth.confidence === 'medium'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          {chartData.predictions.nextMonth.confidence === 'high'
                            ? 'Alta'
                            : chartData.predictions.nextMonth.confidence === 'medium'
                            ? 'Media'
                            : 'Baja'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tendencias */}
          {chartData.predictions.trends && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Tendencias</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Crecimiento de Usuarios</span>
                      <span className={`text-lg font-bold ${
                        parseFloat(chartData.predictions.trends.userGrowthRate) > 0
                          ? 'text-green-600'
                          : parseFloat(chartData.predictions.trends.userGrowthRate) < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {parseFloat(chartData.predictions.trends.userGrowthRate) > 0 ? '+' : ''}
                        {chartData.predictions.trends.userGrowthRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(chartData.predictions.trends.userGrowthRate) > 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(Math.abs(parseFloat(chartData.predictions.trends.userGrowthRate)), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Crecimiento de Contratos</span>
                      <span className={`text-lg font-bold ${
                        parseFloat(chartData.predictions.trends.contractGrowthRate) > 0
                          ? 'text-green-600'
                          : parseFloat(chartData.predictions.trends.contractGrowthRate) < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {parseFloat(chartData.predictions.trends.contractGrowthRate) > 0 ? '+' : ''}
                        {chartData.predictions.trends.contractGrowthRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(chartData.predictions.trends.contractGrowthRate) > 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(Math.abs(parseFloat(chartData.predictions.trends.contractGrowthRate)), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Promedio mensual usuarios:</span>
                        <span className="font-semibold text-gray-900">
                          {chartData.predictions.trends.avgMonthlyUsers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Promedio mensual contratos:</span>
                        <span className="font-semibold text-gray-900">
                          {chartData.predictions.trends.avgMonthlyContracts}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertas Inteligentes */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Alertas Inteligentes</h3>
              </div>
              {chartData.predictions.alerts && chartData.predictions.alerts.length > 0 ? (
                <div className="space-y-3">
                  {chartData.predictions.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'danger'
                          ? 'bg-red-50 border-red-500'
                          : alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {alert.type === 'danger' ? (
                          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : alert.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.type === 'danger'
                              ? 'text-red-900'
                              : alert.type === 'warning'
                              ? 'text-yellow-900'
                              : 'text-green-900'
                          }`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Métrica: {alert.metric} • Severidad: {alert.severity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    No hay alertas. Todo funciona correctamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Líneas - Usuarios en el tiempo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Usuarios Registrados</h3>
              </div>
              <span className="text-xs text-gray-500">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Total Usuarios"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="inquilinos"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Inquilinos"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="propietarios"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Propietarios"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Área - Contratos en el tiempo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Contratos Creados</h3>
              </div>
              <span className="text-xs text-gray-500">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData?.timeline || []}>
                <defs>
                  <linearGradient id="colorContratos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="contratos"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorContratos)"
                  name="Contratos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Distribución de Roles */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Distribución por Rol</h3>
              </div>
              <span className="text-xs text-gray-500">Total: {stats?.users.total || 0}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rolesBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Usuarios">
                  {rolesBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico Circular - Estados de Contratos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Estados de Contratos</h3>
              </div>
              <span className="text-xs text-gray-500">Total: {stats?.contracts.total || 0}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractsPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats - 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuarios */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Usuarios por Rol</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <StatRow
                label="Inquilinos"
                value={stats?.users.inquilinos || 0}
                total={stats?.users.total || 0}
                color="blue"
              />
              <StatRow
                label="Propietarios"
                value={stats?.users.propietarios || 0}
                total={stats?.users.total || 0}
                color="green"
              />
              <StatRow
                label="Administradores"
                value={stats?.users.admins || 0}
                total={stats?.users.total || 0}
                color="purple"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Verificados</span>
                <span className="font-semibold text-green-600">
                  {stats?.users.verified || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Pendientes</span>
                <span className="font-semibold text-orange-600">
                  {stats?.users.pending || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contratos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Contratos por Estado</h3>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <StatRow
                label="Activos"
                value={stats?.contracts.active || 0}
                total={stats?.contracts.total || 0}
                color="green"
                icon={<CheckCircle className="w-4 h-4" />}
              />
              <StatRow
                label="Pendientes"
                value={stats?.contracts.pending || 0}
                total={stats?.contracts.total || 0}
                color="orange"
                icon={<Clock className="w-4 h-4" />}
              />
              <StatRow
                label="Completados"
                value={stats?.contracts.completed || 0}
                total={stats?.contracts.total || 0}
                color="blue"
              />
              <StatRow
                label="Cancelados"
                value={stats?.contracts.cancelled || 0}
                total={stats?.contracts.total || 0}
                color="red"
              />
            </div>
          </CardContent>
        </Card>

        {/* Depósitos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Depósitos por Estado</h3>
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-3">
              <StatRow
                label="Pendientes"
                value={stats?.deposits.pending || 0}
                total={stats?.deposits.total || 0}
                color="orange"
              />
              <StatRow
                label="Recibidos"
                value={stats?.deposits.received || 0}
                total={stats?.deposits.total || 0}
                color="green"
              />
              <StatRow
                label="Devueltos"
                value={stats?.deposits.returned || 0}
                total={stats?.deposits.total || 0}
                color="blue"
              />
              <StatRow
                label="En Disputa"
                value={stats?.deposits.disputed || 0}
                total={stats?.deposits.total || 0}
                color="red"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
              {recentActivity.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({recentActivity.length > 6 ? '6' : recentActivity.length} de {recentActivity.length})
                </span>
              )}
            </div>
            {recentActivity.length > 6 && (
              <button
                onClick={() => setShowActivityModal(true)}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Ver todo
              </button>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 6).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Actividad Completa */}
      {showActivityModal && (
        <ActivityModal
          activities={recentActivity}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </div>
  )
}

// Componente para las tarjetas de estadísticas principales
function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  comparison,
  onClick
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
  trend?: {
    value: number
    label: string
    type: 'up' | 'down' | 'neutral' | 'warning'
  }
  comparison?: {
    change: number
    changePercent: number | string
  }
  onClick?: () => void
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-600'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
    warning: 'text-orange-600'
  }

  const TrendIcon = trend?.type === 'up' ? TrendingUp : trend?.type === 'down' ? TrendingDown : null

  // Determinar el color y el icono de comparación
  const comparisonPercent = typeof comparison?.changePercent === 'string'
    ? parseFloat(comparison.changePercent)
    : comparison?.changePercent || 0

  const isPositive = comparisonPercent > 0
  const isNegative = comparisonPercent < 0
  const ComparisonIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : null

  return (
    <Card hover>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>

            {/* Comparación mes actual vs anterior */}
            {comparison && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {ComparisonIcon && <ComparisonIcon className="w-4 h-4" />}
                <span>
                  {isPositive ? '+' : ''}{comparisonPercent}%
                </span>
                <span className="text-gray-500 font-normal text-xs">vs mes anterior</span>
              </div>
            )}

            {/* Trend secundario */}
            {trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${trendColors[trend.type]}`}>
                {TrendIcon && <TrendIcon className="w-3 h-3" />}
                <span className="font-semibold">{trend.value}</span>
                <span>{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`${colors[color]} p-3 rounded-xl flex items-center justify-center`}>
            <div className="w-6 h-6 text-white">
              {icon}
            </div>
          </div>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors group"
          >
            <span>Ver detalles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para las filas de estadísticas detalladas
function StatRow({
  label,
  value,
  total,
  color,
  icon
}: {
  label: string
  value: number
  total: number
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  icon?: React.ReactNode
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-600',
    red: 'bg-red-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Componente para los items de actividad reciente
function ActivityItem({ activity }: { activity: RecentActivity }) {
  const typeIcons = {
    user: <Users className="w-5 h-5" />,
    contract: <FileText className="w-5 h-5" />,
    deposit: <Wallet className="w-5 h-5" />,
    profile: <Search className="w-5 h-5" />
  }

  const typeColors = {
    user: 'bg-blue-500',
    contract: 'bg-green-500',
    deposit: 'bg-orange-500',
    profile: 'bg-purple-600'
  }

  const typeBgColors = {
    user: 'bg-blue-50 border-blue-100',
    contract: 'bg-green-50 border-green-100',
    deposit: 'bg-orange-50 border-orange-100',
    profile: 'bg-purple-50 border-purple-100'
  }

  const typeLabels = {
    user: 'Usuario',
    contract: 'Contrato',
    deposit: 'Depósito',
    profile: 'Perfil'
  }

  const timeAgo = new Date(activity.timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${typeBgColors[activity.type]} hover:shadow-sm transition-all`}>
      <div className={`${typeColors[activity.type]} p-3 rounded-xl flex-shrink-0 shadow-sm flex items-center justify-center`}>
        <div className="w-5 h-5 text-white">
          {typeIcons[activity.type]}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700">
            {typeLabels[activity.type]}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">{activity.description}</p>
        {activity.user && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">{activity.user.full_name}</span>
            <span className="text-gray-400">•</span>
            <span className="truncate">{activity.user.email}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Modal de Actividad Completa
function ActivityModal({
  activities,
  onClose
}: {
  activities: RecentActivity[]
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'} registradas
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
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
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

// Skeleton para loading
function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-10 w-20 mb-3" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
