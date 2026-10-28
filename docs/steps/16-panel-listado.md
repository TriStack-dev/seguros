# Step 16 — Listado de leads

**Etapa:** 4. Panel · **Depende de:** 10, 15 · **Leer:** `docs/reglas-negocio.md` secciones 4, 5 y 6

## Objetivo

Que los brokers vean todos los leads en una tabla con búsqueda, filtros y paginación, y detecten rápido los nuevos y los posibles duplicados.

## Tareas

- [x] Script de desarrollo `pnpm db:seed:leads` (`scripts/seed-dev-leads.ts`) que crea ~200 leads ficticios variados (tipos, estados con su historial, fechas de los últimos 90 días, atribuciones). Se niega a correr si `DATABASE_URL` apunta a producción (verificar por una variable `APP_ENV` o por el host).
- [x] `src/server/queries/leads.ts`: `listLeads({ search, from, to, vehicleType, status, page })` con Prisma, paginación de 25 por página y orden por fecha descendente. Llama a `requireAdmin()`.
- [x] Búsqueda por nombre (contiene, sin distinguir mayúsculas), DNI, teléfono (normalizado), patente (normalizada) y número de solicitud (`parseRequestNumber` del step 10).
- [x] Filtros: rango de fechas (en hora de Argentina), tipo de vehículo y estado. Todos los filtros y la página viven en la URL (`searchParams`), así se pueden compartir y recargar.
- [x] Página `/admin/leads` (Server Component) con el componente `table` de shadcn/ui. Columnas: fecha y hora, número de solicitud, nombre, teléfono (formato de visualización), tipo, marca y modelo, código postal, estado (badge de color por estado).
- [x] Marca "Posible duplicado" según la sección 6 (resolver en la consulta, no lead por lead).
- [x] Contador de leads en estado `NEW` visible en la navegación del panel.
- [x] Cada fila enlaza a `/admin/leads/[id]` (el detalle es el step 17; por ahora puede ser un placeholder).
- [x] Estado vacío ("No hay leads con estos filtros") y diseño usable en tablet y celular (columnas secundarias ocultas en pantallas chicas).

## Criterios de aceptación

- Con los leads de prueba, buscar por DNI, teléfono con o sin 0/15, patente con espacios y `MS-000123` encuentra el lead correcto.
- Los filtros se combinan y quedan en la URL.
- La página carga en menos de 1 segundo con 200 leads en staging.

## Fuera de alcance

- Exportar CSV (step 19). Cambiar estados (step 17).

## Notas de implementación

- **Qué se hizo:**
  - Se agregó el script de desarrollo `pnpm db:seed:leads` (`scripts/seed-dev-leads.ts`) que crea ~200 leads ficticios con protección para no correr contra producción.
  - Se implementó `src/server/queries/leads.ts` con `listLeads` (búsqueda, filtros, paginación 25, orden por fecha desc) y `countNewLeads`. La búsqueda acepta nombre, DNI, teléfono, patente y número de solicitud vía `parseRequestNumber`. Los filtros y la página viven en la URL.
  - Se marcó "Posible duplicado" cuando existe otro lead con mismo teléfono o DNI creado en los 30 días anteriores.
  - Se creó el listado en `/admin/leads` con filtros, tabla responsive, badges por estado, contador de `NEW` en la navegación y enlace al detalle.
  - Se agregó un placeholder en `/admin/leads/[id]`.

- **Archivos clave:**
  - `scripts/seed-dev-leads.ts`
  - `package.json`
  - `src/server/queries/leads.ts`
  - `src/app/admin/(protected)/layout.tsx`
  - `src/app/admin/(protected)/leads/page.tsx`
  - `src/app/admin/(protected)/leads/[id]/page.tsx`
  - `src/components/admin/leads/leads-table.tsx`
  - `src/components/admin/leads/leads-filters.tsx`
  - `src/components/admin/leads/pagination.tsx`
  - `src/components/ui/table.tsx`
  - `src/components/ui/badge.tsx`

- **Decisiones:**
  - El filtro de fechas se interpreta en hora de Argentina (UTC-3) para filtrar por día calendario.
  - El conteo de duplicados se resuelve por consulta (por lead en la página) según lo indicado en el step.

- **Desvíos del spec:**
  - Ninguno.

- **Cómo probarlo:**
  1. Configurar base local y correr migraciones si hace falta.
  2. Correr `pnpm db:seed:leads` para poblar leads de prueba.
  3. Ir a `/admin/leads` como admin, probar búsqueda por DNI, teléfono con/sin 0/15, patente con espacios, `MS-000123`.
  4. Probar filtros combinados (fechas, tipo, estado) y paginación; verificar que queden en la URL.
  5. Verificar contador de "Nuevo" en la navegación y marca "Posible duplicado".

- **Pendientes:**
  - Ninguno.
