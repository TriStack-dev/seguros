# 0012 — Confirmación y registro del clic de WhatsApp

Fecha: 2026-10-28. Estado: aceptada para implementación local del step 14.

## Contexto

La apertura automática de WhatsApp después de una espera puede bloquearse. El registro debe ser idempotente y no revelar si existe un lead.

## Decisión

Usar un enlace nativo desde la confirmación local y enviar un beacon sin bloquear la navegación. Generar el enlace en el servidor usando la variable `WHATSAPP_NUMBER`, validada antes de guardar el lead. Derivar el teléfono visible desde ese enlace, sin otra variable pública.

El endpoint valida el UUID con Zod y exige `Origin` coincidente o `Sec-Fetch-Site: same-origin`; rechaza siempre `cross-site`. Usa `updateMany` con UUID y fecha nula, sin consulta previa. Devuelve 204 ante todos los resultados, incluso fallas de base, sin logs personales.

## Consecuencias

Los clics simultáneos no sobrescriben la primera fecha. El registro es de mejor esfuerzo: si el beacon no llega, WhatsApp igualmente abre. No se agregan cookies, tokens, migraciones ni eventos GA4. El UUID no es autenticación; la comprobación de origen limita envíos desde otros sitios, no clientes capaces de falsificar headers.
