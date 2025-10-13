"use client";

import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Clock, Smile, Target, Eye, ShieldCheck } from "lucide-react";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="text-gray-900">Sobre </span>
              <span className="text-orange-500">RentMatch</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Somos una startup argentina que está revolucionando el mercado de alquileres, poniendo la tecnología al servicio de inquilinos y propietarios.
            </p>
          </div>

          {/* Nuestra Historia + Métricas */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Historia (2 cols) */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-extrabold text-gray-900">Nuestra Historia</h2>
              <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
                <p>
                  RentMatch nació en 2023 de la frustración de dos amigos que pasaron meses buscando departamento en Buenos Aires.
                  Después de visitar decenas de propiedades y competir con otros inquilinos, nos preguntamos:
                </p>
                <p className="font-semibold italic text-gray-900">
                  “¿Por qué no pueden los propietarios encontrarnos a nosotros?”
                </p>
                <p>
                  Así surgió la idea de invertir el proceso tradicional. En lugar de que los inquilinos busquen propiedades,
                  creamos una plataforma donde los inquilinos crean perfiles detallados y los propietarios los encuentran.
                </p>
                <p>
                  Desde entonces, hemos ayudado a más de <span className="font-semibold">5,000 inquilinos</span> a
                  encontrar su hogar ideal y a <span className="font-semibold">2,000 propietarios</span> a reducir el tiempo
                  de sus propiedades vacías.
                </p>
              </div>
            </div>

            {/* Tarjeta de métricas */}
            <Card className="border border-orange-200 bg-orange-50/60">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-xl border border-orange-100 bg-white p-4">
                    <p className="text-3xl font-extrabold text-orange-500">5,000+</p>
                    <p className="text-sm text-gray-600">Inquilinos Satisfechos</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-white p-4">
                    <p className="text-3xl font-extrabold text-orange-500">2,000+</p>
                    <p className="text-sm text-gray-600">Propietarios Satisfechos</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-white p-4">
                    <p className="text-3xl font-extrabold text-orange-500">15 días</p>
                    <p className="text-sm text-gray-600">Tiempo promedio de búsqueda</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-white p-4">
                    <p className="text-3xl font-extrabold text-orange-500">98%</p>
                    <p className="text-sm text-gray-600">Satisfacción del usuario</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Nuestros Valores</h2>
            <p className="mt-3 text-gray-600">
              Los principios que guían cada decisión que tomamos
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Misión */}
            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Target className="h-5 w-5 text-orange-500" />
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">Misión</h3>
                </div>
                <p className="mt-3 text-gray-700">
                  Simplificar y humanizar el proceso de alquiler, conectando a inquilinos y propietarios de manera eficiente y transparente.
                </p>
              </CardContent>
            </Card>

            {/* Visión */}
            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Eye className="h-5 w-5 text-orange-500" />
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">Visión</h3>
                </div>
                <p className="mt-3 text-gray-700">
                  Ser la plataforma líder de alquileres en Argentina, transformando la manera en que las personas encuentran su hogar.
                </p>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">Valores</h3>
                </div>
                <p className="mt-3 text-gray-700">
                  Transparencia, innovación, confianza y compromiso con la experiencia del usuario en cada interacción.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RentMatch. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
