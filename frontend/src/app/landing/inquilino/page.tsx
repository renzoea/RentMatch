"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Clock, Users, Shield } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
export default function InquilinosPage() {
    function scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     

            {/* Navigation */}
               <Navbar onNavigate={scrollToSection} />



      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 text-balance">
                Para <span className="text-orange-500">Inquilinos</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 text-pretty">
                Deja de buscar propiedades. Crea tu perfil y que los propietarios te encuentren a ti. Es más rápido, más
                eficiente y completamente gratis.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                Crear Perfil Gratis →
              </Button>
            </div>
            <div className="flex justify-center">
              <img src="/images/hombre_casa.png" alt="Inquilino con laptop" className="max-w-md w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RentMatch Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir RentMatch?</h2>
            <p className="text-xl text-gray-600">Ventajas exclusivas para inquilinos inteligentes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Búsqueda Inteligente */}
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Búsqueda Inteligente</h3>
                <p className="text-gray-600 text-sm">
                  Define una vez lo que buscas y recibe solo opciones que coinciden exactamente.
                </p>
              </CardContent>
            </Card>

            {/* Ahorra Tiempo */}
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ahorra Tiempo</h3>
                <p className="text-gray-600 text-sm">
                  No más horas navegando portales. Los propietarios vienen a ti con opciones relevantes.
                </p>
              </CardContent>
            </Card>

            {/* Sin Competencia */}
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sin Competencia</h3>
                <p className="text-gray-600 text-sm">
                  No compitas con otros inquilinos. Cada contacto es exclusivo para ti.
                </p>
              </CardContent>
            </Card>

            {/* 100% Seguro */}
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">100% Seguro</h3>
                <p className="text-gray-600 text-sm">
                  Contratos digitales legales y depósito protegido hasta el final del alquiler.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                ¿Es realmente gratis para inquilinos?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Sí, crear tu perfil y recibir contactos es completamente gratis. Solo pagas cuando firmas un contrato, y
                es una tarifa única muy accesible.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                ¿Cuánto tiempo toma encontrar una propiedad?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                En promedio, nuestros usuarios reciben los primeros contactos en 48-72 horas y encuentran su lugar ideal
                en 2-3 semanas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                ¿Los contratos son legalmente válidos?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Absolutamente. Nuestros contratos digitales cumplen con el Código Civil y Comercial de la Nación y
                tienen la misma validez legal que un contrato tradicional.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">RentMatch</span>
            </div>
            <p className="text-gray-600 text-sm">© 2025 RentMatch. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
