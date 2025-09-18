'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Leer token del hash (#access_token=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1) // quitar #
      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      if (!accessToken) {
        setErrorMsg("Token inválido o expirado")
      } else {
        setToken(accessToken)
      }
    }
  }, [])

  useEffect(() => {
    setPasswordMatch(newPassword === confirmPassword || confirmPassword === "")
  }, [newPassword, confirmPassword])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Restablecer Contraseña</h1>
        <p className="text-gray-600">Ingresa tu nueva contraseña</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <form  className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border-0 shadow-inner"
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
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-white border-0 shadow-inner ${!passwordMatch ? "border-red-500 border" : ""}`}
              required
            />
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg"
          >
            {loading ? "Procesando..." : "Restablecer Contraseña"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="text-gray-600 hover:text-gray-800 font-medium text-sm hover:underline">
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  )
}
