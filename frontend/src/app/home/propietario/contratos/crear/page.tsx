'use client';

import { useState, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CrearContratoPage() {
  const router = useRouter();
  const [pdf, setPdf] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
      setPdf(file);
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
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    // Aquí armarías el FormData y lo enviarías a tu API
    // const form = new FormData(e.currentTarget);
    // if (pdf) form.append('contrato_pdf', pdf);
    // await fetch('/api/contracts', { method: 'POST', body: form });
    setTimeout(() => {
      setSending(false);
      router.push('/home/propietario/contratos');
    }, 900);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
          <p className="text-gray-600">Administra tus contratos de alquiler</p>
        </div>

        {/* Tabs header (solo UI) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => router.push('/home/propietario/contratos')}
              className="text-orange-600 font-semibold"
            >
              Mis Contratos
            </button>
          </div>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Crear Nuevo Contrato</h2>
            <p className="text-gray-600 mb-6">
              Completa la información para generar un nuevo contrato de alquiler
            </p>

            <form className="space-y-8" onSubmit={onSubmit}>
              {/* Información del Inquilino */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Información del Inquilino
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="tenant_email">Email del Inquilino *</Label>
                  <Input
                    id="tenant_email"
                    name="tenant_email"
                    type="email"
                    placeholder="inquilino@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    El email debe estar registrado en RentMatch
                  </p>
                </div>
              </section>

              {/* Información de la Propiedad */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Información de la Propiedad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección de la Propiedad *</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Av. Santa Fe 1234, Palermo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rent_amount">Monto del Alquiler *</Label>
                    <Input
                      id="rent_amount"
                      name="rent_amount"
                      placeholder="$550.000"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Este monto será el que deberá dejar como depósito el inquilino.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="property_desc">Descripción de la Propiedad</Label>
                  <Input
                    id="property_desc"
                    name="property_desc"
                    placeholder="Departamento de 2 ambientes, 1 dormitorio, 1 baño | balcón…"
                  />
                </div>
              </section>

              {/* Términos del Contrato */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Términos del Contrato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha de Inicio *</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      placeholder="dd / mm / aaaa"
                      type="date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración del Contrato *</Label>
                    <select
                      id="duration"
                      name="duration"
                      required
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
                    >
                      <option value="">Seleccionar duración</option>
                      <option value="12">12 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="terms">Términos Adicionales</Label>
                  <Textarea
                    id="terms"
                    name="terms"
                    placeholder="Condiciones especiales, restricciones, etc…"
                    className="min-h-[100px]"
                  />
                </div>
              </section>

              {/* Documento del Contrato */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Documento del Contrato
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
                  {pdf ? (
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-gray-600" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{pdf.name}</p>
                        <p className="text-xs text-gray-500">
                          {(pdf.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="ml-2 text-red-600 hover:bg-red-50"
                        onClick={() => setPdf(null)}
                      >
                        Quitar
                      </Button>
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
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6"
                >
                  {sending ? 'Enviando…' : 'Crear y Enviar Contrato'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
