import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, Search, Heart, CheckCircle } from "lucide-react"
import Navbar from "@/components/navbar"

export default function PropietariosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
                   <Navbar />


      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Para <span className="text-orange-500">Propietarios</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Encuentra inquilinos ideales más rápido. Accede a perfiles pre-calificados que coinciden con tu
                propiedad disponible.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                Buscar Inquilinos →
              </Button>
            </div>
            <div className="flex justify-center">
              <img src="/images/mujer_propietario.png" alt="Propietaria sonriente" className="w-full max-w-md h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RentMatch Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir RentMatch?</h2>
            <p className="text-xl text-gray-600">Ventajas exclusivas para propietarios inteligentes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Inquilinos Verificados */}
            <Card className="text-center p-6 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Inquilinos Verificados</h3>
                <p className="text-gray-600">
                  Accede a perfiles completos con información sobre ingresos y referencias
                </p>
              </CardContent>
            </Card>

            {/* Menos Tiempo Perdido */}
            <Card className="text-center p-6 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Menos Tiempo Perdido</h3>
                <p className="text-gray-600">
                  Reduce el tiempo de tu propiedad vacía con nuestro sistema de matching inteligente
                </p>
              </CardContent>
            </Card>

            {/* Inquilinos que Buscan */}
            <Card className="text-center p-6 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Inquilinos que Buscan</h3>
                <p className="text-gray-600">Los perfiles que ves ya están buscando algo como lo que ofreces</p>
              </CardContent>
            </Card>

            {/* Contratos Seguros */}
            <Card className="text-center p-6 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contratos Seguros</h3>
                <p className="text-gray-600">Sistema de contratos digitales y gestión automática de depósitos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="p-6 border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Define tu Búsqueda</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Establece criterios como ubicación deseada, precio, tipo, características específicas
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Filtros profesionales ajustables</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Descripción detallada</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Sistema de selección</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Explora Perfiles Coincidentes</h3>
                </div>
                <p className="text-gray-600 mb-4">Revisa inquilinos pre-seleccionados que tienes para ofrecer</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Perfiles verificados</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Información financiera validada</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cierra el Trato</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Utiliza nuestro sistema de contratos digitales para formalizar el alquiler
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Contrato legalmente válido</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Gestión automática de depósitos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Panel de control completo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    4
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Contacta Directamente</h3>
                </div>
                <p className="text-gray-600 mb-4">Habla directamente con los inquilinos que más te interesen</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Comunicación directa</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Programación de visitas</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Sin comisión de intermediarios</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 RentMatch. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
