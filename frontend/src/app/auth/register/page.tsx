'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState("inquilino")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "confirmPassword" || field === "password") {
      const newPassword = field === "password" ? value : formData.password
      const newConfirmPassword = field === "confirmPassword" ? value : formData.confirmPassword
      setPasswordMatch(newPassword === newConfirmPassword || newConfirmPassword === "")
    }
  }

 

  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold text-orange-500">RentMatch</span>
      </div>

      <div className="bg-gray-200 rounded-2xl shadow-lg p-10 w-full max-w-lg">
        <h1 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Únete a RentMatch y encuentra tu hogar ideal
        </h1>

        {errorMsg && <p className="text-red-600 text-center mb-4">{errorMsg}</p>}

        <form  className="space-y-5">
          {/* User Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">¿Qué tipo de usuario eres?</Label>
            <RadioGroup value={userType} onValueChange={setUserType} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inquilino" id="inquilino" />
                <Label htmlFor="inquilino" className="text-sm text-gray-700 cursor-pointer">Inquilino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="propietario" id="propietario" />
                <Label htmlFor="propietario" className="text-sm text-gray-700 cursor-pointer">Propietario</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="nombre"
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              required
            />
            <Input
              id="apellido"
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => handleInputChange("apellido", e.target.value)}
              required
            />
          </div>

          <Input
            id="email"
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />

          <Input
            id="telefono"
            type="tel"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />

          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={!passwordMatch ? "border-red-500 border" : ""}
            required
          />

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
              Acepto los <a href="#" className="text-orange-500 hover:underline">Términos y Condiciones</a> y la <a href="#" className="text-orange-500 hover:underline">Política de Privacidad</a>
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>

          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">¿Ya tienes una cuenta? </span>
            <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline">Inicia sesión aquí</a>
          </div>
        </form>
      </div>
    </div>
  )
}
