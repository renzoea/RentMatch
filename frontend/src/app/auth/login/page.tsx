'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import api from "@/lib/api"
import { AxiosError } from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Building2, Key } from "lucide-react"

// ======================================================
// BG: Íconos flotando (casas, edificios, llaves)
// ======================================================
function FloatingBackground() {
  const items = [
    { Icon: Home, size: 26, left: "6%",  top: "12%", delay: 0.0, dur: 10 },
    { Icon: Building2, size: 22, left: "18%", top: "70%", delay: 0.4, dur: 12 },
    { Icon: Key, size: 20, left: "30%", top: "25%", delay: 0.8, dur: 11 },
    { Icon: Home, size: 18, left: "42%", top: "80%", delay: 1.2, dur: 13 },
    { Icon: Building2, size: 28, left: "55%", top: "18%", delay: 0.6, dur: 12 },
    { Icon: Key, size: 24, left: "66%", top: "65%", delay: 0.2, dur: 10 },
    { Icon: Home, size: 22, left: "78%", top: "35%", delay: 1.0, dur: 14 },
    { Icon: Building2, size: 20, left: "88%", top: "75%", delay: 1.4, dur: 11 },
    { Icon: Key, size: 18, left: "12%", top: "88%", delay: 1.6, dur: 13 },
    { Icon: Home, size: 20, left: "72%", top: "10%", delay: 1.8, dur: 12 },
    { Icon: Building2, size: 18, left: "38%", top: "8%", delay: 0.9, dur: 10 },
    { Icon: Key, size: 16, left: "90%", top: "22%", delay: 0.3, dur: 9 },
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
// Casa SVG (contiene el contenido que mostramos dentro)
// ======================================================
interface HouseSVGLoginFormProps {
  children: React.ReactNode
  isOpen: boolean
  isError: boolean
}

function HouseSVGLoginForm({ children, isOpen, isError }: HouseSVGLoginFormProps) {
  const houseWidth = 500
  const houseHeight = 630
  const roofHeight = 150
  const roofColor = "#f97316"
  const borderColor = "#000"
  const bodyColor = "#fff"
  const cornerRadius = 30

  const roofAnimation = {
    closed: { y: 0, opacity: 1 },
    open: { y: -roofHeight * 0.8, opacity: 0 },
  }

  return (
    <motion.div
      className="relative z-10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: houseWidth, height: houseHeight + roofHeight * 0.2 }}
    >
      {/* Casa visual */}
      <svg
        width={houseWidth}
        height={houseHeight + roofHeight * 0.2}
        viewBox={`0 0 ${houseWidth} ${houseHeight + roofHeight * 0.2}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{ overflow: "visible" }}
      >
        {/* Techo */}
        <motion.path
          d={`M0 ${roofHeight} L${houseWidth / 2} 0 L${houseWidth} ${roofHeight} H0 Z`}
          fill={roofColor}
          stroke={borderColor}
          strokeWidth="3"
          variants={roofAnimation}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.8 }}
          className="drop-shadow-lg"
        />
        {/* Chimenea */}
        <motion.rect
          x={houseWidth * 0.75}
          y={roofHeight * 0.3}
          width="40"
          height="60"
          fill={roofColor}
          stroke={borderColor}
          strokeWidth="3"
          variants={roofAnimation}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.8 }}
          className="drop-shadow-lg"
        />
        {/* Cuerpo borde */}
        <rect
          x="0"
          y={roofHeight - 1}
          width={houseWidth}
          height={houseHeight - roofHeight + 1}
          fill="none"
          rx={cornerRadius}
          ry={cornerRadius}
          stroke={borderColor}
          strokeWidth="3"
          className="drop-shadow-lg"
        />
      </svg>

      {/* Contenedor interior (contenido dinámico) */}
      <motion.div
        className="relative z-20 p-8 flex flex-col justify-center items-center"
        style={{
          width: houseWidth,
          height: houseHeight - roofHeight,
          marginTop: `${roofHeight}px`,
          borderRadius: cornerRadius,
          backgroundColor: isError ? "#FFF5F5" : bodyColor,
          border: "3px solid #000",
          boxShadow: "0 18px 24px rgba(0,0,0,0.12)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6 } }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ======================================================
// Puerta animada (abre con llave)
// ======================================================
function DoorUnlock({ onFinish }: { onFinish?: () => void }) {
  // tiempos core de la escena
  const keyApproach = 0.9
  const keyTurn = 0.4
  const doorOpen = 0.9

  useEffect(() => {
    const total = keyApproach + keyTurn + doorOpen + 0.3
    const t = setTimeout(() => onFinish?.(), total * 1000)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* contenedor con perspectiva para el giro 3D */}
      <div className="relative" style={{ perspective: 1000, width: 260, height: 380 }}>
        {/* marco */}
        <div className="absolute inset-0 rounded-2xl border-2 border-black" />
        {/* puerta */}
        <motion.div
          className="absolute inset-0 origin-left rounded-2xl border-2 border-black bg-orange-500"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 0, -65] }}
          transition={{ times: [0, (keyApproach + keyTurn) / (keyApproach + keyTurn + doorOpen), 1], duration: keyApproach + keyTurn + doorOpen, ease: "easeInOut" }}
        >
          {/* paneles simples */}
          <div className="absolute inset-6 rounded-xl bg-orange-400 border-2 border-black" />
          {/* cerradura / picaporte */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black"></div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-black rounded-sm"></div>
        </motion.div>

        {/* llave moviéndose y girando */}
        <motion.div
          className="absolute"
          initial={{ x: -160, y: 40, rotate: -25, opacity: 0 }}
          animate={{ x: 92, y: 40, rotate: 0, opacity: 1 }}
          transition={{ duration: keyApproach, ease: "easeOut" }}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 80 }}
            transition={{ delay: keyApproach - 0.1, duration: keyTurn, ease: "easeInOut" }}
          >
            <Key size={56} color="#111" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// ======================================================
// Página principal
// ======================================================
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsUnlocking(true) // dispara escena de puerta

    try {
      const response = await api.post("/api/auth/login", { email, password })
      const data = response.data
      // al terminar la escena de la puerta (DoorUnlock llama onFinish), pasamos a welcome y redirigimos
      const onFinish = () => {
        setIsUnlocking(false)
        setIsLoggedIn(true)
        setTimeout(() => {
          localStorage.setItem("access_token", data.access_token)
          localStorage.setItem("refresh_token", data.refresh_token)
          localStorage.setItem("expires_at", data.expires_at)
          localStorage.setItem("user", JSON.stringify(data.user))
          if (data.user.role === "inquilino") router.push("/home/inquilino")
          else if (data.user.role === "propietario") router.push("/home/propietario")
          else router.push("/")
        }, 1200)
      }
      // guardo callback en estado temporal via closure de DoorUnlock usando key en AnimatePresence
      setDoorFinish(() => onFinish)
    } catch (error: unknown) {
      setIsUnlocking(false)
      if (error instanceof AxiosError && error.response) setErrorMsg(error.response.data.error || "Error al iniciar sesión")
      else setErrorMsg("Error de conexión. Intenta nuevamente.")
    }
  }

  // hack simple para pasar onFinish dinámico a DoorUnlock dentro de AnimatePresence
  const [doorFinish, setDoorFinish] = useState<(() => void) | undefined>(undefined)
  const isError = useMemo(() => !!errorMsg, [errorMsg])

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* BG flotante */}
      <FloatingBackground />

      {/* Logo */}
      <div className="mb-8 flex items-center justify-center z-20">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-3 transform rotate-45 shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6 transform -rotate-45">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>
        <Link href="/">
          <span className="text-3xl font-extrabold text-orange-600 tracking-wider">RentMatch</span>
        </Link>
      </div>

      {/* Casa con contenido */}
      <HouseSVGLoginForm isOpen={isLoggedIn} isError={isError}>
        <AnimatePresence mode="wait">
          {/* Form */}
          {!isUnlocking && !isLoggedIn && (
            <motion.form
              key="form"
              className="space-y-4 w-full"
              onSubmit={handleLogin}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ingresa a tu Hogar</h1>
                <p className="text-gray-600">Accede a tu cuenta de RentMatch</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isUnlocking}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  className="w-full h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isUnlocking}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" disabled={isUnlocking} />
                  <label htmlFor="remember" className="text-sm text-gray-700">Recordarme</label>
                </div>
                <Link href="forgot_password" className="text-sm text-orange-500 hover:text-orange-600">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {isError && <p className="text-sm text-red-600 text-center font-medium">{errorMsg}</p>}

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all">
                Ingresar
              </Button>

              <div className="text-center mt-4">
                <span className="text-gray-600">¿No tienes una cuenta? </span>
                <Link href="register" className="text-orange-600 hover:text-orange-700 font-medium">Regístrate aquí</Link>
              </div>
            </motion.form>
          )}

          {/* Puerta + llave */}
          {isUnlocking && (
            <motion.div key="door" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoorUnlock onFinish={doorFinish} />
            </motion.div>
          )}

          {/* Bienvenida */}
          {isLoggedIn && (
            <motion.div
              key="welcome"
              className="flex flex-col items-center justify-center h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 text-center leading-tight drop-shadow">
                BIENVENIDO A <br /> RENTMATCH
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </HouseSVGLoginForm>

      {/* Footer */}
      <div className="mt-8 text-center z-20">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} RentMatch. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
