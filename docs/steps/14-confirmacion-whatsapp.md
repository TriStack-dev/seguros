# Step 14 — Confirmación y derivación a WhatsApp

**Etapa:** 3. WhatsApp · **Depende de:** 10, 13 · **Leer:** `docs/reglas-negocio.md` sección 7

## Objetivo

Después de enviar el formulario, mostrar una pantalla de confirmación con el número de solicitud y un botón que abre WhatsApp con el mensaje, y registrar que el usuario tocó el botón.

## Contexto

Abrir WhatsApp automáticamente con `window.open` después de una espera suele bloquearse en iPhone. Por eso el usuario abre WhatsApp con un toque directo en un enlace, que funciona en todos los dispositivos (app en el celular, WhatsApp Web en computadora).

## Tareas

- [x] Variable `WHATSAPP_NUMBER` (solo servidor) en `.env.example` con `5493794057190`.
- [x] `submitLead` arma el link con `buildWhatsappMessage` y `buildWhatsappLink` (step 13) y lo devuelve junto con `leadId` y `requestNumber`. El número de los brokers no se expone en el código del cliente más allá del link.
- [x] Pantalla de confirmación (estado del mismo componente, **sin** poner el id del lead en la URL):
  - título "¡Listo! Recibimos tu solicitud", número de solicitud destacado;
  - botón grande "Abrir WhatsApp" (`<a href={link} target="_blank" rel="noopener noreferrer">`);
  - texto: "Si WhatsApp no se abre, escribinos al +54 9 3794 05-7190 e indicá tu número de solicitud." (número formateado desde la variable, no fijo);
  - botón secundario para cargar otra cotización (resetea el formulario).
- [x] Registro del clic: al tocar el botón, enviar `navigator.sendBeacon` a `POST /api/leads/[id]/whatsapp`. El route handler valida que el id sea un UUID existente y completa `whatsappClickedAt` **solo si está vacío**. Responde 204 siempre (no revela si el lead existe).
- [x] Mover el foco a la confirmación al mostrarla (accesibilidad) y hacer scroll a ella.

## Criterios de aceptación

- En un celular Android, en un iPhone y en una computadora, el botón abre WhatsApp con el mensaje completo dirigido al número de los brokers.
- Al tocar el botón, el lead queda con `whatsappClickedAt`; tocarlo de nuevo no cambia la fecha.
- La URL no cambia ni expone datos después del envío.

## Fuera de alcance

- Evento `whatsapp_click` en GA4 (step 21).

## Notas de implementación

**Qué se hizo:** `submitLead` valida la configuración antes de guardar y devuelve el enlace generado con los helpers del step 13 y los datos normalizados.
La confirmación reemplaza el formulario en su estado local, sin navegación ni datos personales en la URL de la página.
Incluye número de solicitud, enlace directo a WhatsApp, teléfono alternativo derivado del mismo enlace y reinicio de la cotización.
El título recibe foco y scroll respetando movimiento reducido; al reiniciar se enfoca el nombre.
El beacon registra el primer clic mediante una actualización atómica condicionada a `whatsappClickedAt: null`.

**Archivos clave:** `src/server/actions/submit-lead.ts`, `src/lib/leads/submit-result.ts`, `src/components/public/lead-confirmation.tsx`, `src/components/public/lead-form.tsx`, `src/app/api/leads/[id]/whatsapp/route.ts` y sus tests, `.env.example`, `SPEC.md` (tabla de entorno).

**Decisiones:** [0012 — Confirmación y registro del clic](../decisiones/0012-confirmacion-whatsapp.md). La variable permanece en el servidor; el cliente recibe únicamente el enlace. El endpoint requiere evidencia de mismo origen, valida UUID y responde 204 también ante rechazos, inexistencia o fallas de base, sin revelar datos ni registrar información personal.

**Desvíos del spec:** Ninguno funcional. No se agregó GA4 ni se modificó la plantilla del mensaje. Por indicación explícita del usuario, la fila de `SPEC.md` se marca DONE el 2026-10-28, con PR pendiente y sin dar por verificadas las comprobaciones manuales.

**Cómo probarlo:** Configurar `WHATSAPP_NUMBER=5493794057190` en el entorno local. Enviar una cotización válida: comprobar título enfocado, número destacado y URL de la página sin cambios. Abrir WhatsApp y verificar destinatario y mensaje completo. Consultar `whatsappClickedAt` en la base, volver a tocar el enlace y comprobar que la fecha no cambia. Cargar otra cotización y comprobar campos vacíos y foco inicial.

Verificación automatizada: `pnpm lint` pasa con una advertencia preexistente en `.opencode/plugins/block-push-to-protected.js`; `pnpm typecheck` pasa; `pnpm test` pasa (33 archivos, 242 tests). Se observó RED y GREEN para la confirmación y para el rechazo de solicitudes sin evidencia de mismo origen. La revisión independiente ejecutó 241 tests en copia temporal y volvió a comprobar la corrección de origen con 242 tests pasando. `pnpm build` se ejecutó, pero Turbopack falló por acceso a Google Fonts y luego por permiso al abrir un puerto; `pnpm build --webpack` pasó como alternativa.

**Pendientes:** Verificar apertura real con el mensaje completo en Android, iPhone y computadora; verificar persistencia e idempotencia contra PostgreSQL real (los tests usan mocks). Revisar el build estándar de Turbopack en un entorno sin esas restricciones. Implementación subida a la rama `feat/14-whatsapp-confirmation`; PR pendiente. Estado DONE por indicación del usuario; las comprobaciones anteriores siguen pendientes.
