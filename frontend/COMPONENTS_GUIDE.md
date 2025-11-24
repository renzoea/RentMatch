# Guía de Componentes de RentMatch

Esta guía documenta los componentes estandarizados creados para mantener consistencia visual en toda la aplicación.

## 🎨 Componentes Disponibles

### 1. StatusBadge

Badge estandarizado para mostrar estados en toda la aplicación.

**Uso:**
```tsx
import { StatusBadge } from '@/components/ui/status-badge'

<StatusBadge variant="active">Activo</StatusBadge>
<StatusBadge variant="paused">Pausado</StatusBadge>
<StatusBadge variant="verified">Verificado</StatusBadge>
<StatusBadge variant="pending">Pendiente</StatusBadge>
<StatusBadge variant="error">Error</StatusBadge>
```

**Variantes disponibles:**
- `active` - Verde para perfiles/contratos activos
- `paused` - Amarillo para perfiles pausados
- `archived` - Gris para elementos archivados
- `verified` - Verde claro para verificaciones exitosas
- `pending` - Naranja para elementos pendientes
- `error` - Rojo para errores/rechazos
- `success` - Verde oscuro para operaciones exitosas
- `warning` - Amarillo oscuro para advertencias

---

### 2. EmptyState

Componente para mostrar estados vacíos de manera consistente.

**Uso:**
```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { Search } from 'lucide-react'

<EmptyState
  icon={Search}
  title="No tienes perfiles de búsqueda"
  description="Crea tu primer perfil para que podamos ayudarte a encontrar la propiedad perfecta"
  action={{
    label: "Crear Primer Perfil",
    onClick: () => router.push('/home/inquilino/crear')
  }}
/>
```

**Props:**
- `icon` - Icono de Lucide React
- `title` - Título del estado vacío
- `description` - Descripción detallada
- `action` - (Opcional) Objeto con `label` y `onClick` para botón de acción

---

### 3. LoadingState & Skeleton

Componentes para mostrar estados de carga.

**LoadingState básico:**
```tsx
import { LoadingState } from '@/components/ui/skeleton'

<LoadingState message="Cargando perfiles..." />
```

**LoadingState con skeletons:**
```tsx
<LoadingState
  message="Cargando perfiles..."
  type="profile"
  count={3}
/>

<LoadingState
  message="Cargando contratos..."
  type="contract"
  count={2}
/>
```

**Skeleton manual:**
```tsx
import { Skeleton, ProfileCardSkeleton, ContractCardSkeleton } from '@/components/ui/skeleton'

<ProfileCardSkeleton />
<ContractCardSkeleton />
<Skeleton className="h-4 w-32" />
```

---

### 4. Card (Estandarizado)

Sistema de tarjetas consistente con tamaños predefinidos.

**Uso básico:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card-standard'

<Card size="md" hover>
  <CardHeader>
    <CardTitle>Título de la Tarjeta</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido de la tarjeta</p>
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

**Props de Card:**
- `size` - `'sm' | 'md' | 'lg'` (default: 'md')
  - sm: padding 16px
  - md: padding 24px
  - lg: padding 32px
- `hover` - Boolean para agregar efecto hover (shadow)

---

### 5. Button (Actualizado)

Componente Button con nueva variante primary para RentMatch.

**Uso:**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary">Botón Principal</Button>
<Button variant="secondary">Botón Secundario</Button>
<Button variant="outline">Botón con Borde</Button>
<Button variant="ghost">Botón Ghost</Button>
<Button variant="destructive">Botón Destructivo</Button>
```

**Variantes:**
- `primary` - **NUEVO**: Naranja (orange-500/600) para acciones principales
- `default` - Negro por defecto
- `secondary` - Gris claro
- `outline` - Con borde
- `ghost` - Sin fondo
- `destructive` - Rojo para acciones peligrosas
- `link` - Estilo de enlace

**Tamaños:**
- `sm` - Pequeño (height: 32px)
- `default` - Normal (height: 36px)
- `lg` - Grande (height: 40px)
- `icon` - Cuadrado para iconos

---

### 6. InputEnhanced

Input con validación visual y mensajes de error.

**Uso:**
```tsx
import { InputEnhanced } from '@/components/ui/input-enhanced'

<InputEnhanced
  label="Correo Electrónico"
  placeholder="tu@email.com"
  helperText="Ingresa un correo válido"
  required
/>

<InputEnhanced
  label="Contraseña"
  type="password"
  error="La contraseña debe tener al menos 8 caracteres"
/>

<InputEnhanced
  label="Nombre"
  success
  showValidation
  helperText="Nombre válido"
/>
```

**Props:**
- `label` - Etiqueta del campo
- `helperText` - Texto de ayuda (gris)
- `error` - Mensaje de error (rojo, con icono)
- `success` - Booleano para estado exitoso
- `showValidation` - Muestra icono de check verde cuando success=true
- `required` - Agrega asterisco rojo al label
- Todos los props estándar de `<input>`

---

## 🎯 Tipografía Estandarizada

La jerarquía tipográfica está definida en `globals.css`:

```tsx
<h1>Título Principal</h1>      // text-4xl → text-5xl (md) → text-6xl (lg)
<h2>Título Secundario</h2>     // text-3xl → text-4xl (md)
<h3>Título Terciario</h3>      // text-2xl
<h4>Subtítulo Grande</h4>      // text-xl
<h5>Subtítulo Mediano</h5>     // text-lg
<h6>Subtítulo Pequeño</h6>     // text-base
<p>Texto de párrafo</p>        // text-base, line-height: 1.6
```

**Responsivo automático**: Los títulos H1 y H2 crecen automáticamente en tablets y desktop.

---

## 📐 Sistema de Colores

### Colores Principales
- **Primary**: `orange-500` / `orange-600` (hover)
- **Success**: `green-600` / `emerald-600`
- **Warning**: `amber-600` / `yellow-600`
- **Error**: `red-600`
- **Neutral**: `gray-600` / `gray-700`

### Backgrounds de Estado
- **Active**: `green-100` con texto `green-700`
- **Paused**: `yellow-100` con texto `yellow-700`
- **Archived**: `gray-100` con texto `gray-700`
- **Verified**: `emerald-100` con texto `emerald-700`
- **Pending**: `orange-100` con texto `orange-700`
- **Error**: `red-100` con texto `red-700`

---

## ✨ Mejores Prácticas

### 1. Estados Vacíos
**Siempre usa `EmptyState` en lugar de divs custom:**
```tsx
// ❌ Evitar
<div className="text-center py-8">
  <p>No hay datos</p>
</div>

// ✅ Usar
<EmptyState
  icon={Inbox}
  title="No hay datos"
  description="Descripción detallada"
/>
```

### 2. Loading States
**Usa skeleton loaders en lugar de spinners genéricos:**
```tsx
// ❌ Evitar (para listas)
{loading && <div>Cargando...</div>}

// ✅ Usar
{loading && <LoadingState type="profile" count={3} message="Cargando perfiles..." />}
```

### 3. Status Badges
**Usa StatusBadge estandarizado:**
```tsx
// ❌ Evitar
<span className="bg-green-100 text-green-700 px-2 py-1 rounded">Activo</span>

// ✅ Usar
<StatusBadge variant="active">Activo</StatusBadge>
```

### 4. Botones
**Usa la variante `primary` para acciones principales:**
```tsx
// ❌ Evitar
<button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
  Guardar
</button>

// ✅ Usar
<Button variant="primary">Guardar</Button>
```

### 5. Tarjetas
**Usa el sistema Card estandarizado:**
```tsx
// ❌ Evitar
<div className="bg-white p-6 rounded-xl shadow-sm border">
  ...
</div>

// ✅ Usar
<Card size="md" hover>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

---

## 🔄 Migración de Páginas Existentes

### Checklist para actualizar una página:

- [ ] Reemplazar spinners con `<LoadingState>` o skeletons
- [ ] Reemplazar divs vacíos con `<EmptyState>`
- [ ] Reemplazar badges custom con `<StatusBadge>`
- [ ] Usar `<Button variant="primary">` para botones principales
- [ ] Usar `<Card>` en lugar de divs con clases custom
- [ ] Usar `<InputEnhanced>` en formularios
- [ ] Verificar que títulos usen etiquetas semánticas (h1-h6)
- [ ] Revisar consistencia de colores con el sistema definido

---

## 📱 Responsividad

Todos los componentes son responsive por defecto:
- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Los componentes Card, EmptyState y LoadingState se adaptan automáticamente.

---

## 🎨 Ejemplo Completo

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-standard'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function ExamplePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  if (loading) {
    return <LoadingState type="profile" count={3} message="Cargando datos..." />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No hay datos disponibles"
        description="Crea tu primer elemento para comenzar"
        action={{
          label: "Crear Elemento",
          onClick: () => console.log('Crear')
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {data.map(item => (
        <Card key={item.id} hover>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{item.title}</CardTitle>
              <StatusBadge variant={item.status}>
                {item.statusLabel}
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent>
            <p>{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

Esta guía será actualizada a medida que se agreguen nuevos componentes al sistema de diseño.
