import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        'border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-orange-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-md mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
