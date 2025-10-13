"use client";

import { useState } from "react";
import {
  Filter, Home, MapPin, Calendar, DollarSign, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TenantProfile = {
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

const MOCK_PROFILES: TenantProfile[] = [
  {
    id: "1",
    initials: "MR",
    color: "bg-orange-500",
    name: "María González Rodríguez",
    verified: true,
    seenAgo: "hace 3 días",
    propertyType: "Departamento",
    budgetMin: 400000,
    budgetMax: 600000,
    location: "Palermo, Belgrano",
    available: "Agosto 2025",
    amb: 2, dorm: 1, bath: 1,
    amenities: ["Balcón", "Pileta", "Cochera"],
  },
  {
    id: "2",
    initials: "CM",
    color: "bg-orange-600",
    name: "Carlos Martínez",
    verified: true,
    seenAgo: "hace 1 semana",
    propertyType: "Casa",
    budgetMin: 800000,
    budgetMax: 1200000,
    location: "San Isidro, Martínez",
    available: "Septiembre 2025",
    amb: 4, dorm: 3, bath: 2,
    amenities: ["Jardín", "Terraza", "Cochera"],
  },
  {
    id: "3",
    initials: "AL",
    color: "bg-orange-400",
    name: "Ana López",
    seenAgo: "hace 5 días",
    propertyType: "Departamento",
    budgetMin: 600000,
    budgetMax: 900000,
    location: "Recoleta",
    available: "Septiembre 2025",
    amb: 3, dorm: 2, bath: 2,
    amenities: ["Balcón", "Amoblado"],
  },
  {
    id: "4",
    initials: "CL",
    color: "bg-orange-700",
    name: "Carlos López",
    seenAgo: "hace 5 días",
    propertyType: "Departamento",
    budgetMin: 300000,
    budgetMax: 400000,
    location: "San Telmo",
    available: "Octubre 2025",
    amb: 1, dorm: 1, bath: 1,
    amenities: ["Acepta mascotas"],
  },
];

// ⬆️ Fuera del componente, al tope del archivo
const nfAR = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const moneyAR = (n: number) => `$${nfAR.format(n)}`;


export default function PropietarioHomePage() {
  const [onlyVerified, setOnlyVerified] = useState(false);

  const list = onlyVerified ? MOCK_PROFILES.filter(p => p.verified) : MOCK_PROFILES;

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-5">
      {/* Título */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Perfiles de Inquilinos</h1>
        <p className="text-gray-600">Encuentra inquilinos ideales para tus propiedades</p>
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
            >
              Más filtros
            </Button>
          </div>

          {/* Row selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectBox label="Tipo de Propiedad" placeholder="Todos los tipos" />
            <SelectBox label="Ubicación" placeholder="Todas las zonas" />
            <SelectBox label="Presupuestos Mínimo" placeholder="Ej: $400.000" />
            <SelectBox label="Presupuestos Máximo" placeholder="Ej: $800.000" />
            <SelectBox label="Ambientes" placeholder="Cualquiera" />
            <SelectBox label="Dormitorios" placeholder="Cualquiera" />
            <SelectBox label="Baños" placeholder="Cualquiera" />
            <SelectBox label="Duración Contrato" placeholder="Cualquiera" />
          </div>

          {/* Comodidades */}
          <div className="mt-3">
            <p className="text-sm text-gray-700 mb-2">Comodidades</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {["Balcón", "Pileta", "Terraza", "Amoblado", "Cochera", "Acepta mascotas"].map((c) => (
                <label key={c} className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Acciones filtros */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setOnlyVerified(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
                onlyVerified
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              Solo perfiles verificados
            </button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" className="h-9">Limpiar filtros</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9">Buscar</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        {list.map((p) => (
          <Card key={p.id} className="border-gray-300">
            <CardContent className="p-4">
              {/* Header card */}
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

              {/* Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-800">
                <Row icon={<Home className="h-4 w-4 text-gray-700" />} text={p.propertyType} />
                <Row
  icon={<DollarSign className="h-4 w-4 text-gray-700" />}
  text={`${moneyAR(p.budgetMin)} – ${moneyAR(p.budgetMax)}`}
/>

                <Row icon={<MapPin className="h-4 w-4 text-red-500" />} text={p.location} />
                <Row icon={<Calendar className="h-4 w-4 text-gray-700" />} text={p.available} />
                <div className="col-span-2 text-gray-700">
                  <span className="mr-3">{p.amb} amb.</span>
                  <span className="mr-3">{p.dorm} dorm.</span>
                  <span>{p.bath} baño{p.bath > 1 ? "s" : ""}</span>
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-gray-100 rounded-lg border text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button className="bg-[#25D366] hover:opacity-90 text-white">
                  Whatsapp
                </Button>
                <Button variant="outline" className="border-gray-300">
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load more */}
        <div className="flex justify-center pt-2">
          <Button variant="outline" className="rounded-full border-gray-300">
            Cargar más perfiles
          </Button>
        </div>
      </section>
    </div>
  );
}

/* Helpers */
function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function SelectBox({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-700 mb-1">{label}</span>
      <select className="w-full h-10 rounded-md border border-gray-300 px-3 text-gray-800 bg-white">
        <option value="">{placeholder}</option>
      </select>
    </label>
  );
}
