# 0009 — Alineación del formulario y Lead

- **Fecha:** 2026-10-27
- **Estado:** Aceptada

## Contexto

La simplificación del step 09 dejó diez campos y un teléfono completo, conservando Auto/Moto y privacidad. Se retiraron versión, GNC y 0 km de la UI, pero quedaron en validación y persistencia. La decisión 0008 documenta ese cambio anterior.

## Decisión

Se recuperan Es 0 km para autos y motos y ¿Tiene GNC? para autos. Marcar 0 km oculta y limpia patente; desmarcarlo vuelve a exigirla. El servidor permite patente vacía para 0 km y valida una patente si se envía.

GNC ofrece Sí/No y es opcional: sin respuesta es null, no false. Para motos es null y no se muestra. Cambiar de tipo limpia GNC.

Se elimina version del modelo, validación y acción. El usuario confirmó expresamente borrar esa columna incluso si tuviera valores guardados. La migración elimina solo esa columna, sin reset ni modificaciones de la migración inicial.

Se conservan identificadores, relaciones del catálogo, fechas, consentimiento, estado, historial y atribución: son metadatos internos, no controles adicionales. El teléfono se almacena normalizado y el consentimiento como fecha.

## Aplicación y verificación

Migración: `prisma/migrations/20261027212000_remove_lead_version/migration.sql`. Aplicar con `pnpm db:deploy` solo al destino autorizado y con respaldo cuando corresponda: elimina definitivamente version. No usar reset. Generar Prisma no aplica migraciones.

Probar Auto/Moto, 0 km sin patente, volver a exigir patente al desmarcarlo y GNC Sí/No. Ejecutar lint, typecheck, test y build. Los mocks no prueban una base real.
