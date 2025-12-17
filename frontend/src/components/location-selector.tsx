'use client'

import { useMemo } from 'react'
import { ARGENTINA_LOCATIONS } from '@/constants/locations'

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