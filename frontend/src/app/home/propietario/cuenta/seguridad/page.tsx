'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { MESSAGES } from '@/constants/messages';

export default function SeguridadPropietarioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requiredRole: 'propietario' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg(MESSAGES.PASSWORD.FILL_ALL_FIELDS);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(MESSAGES.PASSWORD.MISMATCH);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(MESSAGES.PASSWORD.TOO_SHORT);
      return;
    }

    setSavingPass(true);

    try {
      await api.post('/api/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccessMsg(MESSAGES.PASSWORD.UPDATE_SUCCESS);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMsg((error as { response?: { data?: { error?: string } } })?.response?.data?.error || MESSAGES.PASSWORD.UPDATE_ERROR);
    } finally {
      setSavingPass(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600">Gestiona tu información personal, verificación y seguridad</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 text-sm mb-4">
          <button
            className="text-gray-500 hover:text-gray-800 pb-1"
            onClick={() => router.push('/home/propietario/cuenta')}
          >
            Datos personales
          </button>
          <button
            className="text-gray-500 hover:text-gray-800 pb-1"
            onClick={() => router.push('/home/propietario/cuenta/verificacion')}
          >
            Verificación
          </button>
          <button className="text-orange-600 font-semibold border-b-2 border-orange-600 pb-1">
            Seguridad
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cambiar contraseña */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-extrabold text-gray-900">Cambiar contraseña</h2>
            </div>

            <form className="space-y-5" onSubmit={handleUpdatePassword}>
              <div className="space-y-2">
                <Label htmlFor="current">Contraseña actual *</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">Nueva contraseña *</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar nueva contraseña *</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingPass}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {savingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Actualizar contraseña
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
