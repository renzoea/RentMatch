'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { InputEnhanced } from "@/components/ui/input-enhanced"
import api from "@/lib/api"
import type { AxiosError } from "axios"
import Link from "next/link"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas"

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const res = await api.post("/api/auth/forgot-password", { email: data.email.trim().toLowerCase() })
      setSuccessMsg(res.data.message || "Correo enviado. Revisa tu bandeja.")
      reset()
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      setErrorMsg(error.response?.data?.error || "No se pudo enviar el correo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-orange-500">RentMatch</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
          <p className="text-gray-600">Te enviaremos un correo para restablecer tu contraseña</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <InputEnhanced
              label="Correo Electrónico"
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              disabled={loading}
              error={errors.email?.message}
              helperText="Ingresa el correo asociado a tu cuenta"
            />
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium rounded-lg disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar correo"}
          </Button>

          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-800 font-medium text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">© 2024 RentMatch</p>
      </div>
    </div>
  )
}