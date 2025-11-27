'use client'
import type { AxiosError } from "axios";
import Link from "next/link"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { InputEnhanced } from "@/components/ui/input-enhanced";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { Home, Building2, Key } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";

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
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      userType: "inquilino",
      acceptTerms: false,
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const userType = watch("userType");
  const passwordMatch = password === confirmPassword || confirmPassword === "";

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        full_name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: data.userType,
      });
      toast.success("¡Registro exitoso!", "Revisa tu correo para confirmar tu cuenta.");
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.log(err);
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

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* User Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">¿Qué tipo de usuario eres?</Label>
            <RadioGroup value={userType} onValueChange={(val) => setValue("userType", val as "inquilino" | "propietario")} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inquilino" id="inquilino" />
                <Label htmlFor="inquilino">Inquilino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="propietario" id="propietario" />
                <Label htmlFor="propietario">Propietario</Label>
              </div>
            </RadioGroup>
            {errors.userType && <p className="text-sm text-red-500 mt-1">{errors.userType.message}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputEnhanced
                id="firstName"
                type="text"
                placeholder="Nombre"
                {...register("firstName")}
                error={errors.firstName?.message}
                disabled={loading}
              />
            </div>
            <div>
              <InputEnhanced
                id="lastName"
                type="text"
                placeholder="Apellido"
                {...register("lastName")}
                error={errors.lastName?.message}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <InputEnhanced
              id="email"
              type="email"
              placeholder="Correo Electrónico"
              {...register("email")}
              error={errors.email?.message}
              disabled={loading}
            />
          </div>

          <div>
            <InputEnhanced
              id="phone"
              type="tel"
              placeholder="Teléfono (opcional)"
              {...register("phone")}
              error={errors.phone?.message}
              disabled={loading}
            />
          </div>

          <div>
            <InputEnhanced
              id="password"
              type="password"
              placeholder="Contraseña"
              {...register("password")}
              helperText="Mínimo 8 caracteres, una mayúscula y un número"
              error={errors.password?.message}
              disabled={loading}
            />
          </div>

          <div>
            <InputEnhanced
              id="confirmPassword"
              type="password"
              placeholder="Confirmar contraseña"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              success={passwordMatch && confirmPassword.length > 0}
              showValidation
              disabled={loading}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              {...register("acceptTerms")}
              disabled={loading}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                Acepto los <a href="#" className="underline">Términos y Condiciones</a> y la <a href="#" className="underline">Política de Privacidad</a>
              </Label>
              {errors.acceptTerms && <p className="text-sm text-red-500 mt-1">{errors.acceptTerms.message}</p>}
            </div>
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