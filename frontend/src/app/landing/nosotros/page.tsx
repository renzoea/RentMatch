"use client";

import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ShieldCheck, Zap, Heart } from "lucide-react";

export default function NosotrosPage() {
  const currentYear = new Date().getFullYear();
  
  // Función placeholder para el Navbar si es necesario
  function scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      
      {/* Fondo decorativo estático (Coherencia con las otras páginas) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-rose-300/15 via-orange-300/10 to-amber-200/10 blur-3xl" />
      </div>

      <Navbar onNavigate={scrollToSection} />

      {/* ===== HEADER / HERO (Estructura de "Manifiesto") ===== */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Zap className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"> {/* <-- Ajuste aquí */}
              Revolucionando el alquiler
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent block">
                con Matchmaking Inverso
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
              Somos RentMatch, una *startup* argentina nacida de la frustración para simplificar y humanizar el mercado de alquileres para todos.
            </p>
          </div>
        </div>
      </section>

      {/* ===== NUESTRA HISTORIA Y MÉTRICAS (Estructura Mejorada) ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            
            {/* COLUMNA 1-3: Historia (Mejor tipografía y estructura) */}
            <div className="lg:col-span-3">
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2 block">Nuestros Inicios</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Invertimos el juego del alquiler.</h2>
              
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  RentMatch nació en **2023** de la frustración ante la ineficiencia del sistema tradicional. Después de meses de visitas sin éxito, nos preguntamos: **&ldquo;¿Por qué no son los propietarios quienes encuentran a los inquilinos ideales?&rdquo;**
                </p>
                <blockquote className="border-l-4 border-orange-500 pl-4 py-1 italic font-semibold text-gray-900">
                  <p>
                    Creamos la primera plataforma donde los perfiles de inquilinos son el centro, permitiendo a los propietarios hacer *match* con precisión.
                  </p>
                </blockquote>
                <p>
                  Hoy, somos la solución predilecta de miles de usuarios en Argentina, conectando **propiedades con personas** de manera eficiente, segura y, lo más importante, justa.
                </p>
              </div>
            </div>

            {/* COLUMNA 4-5: Tarjeta de métricas (Diseño moderno) */}
            <div className="lg:col-span-2">
              <Card className="border-orange-200/50 ring-1 ring-orange-100/60 bg-white/95 shadow-2xl rounded-3xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Resultados</h3>
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Item 1 */}
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center shadow-sm">
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">5k+</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">Inquilinos Encontrados</p>
                  </div>
                  
                  {/* Item 2 */}
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center shadow-sm">
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">2k+</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">Propietarios Atendidos</p>
                  </div>

                  {/* Item 3 */}
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center shadow-sm">
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">15 días</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">Tiempo Promedio de Match</p>
                  </div>
                  
                  {/* Item 4 */}
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center shadow-sm">
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">98%</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">Índice de Satisfacción</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NUESTROS VALORES Y PRINCIPIOS (Diseño con Cards Elevadas) ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900">
              Pilares de
              <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                {" "}RentMatch
              </span>
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Los principios que guían cada decisión y el futuro que estamos construyendo.
            </p>
          </div>

          {/* Cards de Valores: 2x2 para ser más compactos y modernos */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {[
              { title: "Transparencia Total", Icon: Eye, desc: "Creemos en la información clara y sin letra chica, para construir confianza en cada match." },
              { title: "Innovación Tecnológica", Icon: Zap, desc: "Usamos la tecnología de matchmaking para hacer el proceso de alquiler más inteligente y rápido que nunca." },
              { title: "Seguridad y Confianza", Icon: ShieldCheck, desc: "Garantizamos perfiles verificados y contratos digitales legales para una transacción 100% segura." },
              { title: "Foco en el Usuario", Icon: Heart, desc: "La experiencia, tanto del inquilino como del propietario, es el centro de nuestro diseño y servicio." },
            ].map(({ title, Icon, desc }, index) => (
              <Card key={index} className="group h-full border-orange-200/50 ring-1 ring-orange-100/60 bg-white/95 shadow-lg rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="mb-4">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md ring-2 ring-orange-200 transition-transform duration-300 group-hover:scale-[1.03]">
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <p className="mt-3 text-gray-700 text-base">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* ===== Footer (Unificado) ===== */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">RentMatch</span>
            </div>
          <p className="text-gray-400 mt-2">
            © {currentYear} RentMatch. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}