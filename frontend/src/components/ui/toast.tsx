'use client'

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600'
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600'
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600'
  }
}

function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const style = toastStyles[type]
  const Icon = style.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border-2 shadow-lg',
        'transition-all duration-300 ease-in-out',
        style.bg,
        style.border,
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-slide-in-right'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', style.iconColor)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            )}
          </div>
          <button
            onClick={() => {
              setIsExiting(true)
              setTimeout(() => onClose(id), 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

export type { ToastType, ToastProps }
