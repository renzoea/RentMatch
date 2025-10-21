'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export default function SeguridadInquilinoPage() {
  const router = useRouter();

  // Estado formulario
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // Privacidad
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) return alert('Completá todos los campos.');
    if (next !== confirm) return alert('Las contraseñas no coinciden.');
    setSavingPass(true);
    // TODO: Integrar con tu API (inquilino)
    setTimeout(() => {
      setSavingPass(false);
      setCurrent('');
      setNext('');
      setConfirm('');
      alert('Contraseña actualizada');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600">Gestioná tu información personal, verificación y seguridad</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 text-sm mb-4">
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/inquilino/cuenta')}
          >
            Datos personales
          </button>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/inquilino/cuenta/verificacion')}
          >
            Verificación
          </button>
          <span className="text-orange-600 font-semibold">Seguridad</span>
        </div>

        {/* Cambiar contraseña */}
        <Card className="mb-6 border border-gray-200">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-extrabold text-gray-900">Cambiar contraseña</h2>
            </div>

            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <div className="space-y-2">
                <Label htmlFor="current">Contraseña actual</Label>
                <Input
                  id="current"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">Nueva contraseña</Label>
                <Input
                  id="new"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={savingPass}
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                {savingPass ? 'Actualizando…' : 'Actualizar contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Configuración de Privacidad */}
        <Card className="border border-gray-200">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">
              Configuración de privacidad
            </h2>

            {/* Opción: Perfil público */}
            <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Perfil público</p>
                <p className="text-sm text-gray-600">
                  Permití que los propietarios vean tu perfil
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-colors relative">
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            {/* Opción: Notificaciones por email */}
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por email</p>
                <p className="text-sm text-gray-600">
                  Recibí notificaciones de nuevos contactos
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-colors relative">
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
