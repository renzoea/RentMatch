"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Link from "next/link"

import { Check, Lock, Search, User2, Building2 } from "lucide-react";

export default function LandingPage() {
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ===== Background ornaments ===== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-400/25 via-orange-300/20 to-yellow-300/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-rose-300/20 via-orange-400/15 to-amber-300/10 blur-3xl" />
      </div>

      {/* ===== Navbar ===== */}
      <Navbar onNavigate={scrollToSection} />

      {/* ===== Hero ===== */}
     <section className="relative">
  <div className="mx-auto max-w-7xl px-4 pt-20 pb-14 sm:pt-24">
    <div className="grid items-center gap-10 lg:grid-cols-2">
      {/* copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="order-2 lg:order-1"
      >
        <h1 className="mt-3 text-pretty text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Encontrá tu hogar ideal de una forma{" "}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            diferente
          </span>
        </h1>

        <p className="mt-5 text-xl leading-relaxed text-gray-600">
          RentMatch revoluciona el mercado de alquileres. Creá tu perfil de búsqueda y dejá que los propietarios
          te encuentren a vos.
        </p>

       <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
  {/* Registrarse (crear perfil) */}
  <Link href="/auth/register">
    <Button
      aria-label="Crear perfil de búsqueda (registrarse)"
      className="group relative h-12 w-full gap-2 overflow-hidden rounded-2xl bg-orange-500 px-6 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl active:translate-y-0 sm:w-auto"
    >
      Crear Perfil de Búsqueda
      <span className="ml-1 inline-flex translate-x-0 transition-transform group-hover:translate-x-1">→</span>
    </Button>
  </Link>

  {/* Iniciar sesión */}
  <Link href="/auth/login">
    <Button
      variant="outline"
      aria-label="Iniciar sesión"
      className="h-12 w-full rounded-2xl border-orange-200 bg-white px-6 text-base font-semibold text-gray-800 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 sm:w-auto"
    >
      Soy propietario
    </Button>
  </Link>
</div>


        {/* trust row */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" /> Verificación de identidad
          </div>
          <div className="hidden h-4 w-px bg-gray-200 sm:block" />
          <div className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-700" /> Depósito en escrow protegido
          </div>
        </div>
      </motion.div>

      {/* image (dejá tu versión grande actual) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="order-1 flex justify-center lg:order-2"
      >
        <div className="group relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-orange-200/60 via-amber-200/40 to-white blur-2xl transition-opacity group-hover:opacity-90" />
          <img
            src="/images/foto-home.jpg"
            alt="Hombre profesional sonriente haciendo gesto OK"
            className="h-auto w-full max-w-xl sm:max-w-2xl lg:max-w-[48rem] xl:max-w-[56rem] rounded-3xl border border-orange-100 shadow-[0_10px_30px_rgba(249,115,22,0.25)]"
            loading="eager"
            decoding="async"
          />
        </div>
      </motion.div>
    </div>
  </div>

  {/* subtle divider */}
  <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-orange-200/70 to-transparent" />
</section>



      {/* ===== Features (modern glass + subtle glow) ===== */}
      <section className="bg-gradient-to-b from-white to-orange-50/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Creá tu perfil",
                desc: "Publicá tus preferencias de ubicación, presupuesto y características que buscás.",
                Icon: User2,
              },
              {
                title: "Propietarios te encuentran",
                desc: "Los propietarios buscan inquilinos según sus criterios y te contactan directo.",
                Icon: Search,
              },
              {
                title: "Gestioná en la plataforma",
                desc: "Desde el contrato al depósito, todo seguro y transparente en un sólo lugar.",
                Icon: Building2,
              },
            ].map(({ title, desc, Icon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white/80 shadow-sm ring-1 ring-orange-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-200">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/60 blur-xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  <CardContent className="relative p-7">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="mb-2 text-center text-xl font-semibold">{title}</h3>
                    <p className="text-center text-gray-600">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works (numbers visible) ===== */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-4xl font-bold leading-tight">
              ¿Cómo funciona <span className="text-orange-600">RentMatch</span>?
            </h2>
            <p className="mt-4 text-lg text-gray-600">El proceso que pone al inquilino en el centro de la búsqueda.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: 1,
                title: "Creá tu Perfil de Búsqueda",
                desc: "Definí presupuesto, zonas preferidas, amenities e intereses para matchear mejor.",
                icon: Search,
              },
              {
                n: 2,
                title: "Propietarios te contactan",
                desc: "Si su propiedad calza con lo que buscás, coordinan visitas sin vueltas ni intermediarios.",
                icon: User2,
              },
              {
                n: 3,
                title: "Contrato digital seguro",
                desc: "Firmá 100% online con validez legal. Seguimiento de estados y notificaciones.",
                icon: Building2,
              },
              {
                n: 4,
                title: "Depósito protegido",
                desc: "Escrow con liberación automática al finalizar, auditorías y resolución de incidentes.",
                icon: Lock,
              },
            ].map(({ n, title, desc, icon: Icon }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card className="group relative overflow-hidden rounded-3xl border border-orange-100/80 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                  {/* badge visible dentro del card */}
                  <div
                    className="absolute top-3 left-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full
                               bg-orange-600 text-xs font-bold text-white shadow-md ring-2 ring-white/90 transition-transform group-hover:scale-105"
                    aria-hidden
                  >
                    {String(n).padStart(2, "")}
                  </div>

                  {/* halo sutil */}
                  <div className="pointer-events-none absolute -inset-px rounded-3xl ring-1 ring-orange-200/60" />

                  <CardContent className="relative p-6 pt-12">
                    <div className="mt-2 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200">
                        <Icon className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-center text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-center text-sm text-gray-600">{desc}</p>

                    {/* underline on hover */}
                    <div className="mx-auto mt-4 h-px w-14 origin-left scale-x-0 bg-gradient-to-r from-orange-400 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA strip ===== */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-1 shadow-lg">
            <div className="rounded-[22px] bg-white/95 p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">¿Listo para dar el primer paso?</h3>
                  <p className="mt-1 text-gray-600">Creá tu perfil, recibí propuestas y decidí con datos y seguridad.</p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link href="/auth/register">
                  <Button className="group h-11 w-full rounded-2xl bg-orange-600 px-6 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-700 sm:w-auto">
                    Empezar ahora
                    <span className="ml-1 inline-flex transition-transform group-hover:translate-x-1">→</span>
                  </Button>
                  </Link>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-gradient-to-b from-orange-50/60 to-white py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="text-lg font-bold text-orange-600">RentMatch</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} RentMatch. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
