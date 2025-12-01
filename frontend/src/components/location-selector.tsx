'use client'

import { useMemo } from 'react'

interface LocationData {
  [city: string]: string[]
}

// Datos de ciudades y barrios de Argentina
const ARGENTINA_LOCATIONS: LocationData = {
  'Buenos Aires': [
    'Palermo',
    'Recoleta',
    'Belgrano',
    'Caballito',
    'Villa Crespo',
    'Almagro',
    'Villa Urquiza',
    'Núñez',
    'Colegiales',
    'San Telmo',
    'Puerto Madero',
    'Barrio Norte',
    'Microcentro',
    'Retiro',
    'Balvanera',
    'Flores',
    'Parque Patricios',
    'La Boca',
    'Constitución',
    'Montserrat'
  ],
  'Córdoba': [
    'Nueva Córdoba',
    'General Paz',
    'Cerro de las Rosas',
    'Güemes',
    'Alto Alberdi',
    'Urca',
    'Centro',
    'Jardín',
    'Cofico',
    'San Vicente'
  ],
  'Rosario': [
    'Centro',
    'Pichincha',
    'Echesortu',
    'Fisherton',
    'Alberdi',
    'Parque Independencia',
    'Barrio Martín',
    'Lisandro de la Torre',
    'Remedios de Escalada'
  ],
  'Mendoza': [
    'Centro',
    'Quinta Sección',
    'Sexta Sección',
    'Bombal',
    'Dorrego',
    'San Martín',
    'Las Heras',
    'Godoy Cruz',
    'Guaymallén'
  ],
  'La Plata': [
    'Centro',
    'Casco Urbano',
    'Villa Elvira',
    'Los Hornos',
    'Tolosa',
    'Gonnet',
    'City Bell',
    'Ringuelet'
  ],
  'San Miguel de Tucumán': [
    'Centro',
    'Yerba Buena',
    'San Javier',
    'Villa Mariano Moreno',
    'Barrio Norte',
    'Barrio Sur'
  ],
  'Mar del Plata': [
    'Centro',
    'Güemes',
    'La Perla',
    'Playa Grande',
    'Los Troncos',
    'Constitución',
    'Punta Mogotes'
  ],
  'Salta': [
    'Centro',
    'Tres Cerritos',
    'Grand Bourg',
    'Villa Las Rosas',
    'Castañares',
    'Portezuelo'
  ],
  'Santa Fe': [
    'Centro',
    'Candioti',
    'Guadalupe',
    'Barranquitas',
    'Alto Verde',
    'Recreo'
  ],
  'San Juan': [
    'Centro',
    'Desamparados',
    'Rivadavia',
    'Santa Lucía',
    'Trinidad',
    'Pocito'
  ]
}

interface LocationSelectorProps {
  selectedCity?: string
  selectedNeighborhood?: string
  onCityChange: (city: string) => void
  onNeighborhoodChange: (neighborhood: string) => void
  required?: boolean
  className?: string
}

export default function LocationSelector({
  selectedCity,
  selectedNeighborhood,
  onCityChange,
  onNeighborhoodChange,
  required = false,
  className = ''
}: LocationSelectorProps) {
  const cities = useMemo(() => Object.keys(ARGENTINA_LOCATIONS).sort(), [])
  
  const neighborhoods = useMemo(() => {
    if (!selectedCity) return []
    return ARGENTINA_LOCATIONS[selectedCity] || []
  }, [selectedCity])

  const handleCityChange = (city: string) => {
    onCityChange(city)
    // Reset neighborhood when city changes
    onNeighborhoodChange('')
  }

  return (
    <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="text-xs font-semibold text-blue-700 block mb-2">
          Ciudad {required && '*'}
        </label>
        <select
          className="w-full rounded-lg border-2 border-blue-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          value={selectedCity || ''}
          onChange={e => handleCityChange(e.target.value)}
          required={required}
        >
          <option value="">Seleccionar ciudad...</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-blue-700 block mb-2">
          Barrio {!selectedCity && <span className="text-gray-400 font-normal">(primero selecciona ciudad)</span>}
        </label>
        <select
          className="w-full rounded-lg border-2 border-blue-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
          value={selectedNeighborhood || ''}
          onChange={e => onNeighborhoodChange(e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">Seleccionar barrio...</option>
          {neighborhoods.map(neighborhood => (
            <option key={neighborhood} value={neighborhood}>
              {neighborhood}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}