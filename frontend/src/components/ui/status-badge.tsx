import { cn } from "@/lib/utils"

type StatusVariant =
  | 'active'      // Verde - Para perfiles/contratos activos
  | 'paused'      // Amarillo - Para perfiles pausados
  | 'archived'    // Gris - Para elementos archivados
  | 'verified'    // Verde claro - Para verificaciones exitosas
  | 'pending'     // Naranja - Para elementos pendientes
  | 'error'       // Rojo - Para errores/rechazos
  | 'success'     // Verde oscuro - Para operaciones exitosas
  | 'warning'     // Amarillo oscuro - Para advertencias

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  archived: 'bg-gray-100 text-gray-700 border-gray-200',
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
