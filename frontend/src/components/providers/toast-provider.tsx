'use client'

import { ToastContainer } from '@/components/ui/toast'
import { useToastStore } from '@/hooks/useToast'

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore()

  return <ToastContainer toasts={toasts} onClose={removeToast} />
}
