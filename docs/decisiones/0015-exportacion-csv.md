# 0015 — Exportación a CSV

- **Fecha:** 2026-10-28
- **Step:** 19
- **Estado:** Aceptada

## Contexto

La sección 10 de `docs/reglas-negocio.md` pide un CSV que se abra bien en Excel en español, con
protección contra inyección de fórmulas. Dos puntos no estaban resueltos: la lista de columnas
sigue marcada `[PROVISORIO: columnas a confirmar]` e incluye "versión", que el formulario ya no
pide desde la actualización del step 09; y `requireAdmin()` redirige al login en lugar de
responder 401, algo que en un endpoint de descarga no es evidente.

## Decisión

- **Formato:** UTF-8 con BOM, separador `;` y fin de línea `\r\n` (RFC 4180). Es lo que Excel en
  español necesita para separar columnas y mostrar acentos y `ñ`.
- **Inyección de fórmulas:** a todo valor que empiece con `=`, `+`, `-` o `@` se le antepone `'`,
  incluso si antes hay espacios o tabs. Se aplica a todas las columnas, así un teléfono
  formateado como `+54 9 ...` también queda neutralizado (Excel oculta la comilla y lo muestra
  como texto).
- **Columna "Versión":** se exporta vacía. Se mantiene porque la sección 10 todavía la lista; si
  al confirmar las columnas se decide que no va, se borra una línea de
  `src/lib/csv/leads-export.ts`.
- **Sesión:** el endpoint reutiliza `requireAdmin()`, así que sin sesión responde `307` a
  `/admin/login` (el criterio del step acepta redirigir o devolver 401). El chequeo corre antes
  de abrir el stream, de modo que un pedido sin sesión nunca consulta la base.
- **Filtros:** la normalización de la URL y el `where` de Prisma viven en
  `src/lib/leads/filters.ts` y los comparten la página y la exportación, así el archivo trae
  exactamente lo que se ve en el listado.
- **Volumen:** se consulta por lotes de 1000 con cursor por `id` y se escribe el cuerpo a medida
  que llegan, para no cargar toda la exportación en memoria.

## Alternativas descartadas

- Devolver 401 en el endpoint: requeriría duplicar la lógica de sesión o cambiar `requireAdmin()`,
  que usan todas las pantallas del panel. El redirect ya cumple el criterio y no agrega código.
- Armar el CSV entero en memoria con un `findMany` sin `take`: con muchos leads crece sin límite y
  puede agotar la memoria de la función en Vercel.
- Paginar con `skip`/`take` en vez de cursor: si entra un lead nuevo durante la exportación, se
  saltean o repiten filas.

## Consecuencias

La exportación no tiene techo práctico de filas y nunca diverge del listado. Si mañana se agrega
una columna, hay que tocarla en `LEAD_EXPORT_HEADERS` y en `buildLeadExportRow`, con su test. Si se
confirman las columnas definitivas, "Versión" se elimina en un solo lugar.
