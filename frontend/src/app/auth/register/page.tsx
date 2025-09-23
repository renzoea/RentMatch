'use client'
import type { AxiosError } from "axios";
import Link from "next/link"
import { useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RegisterPage() {
  const [userType, setUserType] = useState("inquilino");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "confirmPassword" || field === "password") {
      const newPassword = field === "password" ? value : formData.password;
      const newConfirmPassword = field === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(newPassword === newConfirmPassword || newConfirmPassword === "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!passwordMatch) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (!formData.acceptTerms) {
      setErrorMsg("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: `${formData.nombre} ${formData.apellido}`,
        email: formData.email,
        password: formData.password,
        phone: formData.telefono,
        role: userType,
      });
      setSuccessMsg("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      });
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.log(err);
      setErrorMsg(err.response?.data?.error || "Error al registrar.");
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/">          <span className="text-2xl font-bold text-orange-500">RentMatch</span>
          </Link>
        </div>

      </div>


      <div className=" rounded-2xl shadow-lg p-10 w-full max-w-lg">
        <h1 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Únete a RentMatch y encuentra tu hogar ideal
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* User Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">¿Qué tipo de usuario eres?</Label>
            <RadioGroup value={userType} onValueChange={setUserType} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inquilino" id="inquilino" />
                <Label htmlFor="inquilino">Inquilino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="propietario" id="propietario" />
                <Label htmlFor="propietario">Propietario</Label>
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
              Acepto los <a href="#" className="underline">Términos y Condiciones</a> y la <a href="#" className="underline">Política de Privacidad</a>
            </Label>
          </div>

          {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
          {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>

          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">¿Ya tienes una cuenta? </span>
            <a href="/auth/login" className="text-orange-500 underline text-sm">Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  );
}