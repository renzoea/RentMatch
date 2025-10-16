"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Filter, Home, MapPin, DollarSign, BadgeCheck, Loader2, 
  Eye, Mail, MessageCircle, X, Check, Bed, Bath, 
  Maximize, Calendar, Users, Sparkles, Building2, Car,
  Shield, Sun, Waves, Wind, Lock, MoveUp, StickyNote
} from "lucide-react";
import React from "react";

// Importar tu API real
import api from "@/lib/api";

// ============ Tipos ============
type TenantProfile = {
  id: string;
  tenant_id: string;
  full_name?: string;
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
  property_types: string[];
  city?: string;
  neighborhood?: string;
  budget_min?: number;
  budget_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  bedroom_min?: number;
  bedroom_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  area_min?: number;
  area_max?: number;
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
  amenities: string[];
};

// ============ Constantes ============
const PROPERTY_TYPES = [
  { label: "Departamento", value: "departamento" },
  { label: "PH", value: "ph" },
  { label: "Dúplex", value: "duplex" },
  { label: "Casa", value: "casa" },
  { label: "Estudio", value: "estudio" },
];

const AMENITIES = ["balcón", "pileta", "terraza", "gym", "cochera", "laundry"];

const ARGENTINA_LOCATIONS: Record<string, string[]> = {
  'Buenos Aires': ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Villa Crespo'],
  'Córdoba': ['Nueva Córdoba', 'General Paz', 'Cerro de las Rosas'],
  'Rosario': ['Centro', 'Pichincha', 'Fisherton']
};

// ============ Componente Principal ============
export default function PropietarioHomePage() {
  const [filters, setFilters] = useState<Filters>({ property_types: [], amenities: [] });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<TenantProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailProfile, setDetailProfile] = useState<TenantProfile | null>(null);

  const cities = useMemo(() => Object.keys(ARGENTINA_LOCATIONS).sort(), []);
  const neighborhoods = useMemo(() => {
    if (!filters.city) return [];
    return ARGENTINA_LOCATIONS[filters.city] || [];
  }, [filters.city]);

  const clearFilters = () => setFilters({ property_types: [], amenities: [] });

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;
        if (typeof value === "boolean" && value === false) return;
        cleanFilters[key] = value;
      });

      const token = localStorage.getItem('access_token');
      const response = await api.post("/api/filter-search/advanced/", cleanFilters, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setList(rows);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Error al buscar");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const cap = (s?: string) => s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inquilinos Disponibles</h1>
                <p className="text-gray-600">Encuentra el inquilino perfecto para tu propiedad</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard icon={<Users />} label="Total" value={list.length} color="blue" />
            <MetricCard 
              icon={<BadgeCheck />} 
              label="Verificados" 
              value={list.filter(p => p.require_verified_landlord).length} 
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
          {/* Panel de Filtros */}
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
                {/* Tipo de Propiedad */}
                <FilterSection title="Tipo de Propiedad">
                  {PROPERTY_TYPES.map(pt => (
                    <Checkbox
                      key={pt.value}
                      label={pt.label}
                      checked={filters.property_types.includes(pt.value)}
                      onChange={(checked) => {
                        setFilters(f => ({
                          ...f,
                          property_types: checked 
                            ? [...f.property_types, pt.value]
                            : f.property_types.filter(t => t !== pt.value)
                        }));
                      }}
                    />
                  ))}
                </FilterSection>

                {/* Ubicación */}
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

                {/* Presupuesto */}
                <FilterSection title="Presupuesto">
                  <RangeInputs
                    minValue={filters.budget_min}
                    maxValue={filters.budget_max}
                    onMinChange={(v) => setFilters(f => ({ ...f, budget_min: v ? Number(v) : undefined }))}
                    onMaxChange={(v) => setFilters(f => ({ ...f, budget_max: v ? Number(v) : undefined }))}
                    minPlaceholder="Mínimo"
                    maxPlaceholder="Máximo"
                    prefix="$"
                  />
                </FilterSection>

                {/* Ambientes y Dormitorios */}
                <FilterSection title="Distribución">
                  <label className="text-xs font-semibold text-gray-700">Ambientes</label>
                  <RangeInputs
                    minValue={filters.rooms_min}
                    maxValue={filters.rooms_max}
                    onMinChange={(v) => setFilters(f => ({ ...f, rooms_min: v ? Number(v) : undefined }))}
                    onMaxChange={(v) => setFilters(f => ({ ...f, rooms_max: v ? Number(v) : undefined }))}
                    minPlaceholder="Mín"
                    maxPlaceholder="Máx"
                  />
                  
                  <label className="text-xs font-semibold text-gray-700 mt-2">Dormitorios</label>
                  <RangeInputs
                    minValue={filters.bedroom_min}
                    maxValue={filters.bedroom_max}
                    onMinChange={(v) => setFilters(f => ({ ...f, bedroom_min: v ? Number(v) : undefined }))}
                    onMaxChange={(v) => setFilters(f => ({ ...f, bedroom_max: v ? Number(v) : undefined }))}
                    minPlaceholder="Mín"
                    maxPlaceholder="Máx"
                  />
                  
                  <label className="text-xs font-semibold text-gray-700 mt-2">Baños</label>
                  <RangeInputs
                    minValue={filters.bathrooms_min}
                    maxValue={filters.bathrooms_max}
                    onMinChange={(v) => setFilters(f => ({ ...f, bathrooms_min: v ? Number(v) : undefined }))}
                    onMaxChange={(v) => setFilters(f => ({ ...f, bathrooms_max: v ? Number(v) : undefined }))}
                    minPlaceholder="Mín"
                    maxPlaceholder="Máx"
                  />
                </FilterSection>

                {/* Características */}
                <FilterSection title="Características">
                  <Checkbox 
                    label="Amoblado" 
                    checked={!!filters.furnished} 
                    onChange={(c) => setFilters(f => ({ ...f, furnished: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Acepta mascotas" 
                    checked={!!filters.pets_allowed} 
                    onChange={(c) => setFilters(f => ({ ...f, pets_allowed: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Fumadores" 
                    checked={!!filters.smokers_allowed} 
                    onChange={(c) => setFilters(f => ({ ...f, smokers_allowed: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Con niños" 
                    checked={!!filters.children} 
                    onChange={(c) => setFilters(f => ({ ...f, children: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Estudiantes" 
                    checked={!!filters.students} 
                    onChange={(c) => setFilters(f => ({ ...f, students: c ? true : undefined }))} 
                  />
                  <Checkbox 
                    label="Necesita cochera" 
                    checked={!!filters.parking_needed} 
                    onChange={(c) => setFilters(f => ({ ...f, parking_needed: c ? true : undefined }))} 
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
                </FilterSection>

                {/* Amenidades */}
                <FilterSection title="Amenidades">
                  {AMENITIES.map(a => (
                    <Checkbox
                      key={a}
                      label={cap(a)}
                      checked={filters.amenities.includes(a)}
                      onChange={(checked) => {
                        setFilters(f => ({
                          ...f,
                          amenities: checked 
                            ? [...f.amenities, a]
                            : f.amenities.filter(am => am !== a)
                        }));
                      }}
                    />
                  ))}
                </FilterSection>
              </div>

              {/* Botones */}
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

          {/* Lista de Perfiles */}
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
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de Detalle */}
      {detailProfile && (
        <ProfileDetailModal 
          profile={detailProfile} 
          onClose={() => setDetailProfile(null)} 
        />
      )}
    </div>
  );
}

// ============ Componentes Auxiliares ============

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} p-2.5 rounded-lg`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
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

function Select({ label, value, onChange, options, placeholder, disabled }: any) {
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
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function RangeInputs({ minValue, maxValue, onMinChange, onMaxChange, minPlaceholder, maxPlaceholder, prefix }: any) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        type="number"
        value={minValue || ''}
        onChange={(e) => onMinChange(e.target.value)}
        placeholder={minPlaceholder}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      <input
        type="number"
        value={maxValue || ''}
        onChange={(e) => onMaxChange(e.target.value)}
        placeholder={maxPlaceholder}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>
  );
}

function ProfileCard({ profile, onViewDetail }: { profile: TenantProfile; onViewDetail: () => void }) {
  const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const cap = (s?: string) => s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  
  const initials = (profile.full_name || 'IN')
    .split(' ')
    .map(s => s[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-orange-200 transition-all overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-4 border-b border-orange-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">{profile.full_name || 'Inquilino'}</h3>
                {profile.require_verified_landlord && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <BadgeCheck className="w-3 h-3" /> Verificado
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
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Tipo de Propiedad */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">Tipo de Propiedad</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.property_types && profile.property_types.length > 0 ? (
                profile.property_types.map(t => (
                  <span key={t} className="px-2 py-1 bg-purple-200 text-purple-800 rounded-lg text-xs font-medium">
                    {cap(t)}
                  </span>
                ))
              ) : (
                <span className="text-purple-900 text-sm">No especificado</span>
              )}
            </div>
          </div>

          {/* Presupuesto */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Presupuesto</span>
            </div>
            <p className="text-green-900 font-bold text-lg">
              ${nfAR.format(profile.budget_min || 0)} - ${nfAR.format(profile.budget_max || 0)}
            </p>
          </div>
        </div>

        {/* Detalles Rápidos */}
        <div className="flex items-center gap-4 text-sm text-gray-700 mb-4 flex-wrap">
          {(profile.rooms_min || profile.rooms_max) && (
            <span className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              {profile.rooms_min || 0}-{profile.rooms_max || '∞'} amb
            </span>
          )}
          {(profile.bedroom_min || profile.bedroom_max) && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {profile.bedroom_min || 0}-{profile.bedroom_max || '∞'} dorm
            </span>
          )}
          {(profile.bathrooms_min || profile.bathrooms_max) && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {profile.bathrooms_min || 0}-{profile.bathrooms_max || '∞'} baños
            </span>
          )}
          {profile.lease_term_months && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {profile.lease_term_months} meses
            </span>
          )}
        </div>

        {/* Características Destacadas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.furnished && <Badge icon={<Sparkles />} label="Amoblado" color="blue" />}
          {profile.pets_allowed && <Badge icon={<Check />} label="Mascotas" color="green" />}
          {profile.parking_needed && <Badge icon={<Car />} label="Cochera" color="purple" />}
          {profile.balcony && <Badge icon={<Sun />} label="Balcón" color="yellow" />}
          {profile.terrace && <Badge icon={<Waves />} label="Terraza" color="teal" />}
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onViewDetail}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold"
          >
            <Eye className="w-4 h-4" />
            Ver Detalle
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold">
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    teal: 'bg-teal-100 text-teal-700 border-teal-300',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${colors[color as keyof typeof colors]}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
      {label}
    </span>
  );
}

function ProfileDetailModal({ profile, onClose }: { profile: TenantProfile; onClose: () => void }) {
  const cap = (s?: string) => s ? s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

  const BooleanBadge = ({ value, trueText = 'Sí', falseText = 'No' }: any) => {
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
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Perfil del Inquilino</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Información Personal */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Información Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-blue-700 font-semibold text-sm">Nombre:</span>
                <p className="text-blue-900 text-sm mt-1">{profile.full_name || 'No especificado'}</p>
              </div>
              {profile.occupants && (
                <div>
                  <span className="text-blue-700 font-semibold text-sm">Ocupantes:</span>
                  <p className="text-blue-900 text-sm mt-1">{profile.occupants} persona{profile.occupants > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ubicación */}
          {(profile.city || profile.neighborhood) && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Ubicación Deseada</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.city && (
                  <div>
                    <span className="text-purple-700 font-semibold text-sm">Ciudad:</span>
                    <p className="text-purple-900 text-sm mt-1">{cap(profile.city)}</p>
                  </div>
                )}
                {profile.neighborhood && (
                  <div>
                    <span className="text-purple-700 font-semibold text-sm">Barrio:</span>
                    <p className="text-purple-900 text-sm mt-1">{cap(profile.neighborhood)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Economía */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">Presupuesto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.budget_min && (
                <div>
                  <span className="text-green-700 font-semibold text-sm">Mínimo:</span>
                  <p className="text-green-900 font-bold text-lg">${nfAR.format(profile.budget_min)}</p>
                </div>
              )}
              {profile.budget_max && (
                <div>
                  <span className="text-green-700 font-semibold text-sm">Máximo:</span>
                  <p className="text-green-900 font-bold text-lg">${nfAR.format(profile.budget_max)}</p>
                </div>
              )}
              {profile.lease_term_months && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-semibold text-sm">Duración del contrato:</span>
                    <span className="text-green-900 text-sm">{profile.lease_term_months} meses</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Propiedad Buscada */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">Propiedad Buscada</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.property_types && profile.property_types.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-orange-700 font-semibold text-sm block mb-2">Tipos:</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.property_types.map(t => (
                      <span key={t} className="px-3 py-1.5 bg-orange-200 text-orange-800 rounded-lg text-xs font-medium">
                        {cap(t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.bedroom_min || profile.bedroom_max) && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700 font-semibold text-sm">Dormitorios:</span>
                  <span className="text-orange-900 text-sm">{profile.bedroom_min || 0} - {profile.bedroom_max || '∞'}</span>
                </div>
              )}
              {(profile.rooms_min || profile.rooms_max) && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700 font-semibold text-sm">Ambientes:</span>
                  <span className="text-orange-900 text-sm">{profile.rooms_min || 0} - {profile.rooms_max || '∞'}</span>
                </div>
              )}
              {(profile.bathrooms_min || profile.bathrooms_max) && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700 font-semibold text-sm">Baños:</span>
                  <span className="text-orange-900 text-sm">{profile.bathrooms_min || 0} - {profile.bathrooms_max || '∞'}</span>
                </div>
              )}
              {(profile.area_min || profile.area_max) && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700 font-semibold text-sm">Área (m²):</span>
                  <span className="text-orange-900 text-sm">{profile.area_min || 0} - {profile.area_max || '∞'}</span>
                </div>
              )}
              {profile.furnished !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 font-semibold text-sm">Amoblado:</span>
                  <BooleanBadge value={profile.furnished} />
                </div>
              )}
            </div>
          </div>

          {/* Preferencias del Inquilino */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Preferencias</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.pets_allowed !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-semibold text-sm">Mascotas:</span>
                  <BooleanBadge value={profile.pets_allowed} />
                </div>
              )}
              {profile.smokers_allowed !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-semibold text-sm">Fumadores:</span>
                  <BooleanBadge value={profile.smokers_allowed} />
                </div>
              )}
              {profile.children !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-semibold text-sm">Niños:</span>
                  <BooleanBadge value={profile.children} />
                </div>
              )}
              {profile.students !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-semibold text-sm">Estudiantes:</span>
                  <BooleanBadge value={profile.students} />
                </div>
              )}
              {profile.parking_needed !== undefined && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 font-semibold text-sm">Cochera:</span>
                  <BooleanBadge value={profile.parking_needed} trueText="Necesaria" falseText="Opcional" />
                </div>
              )}
              {profile.require_verified_landlord !== undefined && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 font-semibold text-sm">Propietario verificado:</span>
                  <BooleanBadge value={profile.require_verified_landlord} />
                </div>
              )}
            </div>
          </div>

          {/* Comodidades */}
          {(profile.amenities?.length || profile.balcony || profile.terrace || profile.laundry || profile.security || profile.elevator) && (
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-5 border border-teal-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wide">Comodidades Deseadas</h3>
              </div>
              {profile.amenities && profile.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.amenities.map(a => (
                      <span key={a} className="px-3 py-1.5 bg-teal-200 text-teal-800 rounded-lg text-xs font-medium">
                        {cap(a)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.balcony && (
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900 text-sm">Balcón</span>
                  </div>
                )}
                {profile.terrace && (
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900 text-sm">Terraza</span>
                  </div>
                )}
                {profile.laundry && (
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900 text-sm">Lavadero</span>
                  </div>
                )}
                {profile.security && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900 text-sm">Seguridad</span>
                  </div>
                )}
                {profile.elevator && (
                  <div className="flex items-center gap-2">
                    <MoveUp className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-900 text-sm">Ascensor</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas adicionales */}
          {(profile.metadata?.preferencias || profile.metadata?.notas) && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Notas Adicionales</h3>
              </div>
              <div className="space-y-3">
                {profile.metadata?.preferencias && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-semibold text-sm block mb-1">Preferencias:</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{profile.metadata.preferencias}</p>
                  </div>
                )}
                {profile.metadata?.notas && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-700 font-semibold text-sm block mb-1">Notas:</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{profile.metadata.notas}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fecha de creación */}
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

        {/* Footer con acciones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all font-semibold">
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
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12">
      <div className="flex flex-col items-center text-center">
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-full mb-6">
          <Users className="w-12 h-12 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron inquilinos</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Intenta ajustar los filtros de búsqueda para encontrar más perfiles que coincidan con tus criterios.
        </p>
      </div>
    </div>
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