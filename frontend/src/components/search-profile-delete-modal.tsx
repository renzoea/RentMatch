'use client'

import { useState } from 'react'
import type { AxiosInstance, AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

interface ApiErrorPayload { error?: string; message?: string }

interface Props {
  open: boolean
  id: string | null
  apiClient: AxiosInstance
  onClose: () => void
  onDeleted: (id: string) => void
}

export default function SearchProfileDeleteModal({ open, id, apiClient, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open || !id) return null

  const confirm = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      await apiClient.delete(`/api/search-profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onDeleted(id)
      onClose()
    } catch (err) {
      const e = err as AxiosError<ApiErrorPayload>
      setError(e.response?.data?.error || e.response?.data?.message || 'Error eliminando')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Eliminar Perfil</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50  p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold text-sm mb-1">Acción Irreversible</h3>
                <p className="text-red-700 text-sm">
                  ¿Estás seguro que deseas eliminar este perfil de búsqueda? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar Perfil
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}