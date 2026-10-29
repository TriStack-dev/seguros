# Step 20 — Estadísticas

**Etapa:** 4. Panel · **Depende de:** 17 · **Leer:** `docs/reglas-negocio.md` secciones 5.2 y 8

## Objetivo

Página de estadísticas con la evolución de leads, su distribución, el embudo hasta la emisión y los tiempos de respuesta.

## Tareas

- [x] `src/server/queries/stats.ts` (con `requireAdmin()`), todas filtradas por un rango de fechas (por defecto, últimos 30 días) y agrupando en hora de Argentina (`date_trunc` con `AT TIME ZONE 'America/Argentina/Buenos_Aires'` vía `$queryRaw` tipado si Prisma no alcanza):
  - leads por día, semana o mes (según el largo del rango);
  - distribución por tipo de vehículo, marca (top 10 + "Otras"), tipo de uso y código postal (top 10);
  - embudo: enviados → derivados a WhatsApp (`whatsappClickedAt`) → contactados (`firstContactedAt`) → cotizados (alcanzaron `QUOTED` o `ISSUED` según el historial) → emitidos;
  - tasa de contacto (contactados / enviados);
  - tiempo de primera respuesta: promedio y mediana, mostrados en horas y minutos;
  - leads por origen (`classifySource` del step 12).
- [x] Funciones puras para los cálculos que no son SQL (mediana, tasas, armado del embudo, agrupación de "Otras") con tests unitarios.
- [x] Página `/admin/estadisticas`:
  - selector de rango (últimos 7, 30 y 90 días, y personalizado), guardado en la URL;
  - tarjetas de resumen: total de leads, tasa de contacto, tiempo mediano de primera respuesta, emitidos;
  - gráficos con los charts de shadcn/ui: línea de leads en el tiempo, barras para distribuciones y para el embudo;
  - aviso fijo: "Formularios vistos, iniciados y abandonos: ver GA4".
- [x] Estados vacíos cuando el rango no tiene datos.

## Criterios de aceptación

- Con los leads de prueba del step 16, los números coinciden con un conteo manual hecho en el SQL Editor de Supabase (documentar las consultas usadas en las notas).
- Un lead creado a las 23:30 hora de Argentina cuenta en ese día, no en el siguiente.
- Los gráficos se leen bien en tablet y desktop.

## Fuera de alcance

- Reportes periódicos por email. Datos de GA4 dentro del panel.

## Notas de implementación

**Qué se hizo:** se agregó el panel `/admin/estadisticas` con selector de rango en la URL (7, 30,
90 días y personalizado), tarjetas de resumen, línea de leads en el tiempo, embudo hasta la
emisión y distribuciones por tipo de vehículo, marca, uso, código postal y origen. Los cálculos
puros viven en `src/lib/stats/` con tests; las consultas en `src/server/queries/stats.ts`, todas
detrás de `requireAdmin()` y agrupadas en hora de Argentina.

**Archivos clave:**

- `src/lib/stats/range.ts` y `range.test.ts`: rango, agrupación y conversión a UTC.
- `src/lib/stats/calculations.ts` y `calculations.test.ts`: mediana, promedio, tasas, embudo,
  top 10 con "Otras" y etiquetas de bucket.
- `src/server/queries/stats.ts`: serie temporal y embudo con `$queryRaw`; distribuciones con
  `groupBy`; origen con `classifySource`.
- `src/app/admin/(protected)/estadisticas/page.tsx` y `page.test.tsx`.
- `src/components/admin/stats/`: selector de rango, tarjetas y gráficos.
- `src/components/ui/chart.tsx`: `ChartContainer` de shadcn/ui sobre `recharts`.
- `src/app/admin/admin.css`: estilos del panel.

**Decisiones:** rango personalizado con dos `<input type="date">` nativos, agrupación automática
por largo del rango, y embudo que cuenta estado actual **o** historial. Detalle en
`docs/decisiones/0016-estadisticas-rango-y-graficos.md`.

**Consultas de verificación** (SQL Editor de Supabase o `psql` sobre la base local, con
`from_ts` = `2026-09-29` y `to_ts` = `2026-10-30` en hora argentina):

- Serie: `SELECT to_char(date_trunc('week', "createdAt" AT TIME ZONE 'America/Argentina/Buenos_Aires'), 'YYYY-MM-DD') AS bucket, count(*) FROM "Lead" WHERE "createdAt" >= '2026-09-29 03:00:00+00' AND "createdAt" < '2026-10-30 03:00:00+00' GROUP BY 1 ORDER BY 1;`
- Embudo: `SELECT count(*) FILTER (WHERE true) AS sent, count(*) FILTER (WHERE "whatsappClickedAt" IS NOT NULL) AS whatsapp, count(*) FILTER (WHERE "firstContactedAt" IS NOT NULL) AS contacted FROM "Lead" WHERE ...;` y, para cotizados/emitidos, el `EXISTS` sobre `"LeadStatusChange"` que usa la query.

Con los 5 leads de prueba el resultado fue: 5 enviados, 1 derivado a WhatsApp, 3 contactados,
2 cotizados, 1 emitido; mediana de primera respuesta 9 h 41 min y promedio 9 h 14 min. La serie
semanal mostró 1 lead en la semana del 19/10 y 4 en la del 26/10.

**Desvíos del spec:** ninguno de alcance. Se agregó la dependencia `recharts` (los charts de
shadcn/ui la requieren) y el aviso de GA4 se muestra siempre, también con el rango vacío.

**Cómo probarlo:**

1. `pnpm db:up` y `pnpm dev`; entrar a `/admin` con el admin local.
2. Abrir `/admin/estadisticas`: verificar total 5, tasa de contacto 60 %, embudo 5/1/3/2/1.
3. Cambiar a 7 días, 30 días y 90 días: la URL cambia y los números se recalculan.
4. Elegir un rango personalizado sin datos: aparece el estado vacío y el aviso de GA4.

**Pendientes:**

- Revisión visual de los gráficos en tablet y desktop (criterio A3) al abrir el PR: los tests
  cubren la estructura, no el layout.
- Completar el `#PR` de la fila 20 en `SPEC.md` al abrir el PR.
- `docs/steps/26-infraestructura-cuentas.md` tiene caracteres corruptos (mojibake) previos a este
  step; no se tocó.
- El aviso de `next.config.ts` sobre `quality={80}` y las variables faltantes en `.env.local`
  siguen abiertos (previos a este step).
