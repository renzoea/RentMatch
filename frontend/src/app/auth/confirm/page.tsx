'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ConfirmPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {

    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">✅ Cuenta activada correctamente</h1>
      <p className="mt-2">En breve serás redirigido al inicio de sesión...</p>
    </div>
  )
}
