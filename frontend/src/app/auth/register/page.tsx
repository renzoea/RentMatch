'use client'
import type { AxiosError } from "axios";
import Link from "next/link"
import { useState } from "react";
import api from "@/lib/api";
import { InputEnhanced } from "@/components/ui/input-enhanced";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { Home, Building2, Key } from "lucide-react";
import { validatePassword, validatePhone, validateEmail, validateName } from "@/lib/validations";

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

export default function RegisterPage() {
  const toast = useToast();
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

    // Validar nombre
    const nombreError = validateName(formData.nombre, "El nombre");
    if (nombreError) {
      toast.error("Nombre inválido", nombreError);
      return;
    }

    // Validar apellido
    const apellidoError = validateName(formData.apellido, "El apellido");
    if (apellidoError) {
      toast.error("Apellido inválido", apellidoError);
      return;
    }

    // Validar email
    const cleanEmail = formData.email.trim().toLowerCase();
    const emailError = validateEmail(cleanEmail);
    if (emailError) {
      toast.error("Email inválido", emailError);
      return;
    }

    // Validar teléfono
    const phoneError = validatePhone(formData.telefono);
    if (phoneError) {
      toast.error("Teléfono inválido", phoneError);
      return;
    }

    // Validar contraseña
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error("Contraseña débil", passwordError);
      return;
    }

    if (!passwordMatch) {
      toast.error("Contraseñas no coinciden", "Las contraseñas ingresadas deben ser iguales.");
      return;
    }
    if (!formData.acceptTerms) {
      toast.warning("Acepta los términos", "Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        full_name: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        email: cleanEmail,
        password: formData.password,
        phone: formData.telefono,
        role: userType,
      });
      toast.success("¡Registro exitoso!", "Revisa tu correo para confirmar tu cuenta.");
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
      toast.error("Error al registrar", err.response?.data?.error || "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-lg z-20">
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
            <InputEnhanced
              id="nombre"
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              required
            />
            <InputEnhanced
              id="apellido"
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => handleInputChange("apellido", e.target.value)}
              required
            />
          </div>

          <InputEnhanced
            id="email"
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />

          <InputEnhanced
            id="telefono"
            type="tel"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            required
          />

          <InputEnhanced
            id="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            helperText="Mínimo 8 caracteres, una mayúscula y un número"
            required
          />

          <InputEnhanced
            id="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            error={!passwordMatch && formData.confirmPassword ? "Las contraseñas no coinciden" : undefined}
            success={passwordMatch && formData.confirmPassword.length > 0}
            showValidation
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

          <Button variant="primary" type="submit" className="w-full font-semibold py-3" disabled={loading}>
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