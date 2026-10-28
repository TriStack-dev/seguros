# Step 11 — Anti-spam
Objetivo: implementar el step sin commits, push ni PR. Rama: `feat/11-form-anti-spam`; base: `e0bd5a0`.
Entrega local; runner: Vitest (`pnpm test`). Estimación: 600–900 líneas con pruebas; sin estrategia de PR hasta autorización explícita.

## Specs

### S1 — Fuente de verdad (cita literal)

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


### S2 — Restricciones del usuario (citas literales)

> No hagas commit, push ni abras un PR sin pedírmelo.
> Sí, ejecutá git fetch origin y creá la rama correspondiente al Step 11 desde origin/main actualizado. No hagas commit, push ni PR.
> Sí, sustituí gpt-6.1-luna por gpt-6-luna para este subagente y para cualquier otro rol que solicite ese modelo inexistente. Mantené el esfuerzo configurado y continuá.

## Tasks

- T1 · S1/S2 · inline · completo local; RED 5 fallos acción, GREEN 40 tests servidor · servidor, límite y configuración con pruebas; Risk: items 1/2/4 (retención, guardia antiabuso y atomicidad).
- T2 · S1/S2 · delegated · completo local; suite final 233 tests OK, tipos corregidos por parent · widget y formulario con pruebas; motivo: unidad UI independiente en paralelo con servidor; sin commits.
- T3 · S1/S2 · inline + independent verifier · completo local · integración, notas y comandos completos; sin commits.

## Log

L1 — Solicitud original literal:

> Implementá completamente el Step 11 siguiendo su archivo como fuente de verdad.
>
> Antes de empezar, leé AGENTS.md, las secciones indicadas de docs/reglas-negocio.md y las decisiones relacionadas. Revisá la implementación actual, consultá Engram y cargá únicamente las skills necesarias.
>
> Respetá estrictamente el alcance y los criterios de aceptación. Usá documentación oficial o Context7 cuando necesites confirmar una API. Usá subagentes solamente si aportan valor.
>
> Al terminar, ejecutá pnpm lint, pnpm typecheck, pnpm test y pnpm build, corregí los problemas encontrados y completá las notas del step según AGENTS.md.
>
> No hagas commit, push ni abras un PR sin pedírmelo.

L2 — Dependencia 10 DONE. SubmissionAttempt existente: sin migración. No se crea cuenta Cloudflare remota ni se inventa contacto comercial: desarrollo con claves oficiales y enlace WhatsApp solo con WHATSAPP_NUMBER configurado. Cierre formal DONE/#PR pendiente de publicación autorizada.

L3 — T1/T2 implementados; normalización focalizada y pruebas nuevas RED→GREEN. Carga del script: se agregó rechazo de la promesa compartida al vencer el timeout para permitir una carga posterior. Verificación independiente pendiente. RDD desactivado por clone-local; assess informó high/unassessable por inventario no declarado: no se reduce riesgo ni se inicia revisión nativa.

L4 — Verificador independiente gpt-6-luna/medium, conforme a la tabla actualizada: sin bloqueos de código. Baseline 194 tests OK; candidato 233 tests OK, lint y typecheck exit 0. Build aislado no concluyente por symlink; `pnpm build` en workspace real exit 0 (Turbopack, TypeScript y generación de rutas OK). Parent spot check: 47 tests OK. Detector UI sin hallazgos; diff --check OK. No se verificaron servicios reales, concurrencia PostgreSQL real ni render visual en navegador. Cuenta Cloudflare/número/sal pendientes de configuración; fila SPEC pendiente hasta cierre formal con PR autorizado. Sin commits, push ni PR. RDD disabled/unmanaged.

L5 — El usuario pidió «hace la pr», autorizó una PR única con excepción de tamaño (1126 líneas antes de las notas de entrega), push por SSH a TriStack-dev/seguros y creación mediante gh. Autorizó seguir la convención del repo sin circuito de issues/etiquetas. Se mantiene la prohibición de merge. Se entregará el step completo en una PR por la regla del proyecto, con código, pruebas y documentación juntos.
