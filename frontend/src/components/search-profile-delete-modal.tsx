import { useState } from 'react'
import type { AxiosInstance, AxiosError } from 'axios'
import { Button } from '@/components/ui/button'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-lg border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold">Eliminar perfil</h2>
        <p className="text-sm text-gray-600">
          ¿Seguro que quieres eliminar este perfil de búsqueda? Esta acción no se puede deshacer.
        </p>
        {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  )
}