# Step 11 — Anti-spam

**Etapa:** 2. Formulario · **Depende de:** 10 · **Leer:** `docs/reglas-negocio.md` sección 11

## Objetivo

Evitar envíos automáticos y abusivos con Cloudflare Turnstile y un límite de envíos por IP guardado en la base, sin sumar proveedores pagos.

## Tareas

- [ ] Crear el sitio en Cloudflare Turnstile (cuenta a nombre del cliente; para desarrollo se pueden usar las claves de prueba oficiales de Cloudflare). Modo "Managed" o "Invisible".
- [x] Variables `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` e `IP_HASH_SALT` en `.env.example` (con las claves de prueba de Cloudflare como ejemplo).
- [x] Widget de Turnstile en `LeadForm`; el token viaja con el envío. Si el widget falla al cargar, mostrar un mensaje con alternativa de WhatsApp.
- [x] `src/lib/anti-spam/turnstile.ts`: verificación del token en el servidor contra la API de Cloudflare (`siteverify`), con timeout. En `submitLead`, si la verificación falla, se rechaza el envío.
- [x] `src/lib/anti-spam/rate-limit.ts`:
  - obtiene la IP desde `x-forwarded-for` (primer valor) en Vercel;
  - calcula `ipHash = sha256(ip + IP_HASH_SALT)`;
  - cuenta `SubmissionAttempt` de ese hash en la última hora; si llega al límite, rechaza con el mensaje de la sección 11;
  - si no, registra el intento.
- [x] El chequeo de límite se hace **antes** de guardar el lead; el intento se registra aunque el envío falle por validación.
- [x] Limpieza: borrar los intentos de más de 7 días de forma oportunista (por ejemplo, con baja probabilidad en cada envío) para no necesitar un cron.
- [x] Tests unitarios de la lógica de límite con la base simulada (inyectar el contador como dependencia).

## Criterios de aceptación

- Sin token válido de Turnstile, el servidor rechaza el envío.
- El sexto envío desde la misma IP en una hora es rechazado con el mensaje correcto.
- En la base no aparece ninguna IP en claro.

## Fuera de alcance

- Bloqueos por email o teléfono. Servicios externos de rate limiting.

## Notas de implementación

### Qué se hizo

- Se integró el widget Turnstile con renderizado explícito, token separado del formulario y verificación obligatoria en el servidor con timeout de cinco segundos.
- Se agregó el límite de cinco intentos por IP en una hora, con hash salado y transacción serializable; los intentos se conservan aunque fallen captcha, validación o registro del lead.
- Se implementó limpieza oportunista de intentos anteriores a siete días sin cron y sin exponer IP, tokens ni datos personales en logs.
- El formulario contempla carga fallida, expiración y renovación del token tras cada intento; ofrece WhatsApp solo con un número real configurado.
- Se documentaron las variables, las claves oficiales de prueba y los requisitos de configuración para producción.

### Archivos clave

- `src/lib/anti-spam/{constants,rate-limit,turnstile}.ts` y sus tests.
- `src/server/actions/submit-lead.ts` y su test.
- `src/components/public/{turnstile-widget,lead-form,quote-form-section}.tsx` y tests del widget/formulario.
- `.env.example`, `SPEC.md` sección 5 y `docs/decisiones/0011-anti-spam-turnstile-y-limite-ip.md`.

### Decisiones

Ver [0011 — Turnstile y límite por IP](../decisiones/0011-anti-spam-turnstile-y-limite-ip.md): aislamiento serializable con reintentos acotados, rechazo ante configuración ausente, canonización de IPv6, intento independiente de la transacción del lead y alternativa de contacto configurada en el servidor. Se reutiliza `SubmissionAttempt`: no hay migración ni cambios de permisos.

### Desvíos del spec

La creación del sitio real en Cloudflare queda pendiente: el step permite claves oficiales de prueba para desarrollo y no se autorizó operar en la cuenta del cliente. Sin `WHATSAPP_NUMBER` confirmado se informa que el canal aún no está configurado, en lugar de publicar un contacto ficticio. Durante la implementación el usuario pidió entrega local; posteriormente autorizó commit, push y una única PR con excepción de tamaño. La entrega está en la PR #37 y el índice se actualizó con ese número, sin merge automático.

### Cómo probarlo

1. Copiar las claves de prueba de `.env.example` a `.env.local`, configurar una `IP_HASH_SALT` privada y estable y, si está disponible, `WHATSAPP_NUMBER` real (solo dígitos). Reiniciar `pnpm dev` tras cambiar variables. No usar claves de prueba en producción.
2. Completar Auto/Moto, consentimiento y Turnstile. Enviar y verificar el número de solicitud. Corregir datos rechazados y volver a enviar con un token renovado.
3. Ejecutar `pnpm test src/lib/anti-spam src/server/actions/submit-lead.test.ts` para comprobar el sexto intento, el hash, el límite antes de la validación, el timeout y los rechazos sin crear leads.
4. Bloquear `challenges.cloudflare.com` en el navegador: debe aparecer el mensaje de fallo con enlace al WhatsApp configurado. Sin número, debe informar que WhatsApp no está configurado.
5. En una base local de prueba, verificar que `SubmissionAttempt` contiene únicamente `id`, `ipHash` y `createdAt`; el hash debe tener 64 caracteres hexadecimales. No ejecutar pruebas mutantes sobre producción.
6. Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Resultados del 2026-10-28: lint exit 0 (advertencia preexistente en `.opencode/plugins/block-push-to-protected.js:77`), typecheck exit 0, test 31 archivos/233 tests OK y build exit 0 en el workspace real. Verificación independiente: sin bloqueos de código; comprobación focalizada del parent: 47 tests OK. El build aislado con dependencias enlazadas falló por resolución del workspace; se descartó ese falso bloqueo al verificar el proyecto real. Detector mecánico de UI: sin hallazgos.

### Pendientes

- Crear el widget Managed y configurar dominios/claves reales en la cuenta del cliente antes de producción; configurar la sal y el número de WhatsApp real.
- Validación manual con Cloudflare y PostgreSQL reales: los mocks no prueban el servicio externo ni la concurrencia real. No se ejecutaron operaciones sobre la base ni sobre la cuenta de Cloudflare, ni una inspección visual en navegador.
- Confirmar CI en verde en la PR antes de mergear.
