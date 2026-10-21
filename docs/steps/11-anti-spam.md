# Step 11 — Anti-spam

**Etapa:** 2. Formulario · **Depende de:** 10 · **Leer:** `docs/reglas-negocio.md` sección 11

## Objetivo

Evitar envíos automáticos y abusivos con Cloudflare Turnstile y un límite de envíos por IP guardado en la base, sin sumar proveedores pagos.

## Tareas

- [ ] Crear el sitio en Cloudflare Turnstile (cuenta a nombre del cliente; para desarrollo se pueden usar las claves de prueba oficiales de Cloudflare). Modo "Managed" o "Invisible".
- [ ] Variables `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` e `IP_HASH_SALT` en `.env.example` (con las claves de prueba de Cloudflare como ejemplo).
- [ ] Widget de Turnstile en `LeadForm`; el token viaja con el envío. Si el widget falla al cargar, mostrar un mensaje con alternativa de WhatsApp.
- [ ] `src/lib/anti-spam/turnstile.ts`: verificación del token en el servidor contra la API de Cloudflare (`siteverify`), con timeout. En `submitLead`, si la verificación falla, se rechaza el envío.
- [ ] `src/lib/anti-spam/rate-limit.ts`:
  - obtiene la IP desde `x-forwarded-for` (primer valor) en Vercel;
  - calcula `ipHash = sha256(ip + IP_HASH_SALT)`;
  - cuenta `SubmissionAttempt` de ese hash en la última hora; si llega al límite, rechaza con el mensaje de la sección 11;
  - si no, registra el intento.
- [ ] El chequeo de límite se hace **antes** de guardar el lead; el intento se registra aunque el envío falle por validación.
- [ ] Limpieza: borrar los intentos de más de 7 días de forma oportunista (por ejemplo, con baja probabilidad en cada envío) para no necesitar un cron.
- [ ] Tests unitarios de la lógica de límite con la base simulada (inyectar el contador como dependencia).

## Criterios de aceptación

- Sin token válido de Turnstile, el servidor rechaza el envío.
- El sexto envío desde la misma IP en una hora es rechazado con el mensaje correcto.
- En la base no aparece ninguna IP en claro.

## Fuera de alcance

- Bloqueos por email o teléfono. Servicios externos de rate limiting.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
