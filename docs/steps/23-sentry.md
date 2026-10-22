# Step 23 — Monitoreo de errores con Sentry

**Etapa:** 5. Lanzamiento · **Depende de:** 01, 26 · **Leer:** `AGENTS.md` sección "Seguridad"

## Objetivo

Recibir un aviso por email cuando algo falla en producción (en el navegador o en el servidor), con el detalle necesario para corregirlo, usando el plan gratuito de Sentry.

Sentry necesita un deploy real para verificarse (source maps, previews, alertas), así que este step depende de la infraestructura del step 26 aunque su número sea anterior.

## Tareas

- [ ] Crear la cuenta de Sentry (plan gratuito, a nombre del cliente) y un proyecto Next.js.
- [ ] Ejecutar `pnpm dlx @sentry/wizard@latest -i nextjs` y revisar lo que genera (configuración de cliente, servidor y edge, `instrumentation.ts`, `global-error.tsx`).
- [ ] Variables `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT` en `.env.example` y en Vercel (el token, solo como secreto para subir source maps en el build).
- [ ] Activar Sentry solo en producción y en previews (`enabled` según el entorno); en local, desactivado.
- [ ] Privacidad: `sendDefaultPii: false`; `beforeSend` que elimine cuerpos de requests y valores de formularios; Session Replay **desactivado**.
- [ ] Muestreo de performance bajo (por ejemplo, `tracesSampleRate: 0.1`) para no agotar la cuota gratuita.
- [ ] `tunnelRoute` activado para que los bloqueadores de anuncios no corten los reportes.
- [ ] En Sentry: alerta por email ante cada error nuevo, con el email del equipo y del cliente.
- [ ] Ruta de prueba protegida (solo para administradores o solo en preview) que lance un error, para verificar la integración; quitarla o dejarla deshabilitada en producción.
- [ ] Sección en el README: qué es Sentry, dónde ver los errores y quién recibe las alertas.

## Criterios de aceptación

- Un error de prueba en un preview aparece en Sentry con el stack trace legible (source maps) y llega el email de alerta.
- El evento en Sentry no contiene nombre, DNI, teléfono ni email.
- En local no se envía nada a Sentry.

## Fuera de alcance

- Session Replay. Monitoreo de uptime. Plan pago.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
