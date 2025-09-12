import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-orange-500">RentMatch</span>
        </div>
      </div>

      {/* Forgot Password Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
          <p className="text-gray-600">Te enviaremos un código de verificación a tu correo</p>
        </div>

        <form className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <Input id="email" type="email" placeholder="tu@email.com" className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Ingresa el correo asociado a tu cuenta de RentMatch</p>
          </div>

          {/* Send Code Button */}
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg"
          >
            Enviar Código
          </Button>

          {/* Back to Login Link */}
          <div className="text-center mt-4">
            <a href="/" className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">© 2024 RentMatch. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
