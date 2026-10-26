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

**Qué se hizo:** Se agregó `buildWhatsappMessage`, que arma el texto de la sección 7 de las
reglas de negocio a partir del lead normalizado, y `buildWhatsappLink`, que valida que el
número sea solo dígitos y devuelve el link `wa.me` con el mensaje codificado. La plantilla
vive en una única constante, con marcadores que se reemplazan por los datos y hacen que la
línea se omita cuando el valor queda vacío (GNC en motos, versión, patente).

**Archivos clave:**
- `src/lib/whatsapp/message-template.ts`: plantilla [PROVISORIO] y renderizado de marcadores.
- `src/lib/whatsapp/build-message.ts`: `buildWhatsappMessage`, `formatRequestNumber` y el tipo `WhatsappLeadData`.
- `src/lib/whatsapp/build-link.ts`: `buildWhatsappLink`.
- `src/lib/whatsapp/build-message.test.ts`, `src/lib/whatsapp/build-link.test.ts`: tests unitarios.

**Decisiones:** La plantilla es un array de líneas con marcadores `{nombre}` en vez de un
`template string` armado con condicionales: cambiar el texto es editar ese array, y las líneas
vacías se omiten solas. `formatRequestNumber` se exporta porque el panel (step 16) va a
necesitar el mismo formato.

**Desvíos del spec:** Ninguno.

**Cómo probarlo:** `pnpm test src/lib/whatsapp`. Para ver el resultado a mano, generar un link
con `buildWhatsappLink` y abrirlo en el navegador: WhatsApp muestra el mensaje con los saltos
de línea y los acentos correctos.

**Pendientes:** El número `WHATSAPP_NUMBER` se toma en el step 14; esta función lo recibe como
parámetro. `formatPhoneForDisplay` del step 06 asume código de área de 3 dígitos: con un área
de 2 (CABA, `5491141234567`) muestra `+54 9 114 123-4567`. El mensaje hereda ese formato; hay
que corregir la función en el step 06 o en uno nuevo.

