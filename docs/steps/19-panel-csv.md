# Step 19 — Exportación a CSV

**Etapa:** 4. Panel · **Depende de:** 16 · **Leer:** `docs/reglas-negocio.md` sección 10

## Objetivo

Descargar desde el listado un CSV con los leads que coinciden con los filtros, listo para abrir en Excel.

## Tareas

- [x] `src/lib/csv/` + tests: función pura que convierte filas en CSV con separador `;`, BOM UTF-8, escape correcto de comillas, separadores y saltos de línea, y protección contra inyección de fórmulas (anteponer `'` a valores que empiezan con `=`, `+`, `-` o `@`).
- [x] Route handler `GET /api/admin/leads/export` que llama a `requireAdmin()`, reutiliza los mismos filtros y búsqueda que `listLeads` (step 16, sin paginación) y devuelve el archivo con `Content-Disposition: attachment; filename="leads-AAAA-MM-DD.csv"`.
- [x] Columnas y formatos de la sección 10, con etiquetas en español para estados, tipos, usos y motivos.
- [x] Botón "Exportar CSV" en el listado que conserva los filtros actuales de la URL.
- [x] Con muchos leads, generar el archivo por lotes (por ejemplo, de a 1000) para no cargar todo en memoria.

## Criterios de aceptación

- El CSV abre bien en Excel en español: columnas separadas, acentos y ñ correctos.
- Exportar con un filtro de estado trae solo esos leads.
- Un nombre que empieza con `=` no se ejecuta como fórmula.
- Sin sesión, el endpoint redirige o devuelve 401.

## Fuera de alcance

- Exportación a Excel nativo (.xlsx). Reportes programados.

## Notas de implementación

**Qué se hizo:**

- `src/lib/csv/serialize.ts` arma filas y encabezados con BOM, separador `;`, fin de línea `\r\n`,
  escape de comillas, separadores y saltos, y neutralización de fórmulas (`=`, `+`, `-`, `@`,
  incluso detrás de espacios o tabs).
- `src/lib/csv/leads-export.ts` define las 25 columnas de la sección 10 en su orden y arma la fila
  con etiquetas en español, fechas `DD/MM/AAAA HH:mm` de Argentina, `Sí`/`No` y el origen
  clasificado con el mismo módulo que el detalle del lead.
- `GET /api/admin/leads/export` valida la sesión con `requireAdmin()`, normaliza los filtros con
  `parseLeadListFilters` y `buildLeadWhere` (los mismos que usa la página) y escribe el cuerpo por
  lotes de 1000 con cursor por `id`.
- El listado muestra el botón "Exportar CSV" que enlaza a la exportación con los filtros de la URL
  vigentes (sin `page`).

**Archivos clave:**

- `src/lib/csv/serialize.ts`, `src/lib/csv/leads-export.ts` (+ tests).
- `src/lib/leads/filters.ts` (+ test): parseo de filtros y `where` compartidos con el listado.
- `src/server/queries/lead-export.ts` (+ test): lotes con cursor.
- `src/app/api/admin/leads/export/route.ts` (+ test).
- `src/components/admin/leads/leads-export-button.tsx` (+ test).
- `src/lib/format.ts`: `formatDateTimeArCompact` y `formatDateArCompact`.
- `docs/decisiones/0015-exportacion-csv.md`.

**Decisiones:**

- La columna "Versión" se exporta vacía: la sección 10 todavía la lista, pero el formulario no la
  pide desde el step 09. Detalle en `docs/decisiones/0015-exportacion-csv.md`.
- Sin sesión el endpoint responde `307` a `/admin/login`, porque reutiliza `requireAdmin()`. El
  criterio acepta redirigir o devolver 401.
- Los filtros y el `where` se movieron de `listLeads` a `src/lib/leads/filters.ts` para que la
  página y la exportación no puedan divergir.

**Desvíos del spec:** Ninguno. Se agregó la decisión sobre "Versión" porque la sección 10 y el
formulario no coinciden.

**Cómo probarlo:**

1. `pnpm test` (incluye los tests de CSV, filtros, lotes, endpoint y botón).
2. `pnpm build && pnpm start` y entrar al panel con un administrador
   (`pnpm admin:create <email>`).
3. En `/admin/leads`, aplicar un filtro de estado y tocar "Exportar CSV": se descarga
   `leads-AAAA-MM-DD.csv` con solo esos leads, 25 columnas y acentos correctos en Excel.
4. Sin sesión, `GET /api/admin/leads/export` redirige a `/admin/login`.

**Pendientes:**

- `scripts/seed-dev-leads.ts` usa `import "dotenv/config"`, que lee `.env` y no `.env.local`: en
  este repo corre solo si se le pasa `DATABASE_URL` por entorno. Fuera del alcance del step.
