'use client'

import { create } from 'zustand'
import { ToastType } from '@/components/ui/toast'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  }
}))

export function useToast() {
  const { addToast } = useToastStore()

  const toast = {
    success: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration })
    },
    error: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration })
    },
    info: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration })
    },
    warning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration })
    }
  }

  return toast
}
