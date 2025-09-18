
'use client' // <--- 1. Importante: Convertir a Client Component

import { useState } from "react" // <--- 2. Importar hooks de React
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client" // <--- 4. Importar el cliente de Supabase (Paso 1 anterior)

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  // --- 5. Estados para manejar los inputs y errores ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
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

      {/* Login Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
          <p className="text-gray-600">Accede a tu cuenta de RentMatch</p>
        </div>

        {/* --- 7. Conectar el <form> a la función handleLogin --- */}
        <form className="space-y-4" >
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="w-full"
              value={email} // <--- 8. Conectar estado
              onChange={(e) => setEmail(e.target.value)} // <--- 9. Actualizar estado
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              className="w-full"
              value={password} // <--- 10. Conectar estado
              onChange={(e) => setPassword(e.target.value)} // <--- 11. Actualizar estado
              required
            />
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Recordarme
              </label>
            </div>
            <a href="forgot_password" className="text-sm text-orange-500 hover:text-orange-600">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* --- 12. Mostrar error si existe --- */}
          {errorMsg && (
            <p className="text-sm text-red-600 text-center">{errorMsg}</p>
          )}

          {/* Login Button */}
          <Button
            type="submit" // <--- 13. Asegurarse que el tipo es "submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg"
          >
            Ingresar
          </Button>

          {/* Register Link */}
          <div className="text-center mt-4">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <a href="register" className="text-orange-500 hover:text-orange-600 font-medium">
              Regístrate aquí
            </a>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">© 2024 RentMatch. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}