# Step 19 — Exportación a CSV

**Etapa:** 4. Panel · **Depende de:** 16 · **Leer:** `docs/reglas-negocio.md` sección 10

## Objetivo

Descargar desde el listado un CSV con los leads que coinciden con los filtros, listo para abrir en Excel.

## Tareas

- [ ] `src/lib/csv/` + tests: función pura que convierte filas en CSV con separador `;`, BOM UTF-8, escape correcto de comillas, separadores y saltos de línea, y protección contra inyección de fórmulas (anteponer `'` a valores que empiezan con `=`, `+`, `-` o `@`).
- [ ] Route handler `GET /api/admin/leads/export` que llama a `requireAdmin()`, reutiliza los mismos filtros y búsqueda que `listLeads` (step 16, sin paginación) y devuelve el archivo con `Content-Disposition: attachment; filename="leads-AAAA-MM-DD.csv"`.
- [ ] Columnas y formatos de la sección 10, con etiquetas en español para estados, tipos, usos y motivos.
- [ ] Botón "Exportar CSV" en el listado que conserva los filtros actuales de la URL.
- [ ] Con muchos leads, generar el archivo por lotes (por ejemplo, de a 1000) para no cargar todo en memoria.

## Criterios de aceptación

- El CSV abre bien en Excel en español: columnas separadas, acentos y ñ correctos.
- Exportar con un filtro de estado trae solo esos leads.
- Un nombre que empieza con `=` no se ejecuta como fórmula.
- Sin sesión, el endpoint redirige o devuelve 401.

## Fuera de alcance

- Exportación a Excel nativo (.xlsx). Reportes programados.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
