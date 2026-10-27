# Step 09 — Formulario de cotización (UI)

**Etapa:** 2. Formulario · **Depende de:** 05, 06, 07 · **Leer:** `docs/reglas-negocio.md` secciones 1, 2 y 3

## Objetivo

Construir el formulario de autos y motos con validación campo por campo, listas de marca y modelo desde el catálogo, y ubicarlo en la landing y en las rutas para anuncios.

## Tareas

- [x] Componente cliente `LeadForm` en `src/components/public/` con React Hook Form + `zodResolver(leadFormSchema)` (step 06), usando `Controller` de React Hook Form y los componentes `field` de shadcn/ui (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`), según la [decisión 0004](../decisiones/0004-field-en-lugar-de-form-de-shadcn.md).
- [x] Conectar `FieldError` con `fieldState.error` de cada `Controller`, indicar `data-invalid` en `Field` y `aria-invalid` en el control, y asociar las etiquetas, descripciones y errores con sus campos.
- [x] Selector de tipo de vehículo (auto / moto) como botones grandes al inicio. Cambiar el tipo resetea marca, modelo y uso.
- [x] Marca: combobox con búsqueda (`command` + `popover` de shadcn/ui) cargado con las marcas del tipo elegido, más la opción "Otro" que habilita un campo de texto.
- [x] Modelo: combobox que se carga al elegir la marca desde `GET /api/vehicles/models?brandId=…` (route handler con validación Zod y caché de una hora), más la opción "Otro". Si la marca es "Otro", el modelo es un campo de texto.
- [x] Las marcas se obtienen en el servidor (Server Component padre) desde `src/server/queries/vehicles.ts` y se pasan como props.
- [x] Teléfono en un solo campo con código de área y número, teclado telefónico y ayuda "sin 0 ni 15".
- [x] Mostrar únicamente nombre y apellido, teléfono, email, patente, marca, modelo, año del vehículo, código postal, tipo de uso y DNI, en ese orden; conservar Auto/Moto y privacidad. No pedir versión, GNC ni "Es 0 km". Tipo de uso con las opciones del tipo de vehículo.
- [x] Checkbox de consentimiento con enlace a `/privacidad` (se abre en otra pestaña).
- [x] Campo honeypot `website` oculto con CSS (no `display:none` por accesibilidad: fuera de pantalla, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`).
- [x] Validación al salir de cada campo (`mode: "onTouched"`), errores debajo de cada campo y foco en el primer error al enviar.
- [x] Teclados móviles correctos: `inputMode="numeric"` en DNI y año, `type="tel"` en teléfono; `type="email"` en email; `autoComplete` en nombre, email y teléfono.
- [x] Botón "Iniciar cotización" con estado de carga. **En este step el envío solo hace `console.log` de los datos validados**; el envío real es el step 10.
- [x] Ubicación: dentro de `#cotizar` en la landing (reemplaza el placeholder del step 07) y en `src/app/(public)/cotizar/[tipo]/page.tsx` para `auto` y `moto`, con el tipo preseleccionado. Cualquier otro valor de `[tipo]` devuelve 404.

## Criterios de aceptación

- Todas las reglas de validación se ven en la UI con mensajes en español.
- En un celular (o emulación a 360 px) el formulario es cómodo de completar y el teclado correcto aparece en cada campo.
- Se puede completar entero con el teclado (Tab, flechas en los combobox, Enter para enviar).
- `/cotizar/moto` abre con moto elegida y muestra los usos de moto.

## Fuera de alcance

- Guardar el lead (step 10). Captcha (step 11). Eventos de GA4 (step 21).

## Notas de implementación

### Qué se hizo

- Se agregó `LeadForm` con React Hook Form, `zodResolver(leadFormSchema)` y `Controller` + `Field`, con mensajes de error asociados, validación al salir del campo y foco en errores al enviar.
- Se integraron marcas desde el servidor y modelos por API validada con Zod y caché de una hora, búsqueda en combobox y alternativas «Otro», carga, error y reintento.
- Se implementaron limpieza de dependencias, consentimiento y honeypot fuera de pantalla, con teclados móviles y una columna en pantallas angostas. Por corrección del usuario se redujo a diez campos, manteniendo Auto/Moto y privacidad; teléfono único y sin versión, GNC ni 0 km.
- Se reemplazó el placeholder de `#cotizar` y se agregaron `/cotizar/auto` y `/cotizar/moto`; los tipos desconocidos devuelven 404.
- El envío solo registra datos validados en la consola, con aviso de demostración. No se agregó persistencia, captcha, WhatsApp ni GA4.

### Archivos clave

- `src/components/public/{lead-form,catalog-combobox,quote-form-section}.tsx` y tests.
- `src/server/queries/vehicles.ts` y tests.
- `src/app/api/vehicles/models/route.ts` y tests.
- `src/app/(public)/cotizar/[tipo]/page.tsx`, tests y landing `page.tsx`.
- `src/app/globals.css`, componentes shadcn generados y dependencias de formulario/tests.
- `src/lib/validation/lead-form.ts` y test de año entero.

### Decisiones

Se mantiene [0004](../decisiones/0004-field-en-lugar-de-form-de-shadcn.md). [0008](../decisiones/0008-catalogo-y-formulario-de-cotizacion.md) documenta caché, estados de catálogo, descarte del honeypot y envío de demostración. Se preservó el sistema visual existente.

### Desvíos del spec

Se simplificaron los campos y unificó el teléfono por pedido y confirmación del usuario (2026-10-27), actualizando las reglas de negocio. GNC no informado queda null, nunca se inventa false. Se corrigió el esquema del step 06 para rechazar años decimales y evitar que un uso vacío suprima errores de otros campos: las reglas ya exigían enteros y validación por campo. El resto se limita al alcance del step 09. Por autorización del usuario, la fila 09 de `SPEC.md` se marcó `DONE · 2026-10-27 · Teo · #27`, con las limitaciones de verificación detalladas abajo. No se modificaron otras filas.

### Cómo probarlo

1. Configurar la base local según `.env.example`, ejecutar los steps de migración/seed ya existentes y `pnpm dev`.
2. En `/`, ir a `#cotizar`; elegir auto/moto, buscar marca y modelo con teclado y probar «Otro». Cambiar tipo/marca y verificar que se limpian los dependientes.
3. Completar los datos, salir de cada campo para ver errores y enviar con Enter. Verificar el foco, el consentimiento, el orden de los diez campos y que no se pidan versión, GNC ni 0 km. El único resultado es `console.log` de datos validados y un aviso de demostración.
4. Abrir `/cotizar/moto`: moto preseleccionada, Delivery disponible y GNC oculto. `/cotizar/auto` muestra sus usos; `/cotizar/camion` devuelve 404.
5. Correr `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
6. Repetir en navegador a 360 px, completar por Tab/flechas/Enter y comprobar contraste, foco, errores y ausencia de desbordamiento.

### Verificación observada

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS, 95 tests en 18 archivos.
- `pnpm build`: PASS con Turbopack, TypeScript y generación 10/10, tras la simplificación. Los intentos iniciales tuvieron fallos de red/EPERM; el build alternativo con Webpack también había pasado.
- HTTP local: `/`, `/cotizar/auto`, `/cotizar/moto` 200; `/cotizar/camion` 404; API con `brandId=invalid` 400.
- Tests de interacción: validación blur/foco, defaults moto, resets, atributos móviles y envío validado solo a consola. Tests API/query con mocks: filtro de marca, validación UUID, errores sin caché y configuración de TTL.

### Pendientes

- Revisión independiente realizada: detectó bloqueo de validación blur por uso vacío; corregido con grupos Zod independientes. Recheck acotado: 4 pruebas blur y 12 comparaciones de esquema contra la base PASS. Se incorporaron también 3 tests de catálogo/teclado.
- Revisión independiente de la simplificación: sin bloqueos. Verificó orden de campos, envío auto/moto, consentimiento, foco y compatibilidad del teléfono anterior, con 6 pruebas independientes.
- Verificación visual a 360 px y recorrido completo en navegador real: Chromium no inicia por falta de `libnspr4.so`, incluso fuera del sandbox. Testing Library no sustituye esta comprobación.
- Verificación del catálogo contra una base real: este entorno no tiene `DATABASE_URL` configurada. Se verificó la respuesta de fallback y las consultas con mocks, no conectividad ni seed real.
- PR [#27](https://github.com/TriStack-dev/seguros/pull/27) publicado por autorización explícita del usuario; CI en verde en [run 40574824788](https://github.com/TriStack-dev/seguros/actions/runs/40574824788), para el commit `c1d49f1`: instalación, lint, typecheck, tests y build.
- Advertencia preexistente de Next Image por `quality=80` fuera de `images.qualities`, observada en desarrollo; fuera del alcance del step.
