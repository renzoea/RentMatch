"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, CheckCircle, Lightbulb, TrendingUp, Handshake } from "lucide-react"
import Navbar from "@/components/navbar" // Asumo que `Navbar` acepta `onNavigate` si la quieres igual que en Inquilinos.

/* Variantes para las animaciones (basadas en tu código de Inquilinos) */
const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
}

const itemFade = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.4 },
}

export default function PropietariosPage() {
  const year = useMemo(() => new Date().getFullYear(), [])

  // Esta función es necesaria para que el Navbar funcione si lo usa para anclas.
  function scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      
      {/* Fondo decorativo (coherente con InquilinosPage) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-rose-300/15 via-orange-300/10 to-amber-200/10 blur-3xl" />
      </div>

      <Navbar onNavigate={scrollToSection} />

      {/* ===== HERO ===== */}
      <section className="bg-white pt-40 md:pt-44 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Texto */}
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 ring-1 ring-orange-200">
                <Lightbulb className="h-4 w-4" /> Alquiler optimizado
              </div>

              <h1 className="mt-4 text-[2.7rem] leading-tight sm:text-5xl lg:text-[3.7rem] font-extrabold text-balance">
                Para{" "}
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Propietarios
                </span>
              </h1>

              <p className="mt-5 text-lg lg:text-xl text-gray-600 text-pretty">
                Tu propiedad merece el inquilino ideal. En RentMatch, ellos te encuentran,
                garantizando seguridad y reduciendo el tiempo de vacancia.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button className="group h-12 rounded-2xl bg-orange-600 px-7 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl">
                    Publicar Propiedad Gratis
                    <span className="ml-1 inline-flex transition-transform group-hover:translate-x-1">→</span>
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Imagen – marco moderno (coherente con InquilinosPage) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex justify-center"
            >
              <div className="group relative">
                <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-orange-200/60 via-amber-200/40 to-white blur-2xl transition-opacity group-hover:opacity-90" />
                <div className="rounded-[26px] bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 p-1 ring-1 ring-orange-100 shadow-[0_12px_36px_rgba(249,115,22,0.15)]">
                  <Image
                    src="/images/propietario2.jpg"
                    alt="Propietaria con tablet sonriendo"
                    width={768}
                    height={512}
                    className="h-auto w-full max-w-xl sm:max-w-2xl lg:max-w-[48rem] rounded-3xl border border-orange-100 ring-1 ring-orange-200/60 transition-transform duration-300 group-hover:scale-[1.01]"
                    priority
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE (Ventajas) ===== */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-orange-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0 }}>
            <div className="mb-14 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold">La manera inteligente de alquilar</h2>
              <p className="mt-3 text-lg text-gray-600">Ventajas clave al usar RentMatch como propietario.</p>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { title: "Verificación Avanzada", desc: "Accede a perfiles con ingresos y referencias validadas antes de contactar.", Icon: Shield },
              { title: "Cero Vacancia", desc: "Nuestro matching reduce drásticamente el tiempo que tu propiedad está vacía.", Icon: Clock },
              { title: "Ofertas Dirigidas", desc: "Solo recibes el contacto de inquilinos que buscan exactamente lo que ofreces.", Icon: TrendingUp },
              { title: "Contratos Legales", desc: "Sistema de contratos digitales con validez legal y gestión de depósitos.", Icon: Handshake },
            ].map(({ title, desc, Icon }) => (
              <motion.div key={title} variants={itemFade}>
                <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/90 shadow-sm ring-1 ring-orange-100 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-orange-200">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/60 blur-xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{desc}</p>
                    <div className="mx-auto mt-5 h-px w-14 origin-left scale-x-0 bg-gradient-to-r from-orange-400 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PROCESS STEPS (Cómo funciona) ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0 }}>
            <div className="mb-14 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold">Nuestro Proceso Simplificado</h2>
              <p className="mt-3 text-lg text-gray-600">Encuentra a tu inquilino ideal en solo 4 pasos.</p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                title: "Publica tu Propiedad",
                desc: "Detalla tu inmueble y define el perfil de inquilino que deseas.",
                features: ["Filtros profesionales ajustables", "Descripción detallada", "Sistema de selección"],
              },
              {
                title: "Recibe Matchings",
                desc: "Te presentamos inquilinos con perfiles verificados que coinciden 100% con tu oferta.",
                features: ["Perfiles verificados", "Información financiera validada"],
              },
              {
                title: "Contacta & Visita",
                desc: "Toma contacto directo con el inquilino que elijas y programa la visita.",
                features: ["Comunicación directa y segura", "Programación de visitas eficiente", "Sin comisión de intermediarios"],
              },
              {
                title: "Cierra el Trato",
                desc: "Formaliza el alquiler usando nuestros contratos digitales y gestión de depósitos.",
                features: ["Contrato legalmente válido", "Gestión automática de depósitos", "Panel de control completo"],
              },
            ].map(({ title, desc, features }, i) => (
              <motion.div key={title} variants={itemFade}>
                <Card className="group h-full rounded-3xl p-6 border-orange-100 ring-1 ring-orange-100/70 shadow-sm transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg mr-4 shadow-md">
                        {i + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{desc}</p>
                    <div className="space-y-2 pt-2 border-t border-orange-50/50">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700 ml-2">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA Final (Estilo inquilinos) ===== */}
      <section className="pb-16 lg:pb-20 pt-8 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.05 }}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-1 shadow-lg">
              <div className="rounded-[22px] bg-white/95 p-6 md:p-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold">¿Listo para encontrar tu inquilino perfecto?</h3>
                  <p className="mt-1 text-gray-600">Publica tu propiedad y accede a perfiles verificados hoy mismo.</p>
                </div>
                <Link href="/auth/register">
                  <Button className="h-11 rounded-2xl bg-orange-600 px-7 text-white transition-all hover:-translate-y-0.5 hover:bg-orange-700 shadow-md">
                    Empezar a Publicar →
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer (Estilo inquilinos) */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span className="text-lg font-bold">RentMatch</span>
            </div>
            <p className="text-sm text-gray-600">© {year} RentMatch. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}