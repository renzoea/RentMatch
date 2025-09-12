"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Check password match in real time
    if (field === "confirmPassword" || field === "password") {
      const newPassword = field === "password" ? value : formData.password
      const newConfirmPassword = field === "confirmPassword" ? value : formData.confirmPassword
      setPasswordMatch(newPassword === newConfirmPassword || newConfirmPassword === "")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (!formData.acceptTerms) {
      alert("Debes aceptar los términos y condiciones")
      return
    }

    const registrationData = {
      userType,
      ...formData,
    }

    console.log("Datos del registro:", registrationData)
    alert("¡Cuenta creada exitosamente!")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-3 relative">
            {/* House icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-10 h-10">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            <span className="absolute bottom-2 right-3 text-gray-900 text-lg font-bold">$</span>
          </div>
          <span className="text-2xl font-bold text-orange-500">RentMatch</span>
        </div>
      </div>

      {/* Register Form */}
      <div className="bg-gray-200 rounded-2xl shadow-lg p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Únete a RentMatch y encuentra tu hogar ideal</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Selection */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">¿Qué tipo de usuario eres?</Label>
            <RadioGroup value={userType} onValueChange={setUserType} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inquilino" id="inquilino" />
                <Label htmlFor="inquilino" className="text-sm text-gray-700 cursor-pointer">
                  Inquilino
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="propietario" id="propietario" />
                <Label htmlFor="propietario" className="text-sm text-gray-700 cursor-pointer">
                  Propietario
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full bg-white border-0 shadow-inner"
                required
              />
            </div>
            <div>
              <Label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="w-full bg-white border-0 shadow-inner"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full bg-white border-0 shadow-inner"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              className="w-full bg-white border-0 shadow-inner"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full bg-white border-0 shadow-inner"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={`w-full bg-white border-0 shadow-inner ${!passwordMatch ? "border-red-500 border" : ""}`}
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
              Acepto los{" "}
              <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline">
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline">
                Política de Privacidad
              </a>
            </Label>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
          >
            Crear cuenta
          </Button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">¿Ya tienes una cuenta? </span>
            <a href="login" className="text-orange-500 hover:text-orange-600 font-medium text-sm hover:underline">
              Inicia sesión aquí
            </a>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-xs">© 2025 RentMatch. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
