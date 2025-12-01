'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || type !== 'signup') {
          setStatus('error')
          setErrorMessage('Link de confirmación inválido')
          return
        }

        // Crear cliente de Supabase dentro del efecto
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Verificar el token con Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        })

        if (error) {
          console.error('Error confirmando email:', error)
          setStatus('error')
          setErrorMessage(error.message || 'Error al confirmar el email')
        } else {
          setStatus('success')
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        }
      } catch (err) {
        console.error('Error inesperado:', err)
        setStatus('error')
        setErrorMessage('Error inesperado al confirmar el email')
      }
    }

    confirmEmail()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Confirmando tu cuenta...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">❌ Error al activar cuenta</h1>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Ir al login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Cuenta activada correctamente</h1>
      <p className="mt-2 text-gray-600">En breve serás redirigido al inicio de sesión...</p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
