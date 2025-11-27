'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card-standard';
import { Label } from '@/components/ui/label';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { MESSAGES } from '@/constants/messages';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/schemas';

export default function SeguridadPropietarioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requiredRole: 'propietario' });
  const toast = useToast();

  const [savingPass, setSavingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');
  const passwordMatch = newPassword === confirmPassword || confirmPassword === '';

  const onSubmit = async (data: ChangePasswordFormData) => {
    setSuccessMsg('');
    setErrorMsg('');
    setSavingPass(true);

    try {
      await api.post('/api/users/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });

      setSuccessMsg(MESSAGES.PASSWORD.UPDATE_SUCCESS);
      toast.success('Contraseña actualizada', MESSAGES.PASSWORD.UPDATE_SUCCESS);
      reset();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || MESSAGES.PASSWORD.UPDATE_ERROR;
      setErrorMsg(errorMessage);
      toast.error('Error al cambiar contraseña', errorMessage);
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
          <p className="text-gray-600">Gestioná tu información personal, verificación y seguridad</p>
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
          <button className="text-green-600 font-semibold border-b-2 border-green-600 pb-1">
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

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual *</Label>
                <InputEnhanced
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                  error={errors.currentPassword?.message}
                  disabled={savingPass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña *</Label>
                <InputEnhanced
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                  placeholder="Mínimo 8 caracteres, una mayúscula y un número"
                  error={errors.newPassword?.message}
                  success={newPassword.length >= 8}
                  showValidation
                  disabled={savingPass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña *</Label>
                <InputEnhanced
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  success={passwordMatch && confirmPassword.length > 0}
                  showValidation
                  disabled={savingPass}
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
