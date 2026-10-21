# Step 10 — Envío y registro del lead

**Etapa:** 2. Formulario · **Depende de:** 04, 06, 09 · **Leer:** `docs/reglas-negocio.md` secciones 1, 4 y 5.2

## Objetivo

Guardar el lead en la base cuando el usuario envía el formulario, con validación en el servidor, estado `NEW` y número de solicitud.

## Tareas

- [ ] Server Action `submitLead` en `src/server/actions/submit-lead.ts`:
  1. Valida la entrada con `leadFormSchema` (step 06). Si falla, devuelve los errores por campo.
  2. Si el honeypot viene con contenido, devuelve una respuesta de éxito falsa y no guarda nada.
  3. Si viene `brandId` / `modelId`, verifica que existan, que la marca sea del tipo de vehículo elegido y que el modelo sea de esa marca; completa `brandName` y `modelName` desde el catálogo. Si viene "Otro", usa el texto libre.
  4. En una transacción: crea el `Lead` con estado `NEW` y `consentAt = now()`, y el primer `LeadStatusChange` (`null → NEW`, sin usuario).
  5. Devuelve `{ ok: true, leadId, requestNumber }` (formateado según la sección 4).
- [ ] `src/lib/leads/request-number.ts` + tests: `formatRequestNumber(n)` y `parseRequestNumber(texto)` (acepta `MS-000123`, `000123` y `123`).
- [ ] Tipo de resultado discriminado (`{ ok: true, … } | { ok: false, fieldErrors?, message }`) compartido entre la acción y el formulario.
- [ ] Conectar `LeadForm` a la acción: errores del servidor en sus campos, error genérico con `sonner` si falla la base ("No pudimos enviar tu solicitud. Probá de nuevo o escribinos por WhatsApp."). Evitar doble envío mientras está pendiente.
- [ ] Por ahora, si el envío sale bien, mostrar un mensaje simple con el número de solicitud. La pantalla de confirmación con WhatsApp es el step 14.
- [ ] Nunca loguear datos personales en la consola del servidor.

## Criterios de aceptación

- Un envío válido crea el lead y su primer cambio de estado; el número aparece al usuario.
- Un envío inválido (por ejemplo, saltando la validación del navegador con DevTools) es rechazado por el servidor con el error en el campo.
- Un `brandId` de moto con tipo auto es rechazado.
- Tests de `formatRequestNumber` y `parseRequestNumber` pasan.

## Fuera de alcance

- Captcha y límite por IP (step 11). UTM y gclid (step 12). WhatsApp (steps 13 y 14).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
