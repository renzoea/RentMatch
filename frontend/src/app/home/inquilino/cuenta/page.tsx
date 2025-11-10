'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Info, AlertTriangle, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { MESSAGES } from '@/constants/messages';

export default function MiCuentaInquilinoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth({ requiredRole: 'inquilino' });

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    public_search_profiles: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/profile');
      const profile = response.data;

      // Split full_name into first and last name
      const nameParts = (profile.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setForm({
        first_name: firstName,
        last_name: lastName,
        email: profile.email || '',
        phone: profile.phone || '',
        public_search_profiles: profile.public_search_profiles ?? true,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorMsg((error as { response?: { data?: { error?: string } } })?.response?.data?.error || MESSAGES.PROFILE.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      // Clear messages when user starts typing
      if (successMsg) setSuccessMsg('');
      if (errorMsg) setErrorMsg('');
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate names
    if (!form.first_name || form.first_name.trim().length === 0) {
      setErrorMsg(MESSAGES.PROFILE.NAME_REQUIRED);
      return;
    }
    if (!form.last_name || form.last_name.trim().length === 0) {
      setErrorMsg(MESSAGES.PROFILE.LAST_NAME_REQUIRED);
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Combine first and last name for backend
      const full_name = `${form.first_name.trim()} ${form.last_name.trim()}`;

      const response = await api.patch('/api/users/profile', {
        full_name,
        phone: form.phone,
        public_search_profiles: form.public_search_profiles,
      });

      setSuccessMsg(MESSAGES.PROFILE.UPDATE_SUCCESS);

      // Update user in localStorage
      const updatedUser = { ...user, full_name: response.data.profile.full_name };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMsg((error as { response?: { data?: { error?: string } } })?.response?.data?.error || MESSAGES.PROFILE.UPDATE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    if (deleteConfirmation !== MESSAGES.PROFILE.DELETE_CONFIRM_TEXT) {
      setErrorMsg(MESSAGES.PROFILE.DELETE_INVALID_CONFIRMATION);
      return;
    }

    setDeleting(true);
    setErrorMsg('');

    try {
      await api.delete('/api/users/account', {
        data: { confirmation: deleteConfirmation }
      });

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user');

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMsg((error as { response?: { data?: { error?: string } } })?.response?.data?.error || MESSAGES.PROFILE.DELETE_ERROR);
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
            <p className="text-gray-600">Gestioná tu información personal y verificación</p>
          </div>

          {/* Tabs (UI) */}
          <div className="flex items-center gap-8 text-sm mb-4">
            <button className="text-orange-600 font-semibold border-b-2 border-orange-600 pb-1">
              Datos personales
            </button>
            <button
              className="text-gray-500 hover:text-gray-800 pb-1"
              onClick={() => router.push('/home/inquilino/cuenta/verificacion')}
            >
              Verificación
            </button>
            <button
              className="text-gray-500 hover:text-gray-800 pb-1"
              onClick={() => router.push('/home/inquilino/cuenta/seguridad')}
            >
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
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      value={form.first_name}
                      onChange={onChange('first_name')}
                      placeholder="Ej: Juan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={onChange('last_name')}
                      placeholder="Ej: Pérez"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      className="flex-1 bg-gray-100"
                      disabled
                      readOnly
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 whitespace-nowrap">
                      <ShieldCheck className="w-3 h-3" />
                      Verificado
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    El correo electrónico no puede ser modificado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={onChange('phone')}
                    placeholder="Ej: +54 9 11 1234-5678"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Configuración de privacidad */}
          <Card className="border border-gray-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {form.public_search_profiles ? (
                  <Eye className="w-5 h-5 text-gray-700" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-700" />
                )}
                <h2 className="text-lg font-extrabold text-gray-900">Configuración de privacidad</h2>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox
                    id="public_search_profiles"
                    checked={form.public_search_profiles}
                    onCheckedChange={(checked) => {
                      setForm((s) => ({ ...s, public_search_profiles: checked === true }));
                      if (successMsg) setSuccessMsg('');
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="public_search_profiles"
                      className="text-sm font-semibold text-gray-900 cursor-pointer"
                    >
                      Perfil público
                    </Label>
                    <p className="text-sm text-gray-600">
                      Permite que los propietarios vean tu perfil cuando busquen inquilinos.
                      Si desactivás esta opción, tu perfil no aparecerá en los resultados de búsqueda.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Eliminar cuenta */}
          <div className="rounded-xl border border-red-300/70 bg-red-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-xl font-extrabold text-red-600">Eliminar cuenta</h3>
            </div>
            <p className="text-gray-700 mb-3">
              Al eliminar tu cuenta, se borrarán todos tus datos personales y perfiles de búsqueda. Esta acción
              no se puede deshacer.
            </p>

            <Button
              variant="outline"
              className="bg-white text-red-600 hover:bg-red-50 border-red-300 shadow-sm"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Eliminar mi cuenta
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
          setErrorMsg('');
        }}
        title="Confirmar eliminación de cuenta"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
                setErrorMsg('');
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onDeleteAccount}
              disabled={deleting || deleteConfirmation !== 'ELIMINAR MI CUENTA'}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando…
                </>
              ) : (
                'Eliminar cuenta'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Esta acción es irreversible</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Se eliminarán todos tus datos personales</li>
                  <li>Se borrarán tus perfiles de búsqueda</li>
                  <li>Perderás el acceso a tu cuenta</li>
                  <li>No podrás recuperar esta información</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Para confirmar, escribe exactamente: <strong>{MESSAGES.PROFILE.DELETE_CONFIRM_TEXT}</strong>
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => {
                setDeleteConfirmation(e.target.value);
                setErrorMsg('');
              }}
              placeholder={MESSAGES.PROFILE.DELETE_CONFIRM_TEXT}
              disabled={deleting}
            />
          </div>

          {errorMsg && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
