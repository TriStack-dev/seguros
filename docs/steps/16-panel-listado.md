# Step 16 — Listado de leads

**Etapa:** 4. Panel · **Depende de:** 10, 15 · **Leer:** `docs/reglas-negocio.md` secciones 4, 5 y 6

## Objetivo

Que los brokers vean todos los leads en una tabla con búsqueda, filtros y paginación, y detecten rápido los nuevos y los posibles duplicados.

## Tareas

- [ ] Script de desarrollo `pnpm db:seed:leads` (`scripts/seed-dev-leads.ts`) que crea ~200 leads ficticios variados (tipos, estados con su historial, fechas de los últimos 90 días, atribuciones). Se niega a correr si `DATABASE_URL` apunta a producción (verificar por una variable `APP_ENV` o por el host).
- [ ] `src/server/queries/leads.ts`: `listLeads({ search, from, to, vehicleType, status, page })` con Prisma, paginación de 25 por página y orden por fecha descendente. Llama a `requireAdmin()`.
- [ ] Búsqueda por nombre (contiene, sin distinguir mayúsculas), DNI, teléfono (normalizado), patente (normalizada) y número de solicitud (`parseRequestNumber` del step 10).
- [ ] Filtros: rango de fechas (en hora de Argentina), tipo de vehículo y estado. Todos los filtros y la página viven en la URL (`searchParams`), así se pueden compartir y recargar.
- [ ] Página `/admin/leads` (Server Component) con el componente `table` de shadcn/ui. Columnas: fecha y hora, número de solicitud, nombre, teléfono (formato de visualización), tipo, marca y modelo, código postal, estado (badge de color por estado).
- [ ] Marca "Posible duplicado" según la sección 6 (resolver en la consulta, no lead por lead).
- [ ] Contador de leads en estado `NEW` visible en la navegación del panel.
- [ ] Cada fila enlaza a `/admin/leads/[id]` (el detalle es el step 17; por ahora puede ser un placeholder).
- [ ] Estado vacío ("No hay leads con estos filtros") y diseño usable en tablet y celular (columnas secundarias ocultas en pantallas chicas).

## Criterios de aceptación

- Con los leads de prueba, buscar por DNI, teléfono con o sin 0/15, patente con espacios y `MS-000123` encuentra el lead correcto.
- Los filtros se combinan y quedan en la URL.
- La página carga en menos de 1 segundo con 200 leads en staging.

## Fuera de alcance

- Exportar CSV (step 19). Cambiar estados (step 17).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
