"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navbar from "@/components/navbar"
export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
  
    

          {/* Navigation */}
                <Navbar onNavigate={scrollToSection} />


     

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Encuentra tu hogar ideal de una forma <span className="text-orange-500">diferente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              RentMatch revoluciona el mercado de alquileres. Crea tu perfil de búsqueda y deja que los propietarios te
              encuentren a ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                Crear Perfil de Búsqueda →
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 px-8 py-3 text-lg bg-transparent">
                Soy propietario
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/hombre_inicio.png"
              alt="Hombre profesional sonriente haciendo gesto OK"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Crea tu perfil</h3>
                <p className="text-gray-600">
                  Publica tus preferencias de ubicación, presupuesto y características que buscas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Propietarios te encuentran</h3>
                <p className="text-gray-600">
                  Los propietarios buscan inquilinos según sus criterios y te contactan directamente
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestiona en la plataforma</h3>
                <p className="text-gray-600">
                  Desde el contrato hasta el depósito, todo gestionado de forma segura y transparente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona <span className="text-orange-500">RentMatch</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre el proceso revolucionario que pone al inquilino en el centro de la búsqueda de alquileres
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="relative p-6 border-2 border-orange-200">
              <CardContent className="pt-6">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Crea tu Perfil de Búsqueda</h3>
                <p className="text-gray-600 text-sm text-center">
                  Define exactamente qué buscas: presupuesto, zona preferida, características del inmueble y tus
                  preferencias personales.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative p-6 border-2 border-orange-200">
              <CardContent className="pt-6">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Propietarios te Contactan</h3>
                <p className="text-gray-600 text-sm text-center">
                  Los propietarios ven tu perfil y si su propiedad coincide con lo que buscas, te contactan
                  directamente.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative p-6 border-2 border-orange-200">
              <CardContent className="pt-6">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Contrato Digital Seguro</h3>
                <p className="text-gray-600 text-sm text-center">
                  Firma tu contrato de forma completamente digital con validez legal total, cumpliendo con el Código
                  Civil argentino.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="relative p-6 border-2 border-orange-200">
              <CardContent className="pt-6">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Depósito Protegido</h3>
                <p className="text-gray-600 text-sm text-center">
                  Tu depósito queda retenido de forma segura y se devuelve automáticamente al finalizar el contrato.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="text-lg font-bold text-orange-500">RentMatch</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 RentMatch. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
