# Step 09 — Formulario de cotización (UI)

**Etapa:** 2. Formulario · **Depende de:** 05, 06, 07 · **Leer:** `docs/reglas-negocio.md` secciones 1, 2 y 3

## Objetivo

Construir el formulario de autos y motos con validación campo por campo, listas de marca y modelo desde el catálogo, y ubicarlo en la landing y en las rutas para anuncios.

## Tareas

- [ ] Componente cliente `LeadForm` en `src/components/public/` con React Hook Form + `zodResolver(leadFormSchema)` (step 06), usando `Controller` de React Hook Form y los componentes `field` de shadcn/ui (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`), según la [decisión 0004](../decisiones/0004-field-en-lugar-de-form-de-shadcn.md).
- [ ] Conectar `FieldError` con `fieldState.error` de cada `Controller`, indicar `data-invalid` en `Field` y `aria-invalid` en el control, y asociar las etiquetas, descripciones y errores con sus campos.
- [ ] Selector de tipo de vehículo (auto / moto) como botones grandes al inicio. Cambiar el tipo resetea marca, modelo, GNC y uso.
- [ ] Marca: combobox con búsqueda (`command` + `popover` de shadcn/ui) cargado con las marcas del tipo elegido, más la opción "Otro" que habilita un campo de texto.
- [ ] Modelo: combobox que se carga al elegir la marca desde `GET /api/vehicles/models?brandId=…` (route handler con validación Zod y caché de una hora), más la opción "Otro". Si la marca es "Otro", el modelo es un campo de texto.
- [ ] Las marcas se obtienen en el servidor (Server Component padre) desde `src/server/queries/vehicles.ts` y se pasan como props.
- [ ] Teléfono en dos campos (área y número) con texto de ayuda ("Sin 0" / "Sin 15").
- [ ] Checkbox "Es 0 km" que oculta la patente. GNC solo para autos. Tipo de uso con las opciones del tipo de vehículo.
- [ ] Checkbox de consentimiento con enlace a `/privacidad` (se abre en otra pestaña).
- [ ] Campo honeypot `website` oculto con CSS (no `display:none` por accesibilidad: fuera de pantalla, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`).
- [ ] Validación al salir de cada campo (`mode: "onTouched"`), errores debajo de cada campo y foco en el primer error al enviar.
- [ ] Teclados móviles correctos: `inputMode="numeric"` en DNI, año, área y número; `type="email"` en email; `autoComplete` en nombre, email y teléfono.
- [ ] Botón "Iniciar cotización" con estado de carga. **En este step el envío solo hace `console.log` de los datos validados**; el envío real es el step 10.
- [ ] Ubicación: dentro de `#cotizar` en la landing (reemplaza el placeholder del step 07) y en `src/app/(public)/cotizar/[tipo]/page.tsx` para `auto` y `moto`, con el tipo preseleccionado. Cualquier otro valor de `[tipo]` devuelve 404.

## Criterios de aceptación

- Todas las reglas de validación se ven en la UI con mensajes en español.
- En un celular (o emulación a 360 px) el formulario es cómodo de completar y el teclado correcto aparece en cada campo.
- Se puede completar entero con el teclado (Tab, flechas en los combobox, Enter para enviar).
- `/cotizar/moto` abre con moto elegida y muestra los usos de moto.

## Fuera de alcance

- Guardar el lead (step 10). Captcha (step 11). Eventos de GA4 (step 21).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
