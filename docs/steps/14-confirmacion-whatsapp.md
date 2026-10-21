# Step 14 — Confirmación y derivación a WhatsApp

**Etapa:** 3. WhatsApp · **Depende de:** 10, 13 · **Leer:** `docs/reglas-negocio.md` sección 7

## Objetivo

Después de enviar el formulario, mostrar una pantalla de confirmación con el número de solicitud y un botón que abre WhatsApp con el mensaje, y registrar que el usuario tocó el botón.

## Contexto

Abrir WhatsApp automáticamente con `window.open` después de una espera suele bloquearse en iPhone. Por eso el usuario abre WhatsApp con un toque directo en un enlace, que funciona en todos los dispositivos (app en el celular, WhatsApp Web en computadora).

## Tareas

- [ ] Variable `WHATSAPP_NUMBER` (solo servidor) en `.env.example` con `5493794057190`.
- [ ] `submitLead` arma el link con `buildWhatsappMessage` y `buildWhatsappLink` (step 13) y lo devuelve junto con `leadId` y `requestNumber`. El número de los brokers no se expone en el código del cliente más allá del link.
- [ ] Pantalla de confirmación (estado del mismo componente, **sin** poner el id del lead en la URL):
  - título "¡Listo! Recibimos tu solicitud", número de solicitud destacado;
  - botón grande "Abrir WhatsApp" (`<a href={link} target="_blank" rel="noopener noreferrer">`);
  - texto: "Si WhatsApp no se abre, escribinos al +54 9 3794 05-7190 e indicá tu número de solicitud." (número formateado desde la variable, no fijo);
  - botón secundario para cargar otra cotización (resetea el formulario).
- [ ] Registro del clic: al tocar el botón, enviar `navigator.sendBeacon` a `POST /api/leads/[id]/whatsapp`. El route handler valida que el id sea un UUID existente y completa `whatsappClickedAt` **solo si está vacío**. Responde 204 siempre (no revela si el lead existe).
- [ ] Mover el foco a la confirmación al mostrarla (accesibilidad) y hacer scroll a ella.

## Criterios de aceptación

- En un celular Android, en un iPhone y en una computadora, el botón abre WhatsApp con el mensaje completo dirigido al número de los brokers.
- Al tocar el botón, el lead queda con `whatsappClickedAt`; tocarlo de nuevo no cambia la fecha.
- La URL no cambia ni expone datos después del envío.

## Fuera de alcance

- Evento `whatsapp_click` en GA4 (step 21).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
