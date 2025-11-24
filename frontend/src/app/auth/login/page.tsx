'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InputEnhanced } from "@/components/ui/input-enhanced"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"
import { AxiosError } from "axios"
import { motion } from "framer-motion"
import { Home, Building2, Key } from "lucide-react"

// ======================================================
// BG: Íconos flotando (casas, edificios, llaves)
// ======================================================
function FloatingBackground() {
  const items = [
    { Icon: Home, size: 26, left: "6%",  top: "12%", delay: 0.0, dur: 10 },
    { Icon: Building2, size: 22, left: "18%", top: "70%", delay: 0.1, dur: 12 },
    { Icon: Key, size: 20, left: "30%", top: "25%", delay: 0.15, dur: 11 },
    { Icon: Home, size: 18, left: "42%", top: "80%", delay: 0.2, dur: 13 },
    { Icon: Building2, size: 28, left: "55%", top: "18%", delay: 0.05, dur: 12 },
    { Icon: Key, size: 24, left: "66%", top: "65%", delay: 0.1, dur: 10 },
    { Icon: Home, size: 22, left: "78%", top: "35%", delay: 0.15, dur: 14 },
    { Icon: Building2, size: 20, left: "88%", top: "75%", delay: 0.2, dur: 11 },
    { Icon: Key, size: 18, left: "12%", top: "88%", delay: 0.25, dur: 13 },
    { Icon: Home, size: 20, left: "72%", top: "10%", delay: 0.15, dur: 12 },
    { Icon: Building2, size: 18, left: "38%", top: "8%", delay: 0.1, dur: 10 },
    { Icon: Key, size: 16, left: "90%", top: "22%", delay: 0.05, dur: 9 },
  ]

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map(({ Icon, size, left, top, delay, dur }, idx) => (
        <motion.div
          key={idx}
          style={{ position: "absolute", left, top }}
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          animate={{
            opacity: 0.25,
            y: [10, -10, 10],
            rotate: [0, 6, 0],
          }}
          transition={{
            delay,
            duration: dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} color="#f97316" />
        </motion.div>
      ))}
    </div>
  )
}

// ======================================================
// Página principal
// ======================================================
export default function LoginPage() {
  const toast = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post("/api/auth/login", { email, password })
      const data = response.data

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      localStorage.setItem("expires_at", data.expires_at)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast.success("¡Bienvenido!", "Inicio de sesión exitoso")

      if (data.user.role === "inquilino") router.push("/home/inquilino")
      else if (data.user.role === "propietario") router.push("/home/propietario")
      else router.push("/")
    } catch (error: unknown) {
      const errorMessage = error instanceof AxiosError && error.response
        ? error.response.data.error || "Error al iniciar sesión"
        : "Error de conexión. Intenta nuevamente."
      toast.error("Error al iniciar sesión", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* BG flotante */}
      <FloatingBackground />

      {/* Logo */}
      <div className="mb-8 flex items-center justify-center z-20">
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>
        <Link href="/">
          <span className="text-2xl font-bold text-orange-500">RentMatch</span>
        </Link>
      </div>

      {/* Form Card */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-lg z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ingresa a tu Hogar</h1>
          <p className="text-gray-600">Accede a tu cuenta de RentMatch</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <InputEnhanced
            label="Correo Electrónico"
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <InputEnhanced
            label="Contraseña"
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" disabled={loading} />
              <label htmlFor="remember" className="text-sm text-gray-700">Recordarme</label>
            </div>
            <Link href="forgot_password" className="text-sm text-orange-500 hover:text-orange-600">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full font-semibold py-3 rounded-xl shadow-lg"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>

          <div className="text-center mt-4">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <Link href="register" className="text-orange-600 hover:text-orange-700 font-medium">Regístrate aquí</Link>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-center z-20">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} RentMatch. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
