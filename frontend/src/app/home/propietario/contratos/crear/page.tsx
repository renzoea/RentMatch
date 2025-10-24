'use client';

import { useState, useEffect, DragEvent, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, Search, CheckCircle, Loader2, PenTool } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import LocationSelector from '@/components/location-selector';
import PDFViewerModal from '@/components/pdf-viewer-modal';

type Tenant = {
  id: string;
  full_name: string;
  email: string;
}

function CrearContratoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [contractId, setContractId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  // Tenant search
  const [tenantEmail, setTenantEmail] = useState('');
  const [searchingTenant, setSearchingTenant] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantError, setTenantError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Propiedad
    address_line: '',
    city: '',
    neighborhood: '',
    property_type: 'departamento',
    rooms: 1,
    bathrooms: 1,
    furnished: false,
    pets_allowed: false,
    amenities: [] as string[],
    notes: '',

    // Contrato
    rent_amount: '',
    rent_currency: 'ARS',
    deposit_amount: '',
    deposit_currency: 'ARS',
    payment_day: 1,
    start_date: '',
    duration_months: 36, // Duración en meses (por defecto 36 = 3 años)
    end_date: '',
    terms: '',
  });

  // Cargar contrato si estamos en modo edición
  useEffect(() => {
    if (editId) {
      loadContract(editId);
    }
  }, [editId]);

  const loadContract = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.get(`/api/contracts/landlord/my/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const contract = res.data;

      // Setear contractId para habilitar el botón de firma
      setContractId(contract.id);

      // Cargar datos del inquilino
      if (contract.tenant) {
        setTenant(contract.tenant);
        setTenantEmail(contract.tenant.email);
      }

      // Cargar PDF si existe
      if (contract.document_url) {
        setPdfUrl(contract.document_url);
      }

      // Calcular duración en meses
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                        (endDate.getMonth() - startDate.getMonth());

      // Cargar datos del formulario
      setFormData({
        address_line: contract.property?.address_line || '',
        city: contract.property?.city || '',
        neighborhood: contract.property?.neighborhood || '',
        property_type: contract.property?.property_type || 'departamento',
        rooms: contract.property?.rooms || 1,
        bathrooms: contract.property?.bathrooms || 1,
        furnished: contract.property?.furnished || false,
        pets_allowed: contract.property?.pets_allowed || false,
        amenities: contract.property?.amenities || [],
        notes: contract.property?.notes || '',
        rent_amount: contract.rent_amount?.toString() || '',
        rent_currency: contract.rent_currency || 'ARS',
        deposit_amount: contract.deposit_amount?.toString() || '',
        deposit_currency: contract.deposit_currency || 'ARS',
        payment_day: contract.payment_day || 1,
        start_date: contract.start_date || '',
        duration_months: monthsDiff || 36,
        end_date: contract.end_date || '',
        terms: contract.terms || '',
      });
    } catch (error) {
      alert('Error al cargar el contrato');
      router.push('/home/propietario/contratos');
    } finally {
      setLoading(false);
    }
  };

  const searchTenant = async () => {
    if (!tenantEmail) {
      setTenantError('Por favor ingresa un email');
      return;
    }

    setSearchingTenant(true);
    setTenantError('');
    setTenant(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await api.get(`/api/contracts/find-tenant?email=${encodeURIComponent(tenantEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenant(res.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setTenantError(err.response?.data?.error || 'Inquilino no encontrado');
    } finally {
      setSearchingTenant(false);
    }
  };

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
      setPdf(file);
      uploadPDF(file);
    }
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Solo se aceptan archivos PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera el máximo de 10MB.');
      return;
    }
    setPdf(file);
    uploadPDF(file);
  }

  const uploadPDF = async (file: File) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/api/upload/pdf', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPdfUrl(res.data.url);
      alert('PDF subido correctamente');
    } catch (error) {
      alert('Error al subir el PDF');
      setPdf(null);
    } finally {
      setUploading(false);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!tenant) {
      alert('Por favor busca y selecciona un inquilino');
      return;
    }

    if (!pdfUrl) {
      alert('Por favor sube el PDF del contrato');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('access_token');

      // Calcular fecha de fin basada en la fecha de inicio y duración
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + formData.duration_months);

      const contractData = {
        tenant_id: tenant.id,
        property: {
          address_line: formData.address_line,
          city: formData.city,
          neighborhood: formData.neighborhood,
          property_type: formData.property_type,
          rooms: parseInt(formData.rooms.toString()),
          bathrooms: parseInt(formData.bathrooms.toString()),
          furnished: formData.furnished,
          pets_allowed: formData.pets_allowed,
          amenities: formData.amenities.length > 0 ? formData.amenities : null,
          notes: formData.notes || null,
        },
        rent_amount: parseFloat(formData.rent_amount),
        rent_currency: formData.rent_currency,
        deposit_amount: parseFloat(formData.deposit_amount || formData.rent_amount),
        deposit_currency: formData.deposit_currency,
        payment_day: parseInt(formData.payment_day.toString()),
        start_date: formData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        terms: formData.terms,
        document_url: pdfUrl,
      };

      const res = await api.post('/api/contracts', contractData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContractId(res.data.contract.id);
      alert('Contrato creado correctamente.');
      router.push('/home/propietario/contratos');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Error al crear el contrato');
    } finally {
      setSending(false);
    }
  }

  const handleSign = async () => {
    if (!contractId) {
      alert('Primero debes crear el contrato');
      return;
    }

    setSigning(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.post(`/api/contracts/landlord/my/${contractId}/sign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Guardar el ID del contrato y envelopeId en localStorage para confirmar después
      localStorage.setItem('contractId', contractId);
      localStorage.setItem('envelopeId', res.data.envelopeId);

      // Abrir DocuSign en nueva ventana
      window.location.href = res.data.url;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Error al iniciar la firma');
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando contrato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {editId ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
          </h1>
          <p className="text-gray-600">
            {editId ? 'Modifica los datos del contrato' : 'Completa la información para generar un nuevo contrato de alquiler'}
          </p>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6 md:p-8">
            <form className="space-y-8" onSubmit={onSubmit}>
              {/* Buscar Inquilino */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  1. Buscar Inquilino
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="tenant_email">Email del Inquilino *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tenant_email"
                      type="email"
                      placeholder="inquilino@email.com"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchTenant();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={searchTenant}
                      disabled={searchingTenant}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {searchingTenant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {tenantError && <p className="text-xs text-red-600">{tenantError}</p>}
                  {tenant && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">{tenant.full_name}</p>
                        <p className="text-xs text-green-700">{tenant.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Información de la Propiedad */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  2. Información de la Propiedad
                </h3>

                {/* Dirección */}
                <div className="mb-4">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    placeholder="Av. Santa Fe 1234"
                    value={formData.address_line}
                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>

                {/* Ciudad y Barrio con LocationSelector */}
                <div className="mb-4">
                  <LocationSelector
                    selectedCity={formData.city}
                    selectedNeighborhood={formData.neighborhood}
                    onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
                    onNeighborhoodChange={(neighborhood) => setFormData(prev => ({ ...prev, neighborhood }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Tipo de Propiedad *</Label>
                    <select
                      id="property_type"
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      required
                    >
                      <option value="departamento">Departamento</option>
                      <option value="casa">Casa</option>
                      <option value="ph">PH</option>
                      <option value="duplex">Duplex</option>
                      <option value="estudio">Estudio</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Ambientes</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min="1"
                      value={formData.rooms}
                      onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-4 col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.furnished}
                        onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Amoblado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pets_allowed}
                        onChange={(e) => setFormData({ ...formData, pets_allowed: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Acepta mascotas</span>
                    </label>
                  </div>
                </div>

                {/* Amenidades */}
                <div className="mt-4">
                  <Label className="mb-2 block">Amenidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['WiFi', 'Aire Acondicionado', 'Calefacción', 'Cocina', 'Lavarropas', 'Balcón', 'Terraza', 'Parrilla', 'Pileta', 'Gimnasio', 'Estacionamiento', 'Seguridad 24hs'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                            } else {
                              setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                            }
                          }}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notas adicionales */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="notes">Notas sobre la Propiedad</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional sobre la propiedad..."
                    className="min-h-[80px]"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </section>

              {/* Términos del Contrato */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  3. Términos del Contrato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent_amount">Monto del Alquiler *</Label>
                    <Input
                      id="rent_amount"
                      type="number"
                      placeholder="550000"
                      value={formData.rent_amount}
                      onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit_amount">Monto del Depósito</Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      placeholder="Dejar vacío para usar el mismo monto del alquiler"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_day">Día de pago (1-28)</Label>
                    <Input
                      id="payment_day"
                      type="number"
                      min="1"
                      max="28"
                      value={formData.payment_day}
                      onChange={(e) => setFormData({ ...formData, payment_day: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha de Inicio *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_months">Duración del Contrato *</Label>
                    <select
                      id="duration_months"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      required
                    >
                      <option value="12">12 meses (1 año)</option>
                      <option value="24">24 meses (2 años)</option>
                      <option value="36">36 meses (3 años)</option>
                      <option value="48">48 meses (4 años)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="terms">Términos Adicionales</Label>
                  <Textarea
                    id="terms"
                    placeholder="Condiciones especiales, restricciones, etc…"
                    className="min-h-[100px]"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  />
                </div>
              </section>

              {/* Documento del Contrato */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  4. Documento del Contrato *
                </h3>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={[
                    'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center',
                    dragOver ? 'border-orange-400 bg-orange-50/40' : 'border-gray-300 bg-gray-50/30',
                  ].join(' ')}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-sm text-gray-700">Subiendo PDF...</p>
                    </div>
                  ) : pdfUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-green-600" />
                      <div className="text-sm text-center">
                        <p className="font-medium text-gray-900">{pdf?.name || 'Contrato.pdf'}</p>
                        <p className="text-xs text-green-600">PDF cargado correctamente</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPdfViewerOpen(true)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          Ver PDF
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setPdf(null);
                            setPdfUrl('');
                          }}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-700">
                        Arrastra y suelta tu documento PDF aquí, o
                      </p>
                      <div className="mt-3">
                        <label className="inline-flex">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={onSelectFile}
                          />
                          <span className="inline-block px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm shadow-sm hover:bg-gray-50 cursor-pointer">
                            Seleccionar archivo
                          </span>
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Solo archivos PDF. Máximo 10MB.
                      </p>
                    </>
                  )}
                </div>
              </section>

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                {!contractId ? (
                  <Button
                    type="submit"
                    disabled={sending || !tenant || !pdfUrl}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Contrato'
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleSign}
                      disabled={signing}
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      {signing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando firma...
                        </>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4 mr-2" />
                          Firmar Contrato con DocuSign
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/home/propietario/contratos')}
                    >
                      Firmar más tarde
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <PDFViewerModal
        open={pdfViewerOpen}
        pdfUrl={pdfUrl}
        onClose={() => setPdfViewerOpen(false)}
        title="Contrato PDF"
      />
    </div>
  );
}

export default function CrearContratoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <CrearContratoContent />
    </Suspense>
  );
}