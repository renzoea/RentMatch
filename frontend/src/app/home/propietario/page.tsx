"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Filter, Home, MapPin, DollarSign, BadgeCheck, Loader2,
  Eye, Mail, MessageCircle, X, Check, Bed, Bath,
  Maximize, Calendar, Users, Sparkles, Building2, Car,
  Shield, Sun, Waves, Wind, Lock, MoveUp, StickyNote, AlertCircle, Info
} from "lucide-react";
import React from "react";

import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

type TenantProfile = {
  id: string;
  tenant_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  profile_status?: string;
  city?: string;
  neighborhood?: string;
  budget_min?: number;
  budget_max?: number;
  property_types?: string[];
  rooms_min?: number;
  rooms_max?: number;
  bedroom_min?: number;
  bedroom_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  area_min?: number;
  area_max?: number;
  furnished?: boolean;
  pets_allowed?: boolean;
  smokers_allowed?: boolean;
  children?: boolean;
  students?: boolean;
  parking_needed?: boolean;
  require_verified_landlord?: boolean;
  amenities?: string[];
  lease_term_months?: number;
  occupants?: number;
  balcony?: boolean;
  terrace?: boolean;
  laundry?: boolean;
  security?: boolean;
  elevator?: boolean;
  metadata?: { preferencias?: string; notas?: string };
  created_at?: string;
  status?: string;
};

type Filters = {
  city?: string;
  neighborhood?: string;
  property_type?: string;
  rent_cost?: number;
  bedrooms?: number;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  lease_term_months?: number;
  occupants?: number;
  furnished?: boolean;
  pets_allowed?: boolean;
  smokers_allowed?: boolean;
  children?: boolean;
  students?: boolean;
  parking_needed?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  laundry?: boolean;
  elevator?: boolean;
  security?: boolean;
  only_verified?: boolean;
  amenities: string[];
};

// const AMENITIES = ["balcón", "pileta", "terraza", "gym", "cochera", "laundry"];

const PROPERTY_TYPES: Record<string, string> = {
  'departamento': 'Departamento',
  'ph': 'PH',
  'duplex': 'Duplex',
  'casa': 'Casa',
  'estudio': 'Estudio'
};

const ARGENTINA_LOCATIONS: Record<string, string[]> = {
  'Buenos Aires': ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Villa Crespo'],
  'Córdoba': ['Nueva Córdoba', 'General Paz', 'Cerro de las Rosas'],
  'Rosario': ['Centro', 'Pichincha', 'Fisherton']
};

export default function PropietarioHomePage() {
  const [filters, setFilters] = useState<Filters>({ amenities: [] });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<TenantProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailProfile, setDetailProfile] = useState<TenantProfile | null>(null);
  const [contactModal, setContactModal] = useState<{ type: 'whatsapp' | 'email'; profile: TenantProfile } | null>(null);
  const [landlordStatus, setLandlordStatus] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const cities = useMemo(() => Object.keys(ARGENTINA_LOCATIONS).sort(), []);
  const neighborhoods = useMemo(() => {
    if (!filters.city) return [];
    return ARGENTINA_LOCATIONS[filters.city] || [];
  }, [filters.city]);

  const clearFilters = () => setFilters({ amenities: [] });

  const search = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters: Record<string, string | number | boolean | string[]> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === "boolean" && value === false) return;
        cleanFilters[key] = value;
      });

      const response = await api.post("/api/filter-search/advanced/", cleanFilters);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setList(rows);
    } catch (e) {
      const error = e as { response?: { data?: { error?: string } }; message?: string };
      setError(error?.response?.data?.error || error?.message || "Error al buscar");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    search();
  }, [search]);

  useEffect(() => {
    // Obtener el status del propietario desde localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setLandlordStatus(userData?.status || null);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        setLandlordStatus(null);
      }
    }
  }, []);

  const handleContactClick = (type: 'whatsapp' | 'email', profile: TenantProfile) => {
    if (landlordStatus !== 'verified') {
      setShowVerificationModal(true);
      return;
    }
    setContactModal({ type, profile });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2.5 rounded-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inquilinos Disponibles</h1>
                <p className="text-sm text-gray-600">Encuentra inquilinos que se ajusten a tu propiedad</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard icon={<Users />} label="Total" value={list.length} color="blue" />
            <MetricCard
              icon={<BadgeCheck />}
              label="Verificados"
              value={list.filter(p => p.profile_status === 'verified').length}
              color="green"
            />
            <MetricCard
              icon={<Home />}
              label="Activos"
              value={list.filter(p => p.status === 'activo').length}
              color="orange"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-500" />
                  Filtros
                </h2>
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <FilterSection title="Ubicación">
                  <Select
                    label="Ciudad"
                    value={filters.city || ''}
                    onChange={(v) => setFilters(f => ({ ...f, city: v || undefined, neighborhood: undefined }))}
                    options={['', ...cities]}
                    placeholder="Todas"
                  />
                  <Select
                    label="Barrio"
                    value={filters.neighborhood || ''}
                    onChange={(v) => setFilters(f => ({ ...f, neighborhood: v || undefined }))}
                    options={['', ...neighborhoods]}
                    placeholder="Todos"
                    disabled={!filters.city}
                  />
                </FilterSection>

                <FilterSection title="Tipo de Propiedad">
                  <Select
                    label="Tipo"
                    value={filters.property_type || ''}
                    onChange={(v) => setFilters(f => ({ ...f, property_type: v || undefined }))}
                    options={['', ...Object.keys(PROPERTY_TYPES)]}
                    placeholder="Todos los tipos"
                    renderOption={(value) => value ? PROPERTY_TYPES[value] : 'Todos los tipos'}
                  />
                </FilterSection>

                <FilterSection title="Costo del Alquiler">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Precio mensual ($)</label>
                  <input
                    type="number"
                    value={filters.rent_cost || ''}
                    onChange={(e) => setFilters(f => ({ ...f, rent_cost: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 5000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </FilterSection>

                <FilterSection title="Características">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Dormitorios</label>
                  <input
                    type="number"
                    value={filters.bedrooms || ''}
                    onChange={(e) => setFilters(f => ({ ...f, bedrooms: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 2"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
                  />

                  <label className="text-xs font-semibold text-gray-700 block mb-2">Ambientes</label>
                  <input
                    type="number"
                    value={filters.rooms || ''}
                    onChange={(e) => setFilters(f => ({ ...f, rooms: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 3"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
                  />

                  <label className="text-xs font-semibold text-gray-700 block mb-2">Baños</label>
                  <input
                    type="number"
                    value={filters.bathrooms || ''}
                    onChange={(e) => setFilters(f => ({ ...f, bathrooms: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
                  />

                  <label className="text-xs font-semibold text-gray-700 block mb-2">Área (m²)</label>
                  <input
                    type="number"
                    value={filters.area || ''}
                    onChange={(e) => setFilters(f => ({ ...f, area: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 60"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </FilterSection>

                <FilterSection title="Amenidades">
                  <Checkbox 
                    label="Amoblado" 
                    checked={!!filters.furnished} 
                    onChange={(c) => setFilters(f => ({ ...f, furnished: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Balcón" 
                    checked={!!filters.balcony} 
                    onChange={(c) => setFilters(f => ({ ...f, balcony: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Terraza" 
                    checked={!!filters.terrace} 
                    onChange={(c) => setFilters(f => ({ ...f, terrace: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Lavadero" 
                    checked={!!filters.laundry} 
                    onChange={(c) => setFilters(f => ({ ...f, laundry: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Ascensor" 
                    checked={!!filters.elevator} 
                    onChange={(c) => setFilters(f => ({ ...f, elevator: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Seguridad" 
                    checked={!!filters.security} 
                    onChange={(c) => setFilters(f => ({ ...f, security: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Cochera" 
                    checked={!!filters.parking_needed} 
                    onChange={(c) => setFilters(f => ({ ...f, parking_needed: c ? true : undefined }))} 
                  />
                </FilterSection>

                <FilterSection title="Preferencias de Inquilinos">
                  <Checkbox
                    label="Acepta mascotas"
                    checked={!!filters.pets_allowed}
                    onChange={(c) => setFilters(f => ({ ...f, pets_allowed: c ? true : undefined }))}
                  />
                  <Checkbox
                    label="Permite fumadores"
                    checked={!!filters.smokers_allowed}
                    onChange={(c) => setFilters(f => ({ ...f, smokers_allowed: c ? true : undefined }))}
                  />
                  <Checkbox
                    label="Permite niños"
                    checked={!!filters.children}
                    onChange={(c) => setFilters(f => ({ ...f, children: c ? true : undefined }))}
                  />
                  <Checkbox
                    label="Acepta estudiantes"
                    checked={!!filters.students}
                    onChange={(c) => setFilters(f => ({ ...f, students: c ? true : undefined }))}
                  />
                </FilterSection>

                <FilterSection title="Otros Filtros">
                  <Checkbox
                    label="Solo perfiles verificados"
                    checked={!!filters.only_verified}
                    onChange={(c) => setFilters(f => ({ ...f, only_verified: c ? true : undefined }))}
                  />

                  <label className="text-xs font-semibold text-gray-700 block mb-2 mt-3">Duración del contrato (meses)</label>
                  <input
                    type="number"
                    value={filters.lease_term_months || ''}
                    onChange={(e) => setFilters(f => ({ ...f, lease_term_months: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 12"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
                  />

                  <label className="text-xs font-semibold text-gray-700 block mb-2">Número de ocupantes</label>
                  <input
                    type="number"
                    value={filters.occupants || ''}
                    onChange={(e) => setFilters(f => ({ ...f, occupants: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Ej: 2"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </FilterSection>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={search}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                  {loading ? 'Buscando...' : 'Aplicar Filtros'}
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading && list.length === 0 ? (
              <SkeletonCards />
            ) : list.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {list.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onViewDetail={() => setDetailProfile(profile)}
                    onContactClick={handleContactClick}
                  />
                ))}
              </div>
            )}

            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funciona la búsqueda de inquilinos?</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>
                        <strong>1. Usa los filtros:</strong> Filtra por ubicación, presupuesto, tipo de propiedad y características específicas para encontrar inquilinos que coincidan con tu propiedad.
                      </p>
                      <p>
                        <strong>2. Revisa perfiles verificados:</strong> Los inquilinos con badge &quot;Verificado&quot; han completado su proceso de verificación.
                      </p>
                      <p>
                        <strong>3. Contacta directamente:</strong> Puedes contactar a los inquilinos por WhatsApp o email. Nota: necesitas tener tu perfil verificado para poder contactar.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {detailProfile && (
        <ProfileDetailModal
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onContactClick={handleContactClick}
        />
      )}

      {contactModal && (
        <ContactModal
          type={contactModal.type}
          profile={contactModal.profile}
          onClose={() => setContactModal(null)}
        />
      )}

      {showVerificationModal && (
        <VerificationRequiredModal
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactElement; label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${colors[color as keyof typeof colors]} p-2 rounded-lg`}>
            {React.cloneElement(icon, { className: "w-5 h-5 text-white" } as React.HTMLAttributes<HTMLElement>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400'
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  renderOption
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  renderOption?: (value: string) => string;
}) {
  return (
    <div>
      {label && <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder || 'Seleccionar...'}</option>
        {options.filter((o: string) => o).map((o: string) => (
          <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>
        ))}
      </select>
    </div>
  );
}

function ProfileCard({
  profile,
  onViewDetail,
  onContactClick
}: {
  profile: TenantProfile;
  onViewDetail: () => void;
  onContactClick: (type: 'whatsapp' | 'email', profile: TenantProfile) => void;
}) {
  const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const cap = (s?: string) => s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  
  const initials = (profile.full_name || 'IN')
    .split(' ')
    .map(s => s[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  const isVerified = profile.profile_status && profile.profile_status === 'verified';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">{profile.full_name || 'Inquilino'}</h3>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <Check className="w-3 h-3" /> Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                    <X className="w-3 h-3" /> No verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{[profile.neighborhood, profile.city].filter(Boolean).join(', ') || 'Sin especificar'}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            profile.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {cap(profile.status || 'activo')}
          </span>
        </div>

        {profile.property_types && profile.property_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.property_types.map((type) => (
              <span key={type} className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200 capitalize">
                {PROPERTY_TYPES[type] || cap(type)}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Presupuesto</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-green-600">Mínimo</span>
                <p className="text-green-900 font-bold text-base">${nfAR.format(profile.budget_min || 0)}</p>
              </div>
              <div>
                <span className="text-xs text-green-600">Máximo</span>
                <p className="text-green-900 font-bold text-base">${nfAR.format(profile.budget_max || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Ocupantes</span>
            </div>
            <p className="text-blue-900 font-bold text-base">
              {profile.occupants ? `${profile.occupants} persona${profile.occupants > 1 ? 's' : ''}` : 'No especificado'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
          {(profile.bedroom_min || profile.bedroom_max) && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-orange-500" />
              <span>{profile.bedroom_min || 0} - {profile.bedroom_max || '∞'} dorm</span>
            </div>
          )}
          {(profile.rooms_min || profile.rooms_max) && (
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-orange-500" />
              <span>{profile.rooms_min || 0} - {profile.rooms_max || '∞'} amb</span>
            </div>
          )}
          {(profile.bathrooms_min || profile.bathrooms_max) && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-orange-500" />
              <span>{profile.bathrooms_min || 0} - {profile.bathrooms_max || '∞'} baño</span>
            </div>
          )}
          {profile.lease_term_months && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{profile.lease_term_months} meses</span>
            </div>
          )}
        </div>

        {(profile.furnished || profile.pets_allowed || profile.parking_needed || profile.balcony || profile.terrace) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.furnished && <Badge icon={<Sparkles />} label="Amoblado" />}
            {profile.pets_allowed && <Badge icon={<Check />} label="Mascotas" />}
            {profile.parking_needed && <Badge icon={<Car />} label="Cochera" />}
            {profile.balcony && <Badge icon={<Sun />} label="Balcón" />}
            {profile.terrace && <Badge icon={<Waves />} label="Terraza" />}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onViewDetail}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Ver</span>
          </button>
          <button
            onClick={() => onContactClick('whatsapp', profile)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={() => onContactClick('email', profile)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ icon, label }: { icon: React.ReactElement; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
      {React.cloneElement(icon, { className: "w-3 h-3" } as React.HTMLAttributes<HTMLElement>)}
      {label}
    </span>
  );
}

function ProfileDetailModal({
  profile,
  onClose,
  onContactClick
}: {
  profile: TenantProfile;
  onClose: () => void;
  onContactClick: (type: 'whatsapp' | 'email', profile: TenantProfile) => void;
}) {
  const cap = (s?: string) => s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

  const BooleanBadge = ({
    value,
    trueText = 'Sí',
    falseText = 'No'
  }: {
    value?: boolean;
    trueText?: string;
    falseText?: string;
  }) => {
    if (value === undefined) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {value && <Check className="w-3 h-3" />}
        {value ? trueText : falseText}
      </span>
    );
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-200 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Perfil del Inquilino</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-700 font-medium text-sm">Nombre:</span>
                <p className="text-gray-900 text-sm mt-1">{profile.full_name || 'No especificado'}</p>
              </div>
              {profile.occupants && (
                <div>
                  <span className="text-gray-700 font-medium text-sm">Ocupantes:</span>
                  <p className="text-gray-900 text-sm mt-1">{profile.occupants} persona{profile.occupants > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>

          {(profile.city || profile.neighborhood) && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Ubicación Deseada</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.city && (
                  <div>
                    <span className="text-gray-700 font-medium text-sm">Ciudad:</span>
                    <p className="text-gray-900 text-sm mt-1">{cap(profile.city)}</p>
                  </div>
                )}
                {profile.neighborhood && (
                  <div>
                    <span className="text-gray-700 font-medium text-sm">Barrio:</span>
                    <p className="text-gray-900 text-sm mt-1">{cap(profile.neighborhood)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Presupuesto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.budget_min && (
                <div>
                  <span className="text-gray-700 font-medium text-sm">Mínimo:</span>
                  <p className="text-gray-900 font-bold text-lg">${nfAR.format(profile.budget_min)}</p>
                </div>
              )}
              {profile.budget_max && (
                <div>
                  <span className="text-gray-700 font-medium text-sm">Máximo:</span>
                  <p className="text-gray-900 font-bold text-lg">${nfAR.format(profile.budget_max)}</p>
                </div>
              )}
              {profile.lease_term_months && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700 font-medium text-sm">Duración del contrato:</span>
                    <span className="text-gray-900 text-sm">{profile.lease_term_months} meses</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Propiedad Buscada</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.property_types && profile.property_types.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-gray-700 font-medium text-sm block mb-2">Tipos de propiedad:</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.property_types.map((type) => (
                      <span key={type} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {PROPERTY_TYPES[type] || cap(type)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.bedroom_min || profile.bedroom_max) && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Dormitorios:</span>
                  <span className="text-gray-900 text-sm">{profile.bedroom_min || 0} - {profile.bedroom_max || '∞'}</span>
                </div>
              )}
              {(profile.rooms_min || profile.rooms_max) && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Ambientes:</span>
                  <span className="text-gray-900 text-sm">{profile.rooms_min || 0} - {profile.rooms_max || '∞'}</span>
                </div>
              )}
              {(profile.bathrooms_min || profile.bathrooms_max) && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Baños:</span>
                  <span className="text-gray-900 text-sm">{profile.bathrooms_min || 0} - {profile.bathrooms_max || '∞'}</span>
                </div>
              )}
              {(profile.area_min || profile.area_max) && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Área (m²):</span>
                  <span className="text-gray-900 text-sm">{profile.area_min || 0} - {profile.area_max || '∞'}</span>
                </div>
              )}
              {profile.furnished !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium text-sm">Amoblado:</span>
                  <BooleanBadge value={profile.furnished} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preferencias</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.pets_allowed !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium text-sm">Mascotas:</span>
                  <BooleanBadge value={profile.pets_allowed} />
                </div>
              )}
              {profile.smokers_allowed !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium text-sm">Fumadores:</span>
                  <BooleanBadge value={profile.smokers_allowed} />
                </div>
              )}
              {profile.children !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium text-sm">Niños:</span>
                  <BooleanBadge value={profile.children} />
                </div>
              )}
              {profile.students !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium text-sm">Estudiantes:</span>
                  <BooleanBadge value={profile.students} />
                </div>
              )}
              {profile.parking_needed !== undefined && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Cochera:</span>
                  <BooleanBadge value={profile.parking_needed} trueText="Necesaria" falseText="Opcional" />
                </div>
              )}
              {profile.require_verified_landlord !== undefined && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-700 font-medium text-sm">Propietario verificado:</span>
                  <BooleanBadge value={profile.require_verified_landlord} />
                </div>
              )}
            </div>
          </div>

          {(profile.amenities?.length || profile.balcony || profile.terrace || profile.laundry || profile.security || profile.elevator) && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Comodidades Deseadas</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.balcony && (
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm">Balcón</span>
                  </div>
                )}
                {profile.terrace && (
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm">Terraza</span>
                  </div>
                )}
                {profile.laundry && (
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm">Lavadero</span>
                  </div>
                )}
                {profile.security && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm">Seguridad</span>
                  </div>
                )}
                {profile.elevator && (
                  <div className="flex items-center gap-2">
                    <MoveUp className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm">Ascensor</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(profile.metadata?.preferencias || profile.metadata?.notas) && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notas Adicionales</h3>
              </div>
              <div className="space-y-3">
                {profile.metadata?.preferencias && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium text-sm block mb-1">Preferencias:</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{profile.metadata.preferencias}</p>
                  </div>
                )}
                {profile.metadata?.notas && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-700 font-medium text-sm block mb-1">Notas:</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{profile.metadata.notas}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {profile.created_at && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Perfil creado el {new Date(profile.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onContactClick('whatsapp', profile)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => onContactClick('email', profile)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all font-semibold"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="pt-12 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="bg-orange-100 p-6 rounded-full mb-6">
            <Users className="w-12 h-12 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron inquilinos</h3>
          <p className="text-gray-600 max-w-md">
            Intenta ajustar los filtros de búsqueda para encontrar más perfiles que coincidan con tus criterios.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactModal({
  type,
  profile,
  onClose
}: {
  type: 'whatsapp' | 'email';
  profile: TenantProfile;
  onClose: () => void;
}) {
  const isWhatsApp = type === 'whatsapp';
  const contactInfo = isWhatsApp ? profile.phone : profile.email;

  const handleCopyToClipboard = () => {
    if (contactInfo) {
      navigator.clipboard.writeText(contactInfo);
      alert('Copiado al portapapeles');
    }
  };

  const handleOpenContact = () => {
    if (isWhatsApp && profile.phone) {
      // Limpiar el número de teléfono y abrir WhatsApp
      const cleanPhone = profile.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else if (!isWhatsApp && profile.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
        <div className={`${isWhatsApp ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} px-6 py-5 flex items-center justify-between rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              {isWhatsApp ? (
                <MessageCircle className="w-6 h-6 text-white" />
              ) : (
                <Mail className="w-6 h-6 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isWhatsApp ? 'WhatsApp' : 'Email'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2">Inquilino:</p>
            <p className="text-gray-900 font-semibold text-lg">{profile.full_name || 'Sin nombre'}</p>
          </div>

          {contactInfo ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-gray-600 text-sm mb-1">
                  {isWhatsApp ? 'Número de teléfono:' : 'Correo electrónico:'}
                </p>
                <p className="text-gray-900 font-mono text-lg font-semibold break-all">
                  {contactInfo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  <Check className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={handleOpenContact}
                  className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-all font-semibold ${
                    isWhatsApp
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isWhatsApp ? (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Abrir WhatsApp
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Email
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  {isWhatsApp
                    ? 'El inquilino no ha proporcionado un número de teléfono.'
                    : 'El inquilino no ha proporcionado un correo electrónico.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function VerificationRequiredModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verificación Requerida</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-900 font-semibold mb-2">
                  Debes tener tu perfil verificado para ver la información de contacto de los inquilinos.
                </p>
                <p className="text-orange-800 text-sm">
                  La verificación de tu perfil te permite acceder a información de contacto y generar más confianza con los inquilinos.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                // Aquí irá la navegación a la página de verificación
                console.log('Redirigir a verificación');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
            >
              <BadgeCheck className="w-5 h-5" />
              Verificar Mi Cuenta
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Ahora No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}