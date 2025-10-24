type StatusBadgeProps = {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
      case 'activo':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          label: 'Activo'
        }
      case 'pending_signatures':
        return {
          bg: 'bg-yellow-400',
          text: 'text-white',
          label: 'Pendiente de Firmas'
        }
      case 'pending_deposit':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          label: 'Pendiente de Depósito'
        }
      case 'paused':
      case 'pausado':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          label: 'Pausado'
        }
      case 'archived':
      case 'archivado':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          label: 'Archivado'
        }
      case 'draft':
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: 'Borrador'
        }
      case 'terminated':
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: 'Terminado'
        }
      default:
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  )
}
