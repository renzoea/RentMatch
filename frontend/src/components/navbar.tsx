"use client"

import { Button } from "@/components/ui/button"

interface NavbarProps {
  onNavigate?: (sectionId: string) => void
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-xl font-bold text-orange-500">RentMatch</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-orange-500">
            Inicio
          </a>
          <button onClick={() => handleNavClick("como-funciona")} className="text-gray-700 hover:text-orange-500">
            ¿Cómo funciona?
          </button>
          <a href="landing/inquilino" className="text-gray-700 hover:text-orange-500">
            Para inquilinos
          </a>
          <a href="landing/propietario" className="text-gray-700 hover:text-orange-500">
            Para propietarios
          </a>
          <a href="landing/contacto" className="text-gray-700 hover:text-orange-500">
            Contacto
          </a>
          <a href="landing/nosotros" className="text-gray-700 hover:text-orange-500">
            Nosotros
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="text-gray-700 hover:text-orange-500">
            Iniciar sesión
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Registrarse</Button>
        </div>
      </div>
    </header>
  )
}
