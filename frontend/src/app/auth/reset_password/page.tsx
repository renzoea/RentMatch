'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const at = params.get("access_token")
    const rt = params.get("refresh_token")
    const type = params.get("type")
    if (!at || !rt || type !== "recovery") {
      setErrorMsg("Link inválido o expirado.")
      return
    }
    setAccessToken(at)
    setRefreshToken(rt)
    ;(async () => {
      const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
      if (error) setErrorMsg("Sesión inválida: " + error.message)
      else setSessionReady(true)
    })()
  }, [])

  useEffect(() => {
    setPasswordMatch(newPassword === confirmPassword || confirmPassword === "")
  }, [newPassword, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    if (!sessionReady || !accessToken || !refreshToken) {
      setErrorMsg("Sesión de recuperación no lista.")
      return
    }
    if (!passwordMatch) {
      setErrorMsg("Las contraseñas no coinciden.")
      return
    }
    if (newPassword.length < 8) {
      setErrorMsg("Mínimo 8 caracteres.")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setErrorMsg(error.message || "No se pudo actualizar.")
    } else {
      setSuccessMsg("Contraseña actualizada.")
      setTimeout(() => router.push("/auth/login"), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo / Branding (igual estilo que otras páginas auth) */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3" aria-label="Logo RentMatch">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restablecer Contraseña</h1>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              disabled={!sessionReady || loading}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              className={!passwordMatch ? "border border-red-500" : ""}
              disabled={!sessionReady || loading}
              required
            />
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}

          <Button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium rounded-lg disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Restablecer Contraseña"}
          </Button>

          <div className="text-center mt-4">
            <a href="/auth/login" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">© 2024 RentMatch</p>
      </div>
    </div>
  )
}