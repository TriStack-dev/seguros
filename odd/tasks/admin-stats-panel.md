# Feature — Panel de estadísticas (Step 20)

Rama `feat/20-admin-stats-panel` · Estrategia de entrega: `ask-on-risk` · Runner: `pnpm test` (Vitest).
Objetivo: página `/admin/estadisticas` con evolución de leads, distribuciones, embudo hasta la emisión y tiempos de respuesta, sobre un rango de fechas en hora de Argentina.

## Specs

Requisitos tomados de `docs/steps/20-panel-estadisticas.md` (texto del step, sin reescribir).

- **S1** — `src/server/queries/stats.ts` (con `requireAdmin()`), todas filtradas por un rango de fechas (por defecto, últimos 30 días) y agrupando en hora de Argentina (`date_trunc` con `AT TIME ZONE 'America/Argentina/Buenos_Aires'` vía `$queryRaw` tipado si Prisma no alcanza).
- **S2** — leads por día, semana o mes (según el largo del rango).
- **S3** — distribución por tipo de vehículo, marca (top 10 + "Otras"), tipo de uso y código postal (top 10).
- **S4** — embudo: enviados → derivados a WhatsApp (`whatsappClickedAt`) → contactados (`firstContactedAt`) → cotizados (alcanzaron `QUOTED` o `ISSUED` según el historial) → emitidos.
- **S5** — tasa de contacto (contactados / enviados).
- **S6** — tiempo de primera respuesta: promedio y mediana, mostrados en horas y minutos.
- **S7** — leads por origen (`classifySource` del step 12).
- **S8** — Funciones puras para los cálculos que no son SQL (mediana, tasas, armado del embudo, agrupación de "Otras") con tests unitarios.
- **S9** — Página `/admin/estadisticas`: selector de rango (últimos 7, 30 y 90 días, y personalizado), guardado en la URL.
- **S10** — tarjetas de resumen: total de leads, tasa de contacto, tiempo mediano de primera respuesta, emitidos.
- **S11** — gráficos con los charts de shadcn/ui: línea de leads en el tiempo, barras para distribuciones y para el embudo.
- **S12** — aviso fijo: "Formularios vistos, iniciados y abandonos: ver GA4".
- **S13** — Estados vacíos cuando el rango no tiene datos.
- **A1** — Con los leads de prueba del step 16, los números coinciden con un conteo manual hecho en el SQL Editor de Supabase (documentar las consultas usadas en las notas).
- **A2** — Un lead creado a las 23:30 hora de Argentina cuenta en ese día, no en el siguiente.
- **A3** — Los gráficos se leen bien en tablet y desktop.

## Tasks

- **T1** · S1, S2, S5, S6, S8 · inline · lib pura `src/lib/stats/` (rango + cálculos) con tests RED→GREEN. **DONE** — 33 tests (30 en `src/lib/stats`, 3 del selector).
- **T2** · S1–S7 · inline · `src/server/queries/stats.ts` con `requireAdmin()` y SQL en hora de Argentina. **DONE** — SQL verificado en `psql` contra los 5 leads locales.
- **T3** · S11 · inline · dependencia `recharts` + `src/components/ui/chart.tsx` (chart de shadcn/ui). **DONE** — `recharts@3.10.1`.
- **T4** · S9–S13 · inline · página, selector de rango por URL, tarjetas, gráficos y estados vacíos. **DONE** — `page.test.tsx` cubre resumen y estado vacío.
- **T5** · A1, A2 · inline · validación contra conteos manuales en SQL + decisiones + cierre del step. **DONE** — `docs/decisiones/0016-estadisticas-rango-y-graficos.md`, notas del step y fila 20 de `SPEC.md`.
- **T6** · checks · inline · `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. **DONE** — lint sin errores, 403 tests verdes, build OK.

## Log

- **L1** — Pedido del usuario, textual: "entonces hagamos el step 20".
- **L2** — Contexto previo: el step 18 ya estaba DONE y mergeado (PR #43); el único step PENDIENTE del vertical Panel era el 20.
- **L3** — Decisión de implementación (no resuelta en el spec): el rango "personalizado" se hace con dos `<input type="date">` nativos en un formulario GET, porque el repo no tiene componente de calendario instalado. Se registra en `docs/decisiones/`.
- **L4** — Decisión de implementación: los gráficos de shadcn/ui requieren `recharts`; se agrega como dependencia (no estaba en `package.json`).
- **L5** — Criterio de agrupación (S2): ≤ 31 días → día; ≤ 120 días → semana; más → mes.
- **L6** — Datos locales disponibles al arrancar: 5 leads (uno por estado), 1 usuario admin. La validación A1 se hace con esos leads y con el seed de desarrollo.
- **L7** — Incidente: al editar `src/server/queries/stats.ts` con `Get-Content`/`Set-Content` de PowerShell 5.1 se corrompió el encoding (BOM + mojibake). Se reescribió el archivo con la herramienta de escritura y se dejó de usar PowerShell para tocar texto UTF-8.
- **L8** — `noUncheckedIndexedAccess` obligó a reescribir `median` y `buildFunnel` sin accesos por índice sin chequeo, y a usar `.at()` en los tests.
- **L9** — Verificación A1/A2: las dos consultas SQL corrieron contra la base local (`psql` dentro de `supabase_db_seguros`) y dieron 5/1/3/2/1 en el embudo, mediana 9 h 41 min y promedio 9 h 14 min; A2 queda cubierto por el test de las 23:30 en `range.test.ts`. A3 (tablet/desktop) queda para revisión visual en el PR.
- **L10** — Checks finales: `pnpm lint` sin errores (solo el warning previo de `.opencode/plugins`), `pnpm typecheck` OK, `pnpm test` 403/403, `pnpm build` OK.
