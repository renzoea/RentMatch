"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Clock, Users, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"



export default function InquilinosPage() {
  function scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Ornaments suaves */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-rose-300/15 via-orange-300/10 to-amber-200/10 blur-3xl" />
      </div>

      <Navbar onNavigate={scrollToSection} />

      {/* ===== HERO (más espacio respecto al nav) ===== */}
      <section className="bg-white pt-28 md:pt-32 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 ring-1 ring-orange-200">
                <Sparkles className="h-4 w-4" /> Una forma distinta de alquilar
              </div>

              <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold leading-tight text-balance">
                Para{" "}
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Inquilinos
                </span>
              </h1>

              <p className="mt-5 text-lg lg:text-xl text-gray-600 text-pretty">
                Dejá de buscar propiedades. Creá tu perfil y que los propietarios te encuentren. Más rápido, eficiente y gratis.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button className="group h-12 rounded-2xl bg-orange-600 px-7 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl">
                    Crear Perfil Gratis
                    <span className="ml-1 inline-flex transition-transform group-hover:translate-x-1">→</span>
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Imagen — más grande + marco moderno */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex justify-center"
            >
              <div className="group relative">
                {/* glow sutil */}
                <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-orange-200/60 via-amber-200/40 to-white blur-2xl transition-opacity group-hover:opacity-90" />
                {/* frame glass */}
                <div className="rounded-[26px] bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 p-1 ring-1 ring-orange-100 shadow-[0_12px_36px_rgba(249,115,22,0.15)]">
                  <img
                    src="/images/joven_inquilino.jpg"
                    alt="Inquilino con laptop sonriendo"
                    className="h-auto w-full max-w-xl sm:max-w-2xl lg:max-w-[48rem] rounded-3xl border border-orange-100 ring-1 ring-orange-200/60 transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE (más moderno) ===== */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-orange-50/50">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-14 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold">¿Por qué elegir RentMatch?</h2>
      <p className="mt-3 text-lg text-gray-600">Ventajas exclusivas para inquilinos inteligentes.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
      {[
        { title: "Búsqueda Inteligente", desc: "Definí una vez lo que buscás y recibí solo opciones que matchean perfecto.", Icon: Search },
        { title: "Ahorra Tiempo", desc: "Nada de scrollear horas: los propietarios vienen a vos.", Icon: Clock },
        { title: "Sin Competencia", desc: "Cada contacto es exclusivo. Mostrate y cerrá más rápido.", Icon: Users },
        { title: "100% Seguro", desc: "Contratos digitales válidos + depósito protegido hasta el final.", Icon: Shield },
      ].map(({ title, desc, Icon }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="h-full"
        >
          <Card className="group h-full flex flex-col overflow-hidden rounded-3xl border-0 bg-white/90 shadow-sm ring-1 ring-orange-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-200">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/60 blur-xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            <CardContent className="flex-1 flex flex-col p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200">
                <Icon className="h-8 w-8 text-orange-600" />
              </div>

              <h3 className="text-xl font-semibold">{title}</h3>

              {/* El párrafo ocupa el espacio disponible para igualar alturas */}
              <p className="mt-2 text-sm text-gray-600 flex-1">
                {desc}
              </p>

              {/* La línea se queda pegada al borde inferior */}
              <div className="mx-auto mt-auto h-px w-14 origin-left scale-x-0 bg-gradient-to-r from-orange-400 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* ===== FAQ (pulido) ===== */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold">Preguntas frecuentes</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "¿Es realmente gratis para inquilinos?",
                a: "Sí, crear tu perfil y recibir contactos es completamente gratis. Solo pagás cuando firmás un contrato, con una tarifa única y accesible.",
              },
              {
                q: "¿Cuánto tiempo toma encontrar una propiedad?",
                a: "En promedio, los primeros contactos llegan en 48–72 horas y la mayoría encuentra su lugar ideal en 2–3 semanas.",
              },
              {
                q: "¿Los contratos son legalmente válidos?",
                a: "Absolutamente. Nuestros contratos digitales cumplen con el Código Civil y Comercial de la Nación y tienen plena validez legal.",
              },
            ].map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                value={`item-${i}`}
                className="rounded-2xl border border-orange-100 bg-white/90 px-6 ring-1 ring-orange-100/60 transition data-[state=open]:ring-orange-200"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-gray-600">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA final */}
          <div className="mt-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-1 shadow-lg">
              <div className="rounded-[22px] bg-white/95 p-6 md:p-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold">¿Listo para empezar?</h3>
                  <p className="mt-1 text-gray-600">Creá tu perfil y recibí propuestas que encajan con vos.</p>
                </div>
                <Link href="/auth/register">
                  <Button className="h-11 rounded-2xl bg-orange-600 px-7 text-white transition-all hover:-translate-y-0.5 hover:bg-orange-700">
                    Crear Perfil Gratis →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
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
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} RentMatch. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
