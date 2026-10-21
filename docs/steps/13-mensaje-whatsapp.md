# Step 13 — Mensaje y link de WhatsApp

**Etapa:** 3. WhatsApp · **Depende de:** 06 · **Leer:** `docs/reglas-negocio.md` secciones 3, 4 y 7

## Objetivo

Armar, en una función pura y testeada, el mensaje predefinido y el link `wa.me` a partir de los datos del lead.

## Tareas

- [ ] `src/lib/whatsapp/build-message.ts`: `buildWhatsappMessage(data)` que recibe los datos normalizados del lead (`LeadFormData` del step 06 más `requestNumber`, `brandName` y `modelName`) y devuelve el texto exacto de la sección 7:
  - omite las líneas vacías (versión, patente en 0 km se reemplaza por "0 km");
  - no incluye GNC en motos;
  - usa la etiqueta del tipo de uso y el teléfono en formato de visualización.
- [ ] `src/lib/whatsapp/build-link.ts`: `buildWhatsappLink(phoneNumber, message)` → `https://wa.me/{número}?text={encodeURIComponent(mensaje)}`. Valida que el número sea solo dígitos.
- [ ] La plantilla del mensaje en un solo lugar (constante) para que el cliente pueda cambiar el texto [PROVISORIO] fácilmente.
- [ ] Tests unitarios: auto completo, moto (sin GNC), 0 km, sin versión, marca "Otro", caracteres especiales (ñ, acentos, `&`, `#`) correctamente codificados en el link.

## Criterios de aceptación

- Los tests cubren todos los casos listados.
- Abrir manualmente un link generado en el test (copiado) abre WhatsApp con el mensaje legible y bien formateado.

## Fuera de alcance

- Pantalla de confirmación y registro del clic (step 14).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
