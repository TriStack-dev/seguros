# Step 10 — Envío y registro del lead

**Etapa:** 2. Formulario · **Depende de:** 04, 06, 09 · **Leer:** `docs/reglas-negocio.md` secciones 1, 4 y 5.2

## Objetivo

Guardar el lead en la base cuando el usuario envía el formulario, con validación en el servidor, estado `NEW` y número de solicitud.

## Tareas

- [x] Server Action `submitLead` en `src/server/actions/submit-lead.ts`:
  1. Valida la entrada con `leadFormSchema` (step 06). Si falla, devuelve los errores por campo.
  2. Si el honeypot viene con contenido, devuelve una respuesta de éxito falsa y no guarda nada.
  3. Si viene `brandId` / `modelId`, verifica que existan, que la marca sea del tipo de vehículo elegido y que el modelo sea de esa marca; completa `brandName` y `modelName` desde el catálogo. Si viene "Otro", usa el texto libre.
  4. En una transacción: crea el `Lead` con estado `NEW` y `consentAt = now()`, y el primer `LeadStatusChange` (`null → NEW`, sin usuario).
  5. Devuelve `{ ok: true, leadId, requestNumber }` (formateado según la sección 4).
- [x] `src/lib/leads/request-number.ts` + tests: `formatRequestNumber(n)` y `parseRequestNumber(texto)` (acepta `MS-000123`, `000123` y `123`).
- [x] Tipo de resultado discriminado (`{ ok: true, … } | { ok: false, fieldErrors?, message }`) compartido entre la acción y el formulario.
- [x] Conectar `LeadForm` a la acción: errores del servidor en sus campos, error genérico con `sonner` si falla la base ("No pudimos enviar tu solicitud. Probá de nuevo o escribinos por WhatsApp."). Evitar doble envío mientras está pendiente.
- [x] Por ahora, si el envío sale bien, mostrar un mensaje simple con el número de solicitud. La pantalla de confirmación con WhatsApp es el step 14.
- [x] Nunca loguear datos personales en la consola del servidor.

## Criterios de aceptación

- Un envío válido crea el lead y su primer cambio de estado; el número aparece al usuario.
- Un envío inválido (por ejemplo, saltando la validación del navegador con DevTools) es rechazado por el servidor con el error en el campo.
- Un `brandId` de moto con tipo auto es rechazado.
- Tests de `formatRequestNumber` y `parseRequestNumber` pasan.

## Fuera de alcance

- Captcha y límite por IP (step 11). UTM y gclid (step 12). WhatsApp (steps 13 y 14).

## Notas de implementación

**Qué se hizo:** Se agregó `submitLead`, que valida nuevamente con el esquema compartido, descarta silenciosamente el honeypot y verifica tipo/marca/modelo contra el catálogo antes de guardar.
En una transacción crea el lead en estado `NEW` y el primer cambio `null → NEW`, con el consentimiento registrado por el servidor.
El formulario ahora envía mediante la Server Action, presenta errores por campo, evita envíos simultáneos y muestra el número de solicitud confirmado.
Se centralizaron el formato y el parseo del número de solicitud y se agregó el aviso global de errores de envío.

**Archivos clave:** `src/server/actions/submit-lead.ts`, `src/lib/leads/request-number.ts`, `src/lib/leads/submit-result.ts`, `src/components/public/lead-form.tsx`, `src/app/layout.tsx`.

**Decisiones:** Se reutilizó y trasladó `formatRequestNumber` desde el helper de WhatsApp para mantener un único formato. El honeypot devuelve una respuesta de éxito sintética antes de la validación visible y no consulta ni escribe la base.

**Desvíos del spec:** Ninguno. No se agregaron captcha, límites por IP, atribución, WhatsApp ni pantalla definitiva de confirmación.

**Cómo probarlo:** `pnpm test`; `pnpm lint`; `pnpm typecheck`; `pnpm build`. Los tests del servidor cubren validación, honeypot, tipo/marca/modelo, transacción y falla de persistencia; los del número cubren formato y parseo.

**Pendientes:** No se ejecutó una prueba integrada contra una base PostgreSQL configurada; el test automatizado verifica la transacción mediante mocks. Publicado en el PR #28. Verificación: 112 tests, lint y typecheck correctos; build con Webpack correcto. El build estándar de Turbopack no pudo completarse por restricciones de permisos del entorno. La confirmación definitiva y WhatsApp quedan para el Step 14.
