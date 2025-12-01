import { cn } from "@/lib/utils"

type CardSize = 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: CardSize
  hover?: boolean
}

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  size = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        sizeStyles[size],
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-600 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  )
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 flex gap-2', className)} {...props}>
      {children}
    </div>
  )
}
