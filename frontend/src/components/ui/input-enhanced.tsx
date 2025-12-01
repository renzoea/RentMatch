import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"

interface InputEnhancedProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  success?: boolean
  showValidation?: boolean
}

const InputEnhanced = React.forwardRef<HTMLInputElement, InputEnhancedProps>(
  ({ className, label, helperText, error, success, showValidation = false, ...props }, ref) => {
    const hasError = !!error
    const isValid = success && !hasError

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-base",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all",
              // Estados de validación
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-200",
              isValid && showValidation && "border-green-300 focus:border-green-500 focus:ring-green-200 pr-10",
              !hasError && !isValid && "border-gray-300 focus:border-orange-500 focus:ring-orange-200",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Icono de validación */}
          {showValidation && isValid && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}

          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {/* Mensaje de ayuda o error */}
        {helperText && !hasError && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}

        {hasError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

InputEnhanced.displayName = "InputEnhanced"

export { InputEnhanced }
