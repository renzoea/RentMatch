'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MiCuentaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: 'Eduardo',
    apellido: 'Gómez',
    email: 'eduardo.gomez@example.com',
    telefono: '+54 9 11 5678-9012',
  });
  const [saving, setSaving] = useState(false);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: integrar con tu API
    setTimeout(() => setSaving(false), 800);
  };

  const onDeleteAccount = () => {
    // TODO: modal de confirmación + llamada a API
    alert('Aquí iría la confirmación para eliminar tu cuenta.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal y verificación</p>
        </div>

        {/* Tabs (UI) */}
        <div className="flex items-center gap-8 text-sm mb-4">
          <button className="text-orange-600 font-semibold">Datos personales</button>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/propietario/cuenta/verificacion')}
          >
            Verificación
          </button>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => router.push('/home/propietario/cuenta/seguridad')}
          >
            Seguridad
          </button>
        </div>

        {/* Información personal */}
        <Card className="border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-extrabold text-gray-900">Información personal</h2>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={form.nombre} onChange={onChange('nombre')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={form.apellido} onChange={onChange('apellido')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="flex gap-2">
                  <Input id="email" type="email" value={form.email} onChange={onChange('email')} className="flex-1" />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 rounded-full bg-green-100 text-green-700 border border-green-300">
                    <ShieldCheck className="w-3 h-3" />
                    Verificado
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={form.telefono} onChange={onChange('telefono')} />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Eliminar cuenta */}
        <div className="rounded-xl border border-red-300/70 bg-red-50 p-5">
          <h3 className="text-xl font-extrabold text-red-600 mb-1">Eliminar cuenta</h3>
          <p className="text-gray-700 mb-3">
            Al eliminar tu cuenta, se borrarán todos tus datos personales y perfiles de búsqueda. Esta acción
            no se puede deshacer.
          </p>

          <Button
            variant="outline"
            className="bg-white text-red-600 hover:bg-red-50 border-red-300 shadow-sm"
            onClick={onDeleteAccount}
          >
            🗑️ Eliminar mi cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
