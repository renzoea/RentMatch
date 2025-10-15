"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Home, MapPin, Calendar, DollarSign, BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import LocationSelector from "@/components/location-selector";

// Formato de dinero
const nfAR = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const moneyAR = (n: number) => `$${nfAR.format(n)}`;

// ============ Tipos ============
type TenantProfileCard = {
  id: string;
  initials: string;
  color: string;
  name: string;
  verified?: boolean;
  seenAgo: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  available: string;
  amb: number;
  dorm: number;
  bath: number;
  amenities: string[];
};

// ============ Filtros ============
type Filters = {
  property_types: string[];            // enum[]: departamento | ph | duplex | casa | estudio
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
  // enums reales de tu BD:
  visibility?: "publico" | "privado";
  status?: "activo" | "pausado" | "archivado";
  // filtro extra
  require_verified_landlord?: boolean;
  amenities: string[]; // ojo con tildes: deben coincidir con lo almacenado en DB
};

// ====== Enums y arrays EXACTOS según tu BD ======
const PROPERTY_TYPES = [
  { label: "Departamento", value: "departamento" },
  { label: "PH", value: "ph" },
  { label: "Dúplex", value: "duplex" },
  { label: "Casa", value: "casa" },
  { label: "Estudio", value: "estudio" },
];

const VISIBILITIES: { label: string; value: Filters["visibility"] }[] = [
  { label: "Público", value: "publico" },
  { label: "Privado", value: "privado" },
];

const STATUSES: { label: string; value: Filters["status"] }[] = [
  { label: "Activo", value: "activo" },
  { label: "Pausado", value: "pausado" },
  { label: "Archivado", value: "archivado" },
];

// Asegurate que estos strings coincidan 1:1 con lo que guardás en tenant_search_profiles.amenities
const AMENITIES = ["balcón", "pileta", "terraza", "amoblado", "cochera", "acepta mascotas"];

const DURACIONES = ["6", "12", "18", "24"];

// ==================== COMPONENTE ====================
export default function PropietarioHomePage() {
  const [filters, setFilters] = useState<Filters>({
    property_types: [],
    amenities: [],
  });

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<TenantProfileCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ---------- Helpers ----------
  const setNumber = (key: keyof Filters, v: string) =>
    setFilters((f) => ({ ...f, [key]: v ? Number(v) : undefined }));

  const toggleBoolean = (key: keyof Filters) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  const toggleAmenity = (amenity: string) =>
    setFilters((f) => {
      const has = f.amenities?.includes(amenity);
      const next = has ? f.amenities.filter((a) => a !== amenity) : [...(f.amenities || []), amenity];
      return { ...f, amenities: next };
    });

  const setSelectOrPush = (arrKey: keyof Filters, value: string) =>
    setFilters((f) => {
      if (!value) return { ...f, [arrKey]: [] };
      return { ...f, [arrKey]: [value] };
    });

  const handleCityChange = (city: string) => setFilters((f) => ({ ...f, city, neighborhood: "" }));
  const handleNeighborhoodChange = (neighborhood: string) => setFilters((f) => ({ ...f, neighborhood }));

  const clearFilters = () =>
    setFilters({
      property_types: [],
      amenities: [],
      // no seteamos enums/booleanos para que no filtren
    });

  // ---------- Adaptador de datos ----------
  const adapt = (row: Record<string, unknown>): TenantProfileCard => {
    const name = (row.full_name as string) || "Inquilino/a";
    const initials =
      name
        .split(" ")
        .map((s: string) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("") || "IN";

    const propertyType = Array.isArray(row.property_types) 
      ? (row.property_types as string[]).join(", ") 
      : "—";

    const location = [row.neighborhood as string, row.city as string].filter(Boolean).join(", ");

    return {
      id: (row.id as string) || crypto.randomUUID(),
      initials,
      color: "bg-orange-500",
      name,
      // si querés mostrar “verificado” cuando el perfil pide propietario verificado:
      verified: !!row.require_verified_landlord,
      seenAgo: "—",
      propertyType,
      budgetMin: Number(row.budget_min ?? 0),
      budgetMax: Number(row.budget_max ?? 0),
      location: location || "—",
      available: "—",
      amb: Number(row.rooms_max ?? row.rooms_min ?? 0),
      dorm: Number(row.bedroom_max ?? row.bedroom_min ?? 0),
      bath: Number(row.bathrooms_max ?? row.bathrooms_min ?? 0),
      amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
    };
  };

  // ---------- Fetch usando axios (api) ----------
  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");

      // Limpiar filtros vacíos y preparar el body
      const cleanFilters: Record<string, string | number | boolean | string[]> = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value === "") return;
        if (Array.isArray(value) && value.length === 0) return;
        // Evitar mandar booleanos false (no filtrar)
        if (typeof value === "boolean" && value === false) return;
        cleanFilters[key] = value as string | number | boolean | string[];
      });

      const response = await api.post("/api/filter-search/advanced/", cleanFilters, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setList(rows.map(adapt));
    } catch (e: unknown) {
      if (typeof e === "object" && e !== null) {
        const err = e as { response?: { data?: { error?: string } }; message?: string };
        setError(err?.response?.data?.error || err?.message || "Error al buscar");
      } else {
        setError("Error al buscar");
      }
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda inicial
  useEffect(() => {
    search();
  }, []);

  // Si activás "Solo verificados" (local)
  const finalList = useMemo(() => {
    if (filters.require_verified_landlord) {
      return list.filter((p) => p.verified);
    }
    return list;
  }, [list, filters.require_verified_landlord]);

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-5">
      {/* Título */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Perfiles de Inquilinos</h1>
        <p className="text-gray-600">Encontrá inquilinos ideales para tus propiedades</p>
      </div>

      {/* Filtros */}
      <section className="mb-4">
        <div className="bg-white border border-gray-300 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-gray-700" />
            <h2 className="font-bold text-lg">Filtros de Búsqueda</h2>
            <Button
              variant="secondary"
              className="ml-auto bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 rounded-md"
              onClick={search}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
                </span>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Selects principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectBox
              label="Tipo de Propiedad"
              value={filters.property_types[0] || ""}
              onChange={(v) => setSelectOrPush("property_types", v)}
              options={["", ...PROPERTY_TYPES.map((pt) => pt.value)]}
              placeholder="Todos los tipos"
            />

            <div className="sm:col-span-2 lg:col-span-2">
              <LocationSelector
                selectedCity={filters.city}
                selectedNeighborhood={filters.neighborhood}
                onCityChange={handleCityChange}
                onNeighborhoodChange={handleNeighborhoodChange}
              />
            </div>

            {/* NUEVOS selects alineados con enums de tu BD */}
            <SelectBox
              label="Visibilidad"
              value={filters.visibility ?? ""}
              onChange={(v) =>
                setFilters((f) => ({ ...f, visibility: (v || undefined) as Filters["visibility"] }))
              }
              options={["", ...VISIBILITIES.map((v) => v.value!)]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Estado del perfil"
              value={filters.status ?? ""}
              onChange={(v) =>
                setFilters((f) => ({ ...f, status: (v || undefined) as Filters["status"] }))
              }
              options={["", ...STATUSES.map((s) => s.value!)]}
              placeholder="Cualquiera"
            />

            <SelectBox
              label="Presupuesto Mínimo"
              value={String(filters.budget_min ?? "")}
              onChange={(v) => setNumber("budget_min", v)}
              options={["", "200000", "400000", "600000", "800000", "1000000"]}
              placeholder="Ej: $400.000"
            />
            <SelectBox
              label="Presupuesto Máximo"
              value={String(filters.budget_max ?? "")}
              onChange={(v) => setNumber("budget_max", v)}
              options={["", "400000", "600000", "800000", "1000000", "1500000"]}
              placeholder="Ej: $800.000"
            />
            <SelectBox
              label="Ambientes (mín)"
              value={String(filters.rooms_min ?? "")}
              onChange={(v) => setNumber("rooms_min", v)}
              options={["", "1", "2", "3", "4", "5"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Ambientes (máx)"
              value={String(filters.rooms_max ?? "")}
              onChange={(v) => setNumber("rooms_max", v)}
              options={["", "1", "2", "3", "4", "5"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Dormitorios (mín)"
              value={String(filters.bedroom_min ?? "")}
              onChange={(v) => setNumber("bedroom_min", v)}
              options={["", "0", "1", "2", "3", "4"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Dormitorios (máx)"
              value={String(filters.bedroom_max ?? "")}
              onChange={(v) => setNumber("bedroom_max", v)}
              options={["", "0", "1", "2", "3", "4"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Baños (mín)"
              value={String(filters.bathrooms_min ?? "")}
              onChange={(v) => setNumber("bathrooms_min", v)}
              options={["", "1", "2", "3"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Baños (máx)"
              value={String(filters.bathrooms_max ?? "")}
              onChange={(v) => setNumber("bathrooms_max", v)}
              options={["", "1", "2", "3"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Superficie mínima (m²)"
              value={String(filters.area_min ?? "")}
              onChange={(v) => setNumber("area_min", v)}
              options={["", "20", "30", "40", "50", "60", "80", "100"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Superficie máxima (m²)"
              value={String(filters.area_max ?? "")}
              onChange={(v) => setNumber("area_max", v)}
              options={["", "30", "40", "50", "60", "80", "100", "150"]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Duración (meses)"
              value={String(filters.lease_term_months ?? "")}
              onChange={(v) => setNumber("lease_term_months", v)}
              options={["", ...DURACIONES]}
              placeholder="Cualquiera"
            />
            <SelectBox
              label="Ocupantes"
              value={String(filters.occupants ?? "")}
              onChange={(v) => setNumber("occupants", v)}
              options={["", "1", "2", "3", "4", "5", "6"]}
              placeholder="Cualquiera"
            />
          </div>

          {/* Booleanos */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <BoolChip label="Amoblado" checked={!!filters.furnished} onChange={() => toggleBoolean("furnished")} />
            <BoolChip label="Acepta mascotas" checked={!!filters.pets_allowed} onChange={() => toggleBoolean("pets_allowed")} />
            <BoolChip label="Permite fumadores" checked={!!filters.smokers_allowed} onChange={() => toggleBoolean("smokers_allowed")} />
            <BoolChip label="Niños" checked={!!filters.children} onChange={() => toggleBoolean("children")} />
            <BoolChip label="Estudiantes" checked={!!filters.students} onChange={() => toggleBoolean("students")} />
            <BoolChip label="Necesita cochera" checked={!!filters.parking_needed} onChange={() => toggleBoolean("parking_needed")} />
            <BoolChip label="Balcón" checked={!!filters.balcony} onChange={() => toggleBoolean("balcony")} />
            <BoolChip label="Terraza" checked={!!filters.terrace} onChange={() => toggleBoolean("terrace")} />
            <BoolChip label="Laundry" checked={!!filters.laundry} onChange={() => toggleBoolean("laundry")} />
            <BoolChip label="Ascensor" checked={!!filters.elevator} onChange={() => toggleBoolean("elevator")} />
            <BoolChip label="Seguridad" checked={!!filters.security} onChange={() => toggleBoolean("security")} />
          </div>

          {/* Amenities */}
          <div className="mt-3">
            <p className="text-sm text-gray-700 mb-2">Comodidades</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const active = filters.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-2 py-1 rounded-md border text-xs ${
                      active ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-gray-50 text-gray-700 border-gray-300"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, require_verified_landlord: !f.require_verified_landlord }))
              }
              className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
                filters.require_verified_landlord
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              Solo perfiles verificados
            </button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" className="h-9" onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9" onClick={search} disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
                  </span>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        {loading && finalList.length === 0 && <SkeletonCards />}

        {!loading && finalList.length === 0 && (
          <div className="text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg p-6 text-center">
            No encontramos perfiles con esos filtros. Probá ampliando la búsqueda.
          </div>
        )}

        {finalList.map((p) => (
          <Card key={p.id} className="border-gray-300">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${p.color} text-white flex items-center justify-center font-bold`}>
                    {p.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      {p.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="h-3 w-3" /> Verificado
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{p.seenAgo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-800">
                <Row icon={<Home className="h-4 w-4 text-gray-700" />} text={p.propertyType} />
                <Row icon={<DollarSign className="h-4 w-4 text-gray-700" />} text={`${moneyAR(p.budgetMin)} – ${moneyAR(p.budgetMax)}`} />
                <Row icon={<MapPin className="h-4 w-4 text-red-500" />} text={p.location} />
                <Row icon={<Calendar className="h-4 w-4 text-gray-700" />} text={p.available} />
                <div className="col-span-2 text-gray-700">
                  <span className="mr-3">{p.amb} amb.</span>
                  <span className="mr-3">{p.dorm} dorm.</span>
                  <span>
                    {p.bath} baño{p.bath > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-gray-100 rounded-lg border text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button className="bg-[#25D366] hover:opacity-90 text-white">Whatsapp</Button>
                <Button variant="outline" className="border-gray-300">
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

/* ==== Subcomponentes ==== */
function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="text-sm">
      <span className="block text-gray-700 mb-1">{label}</span>
      <select
        className="w-full h-10 rounded-md border border-gray-300 px-3 text-gray-800 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options
          .filter((o) => o !== "")
          .map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
      </select>
    </label>
  );
}

function BoolChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`px-3 py-1.5 rounded-md border text-xs font-semibold ${
        checked ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-gray-100 text-gray-700 border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded col-span-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
