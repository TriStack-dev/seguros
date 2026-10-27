# Step 09 — Formulario de cotización
Rama: `feat/09-quote-form-ui`. Estrategia: single-pr (AGENTS.md exige un step por PR); previsión: 1000–1400 líneas propias. Sin publicación autorizada.
Runner: Vitest; cierre: pnpm lint, pnpm typecheck, pnpm test, pnpm build; navegador si disponible.

## Specs
S1. Requisitos literales del step (se conserva el documento completo hasta sus notas):

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


S2. Restricciones y verificación: ver pedido literal L1; sin persistencia, captcha, WhatsApp ni GA4.

S3. Corrección del usuario (2026-10-27), que reemplaza los campos visibles de S1: "no me parece mal. pero el formulario pide mucho, que solo esten estos datos: Nombre y Apellido: 
Telefono: 
Email: 
Patente:
Marca: 
Modelo:
Año del vehículo:
Código Postal:
Tipo de uso:
DNI:"
Confirmación literal a mantener selector Auto/Moto y checkbox de privacidad: "sisi, eso si."
Alcance confirmado: diez campos en ese orden; teléfono único; quitar versión, GNC y Es 0 km. Conservar catálogo, rutas y envío solo console.log.

## Tasks
- T1 · S1/S2 · inline · implementado · dependencias e infraestructura UI; riesgo item 5 (dependencias).
- T2 · S1 · delegado · implementado · queries y API + tests; paralelismo con T3, superficies disjuntas, contrato getVehicleBrands()/getVehicleModels(brandId).
- T3 · S1/S2 · inline · implementado · LeadForm, combobox, rutas y tests; reutilizar leadFormSchema y constantes.
- T4 · S1/S2 · delegado/inline · pendiente · checks, revisión independiente, correcciones y notas; commit pendiente.

## Log
L1. Pedido original:

Implementá el Step 09 — Formulario de cotización (UI).

Leé primero AGENTS.md, localizá y leé el documento completo del step 09,
docs/reglas-negocio.md secciones 1, 2 y 3, y la decisión 0004 sobre
Controller + Field de shadcn/ui. Comprobá las dependencias 05, 06 y 07.

Consultá Engram sobre el contexto pertinente y usá las skills aplicables.
Consultá Context7 cuando necesites confirmar APIs de las bibliotecas.

Revisá el estado de Git, preservá cambios existentes y trabajá en una
rama que cumpla las convenciones del repo.

Implementá todas las tareas y criterios de aceptación del step:
LeadForm, catálogo de marcas/modelos, ruta API con validación y caché,
campos condicionales, accesibilidad, validación y adaptación móvil.
Integralo en #cotizar y en /cotizar/auto y /cotizar/moto, respetando
el diseño existente.

El envío debe limitarse a console.log de los datos validados.
No implementes persistencia, captcha, WhatsApp ni eventos GA4.

Aplicá mis preferencias de delegación: coordiná el trabajo y utilizá
subagentes cuando aporten valor. Antes de terminar, pedí una revisión
independiente contra los requisitos y el diff, corregí los hallazgos
confirmados y verificá las correcciones.

Ejecutá lint, typecheck, test y build según el repo. Comprobá teclado,
rutas y diseño a 360 px si tenés navegador disponible; si no, informá
qué comprobaciones quedan pendientes.

Completá las notas de implementación exigidas por AGENTS.md y guardá
en Engram las decisiones útiles. Informá resultados y limitaciones
sin declarar comprobaciones que no hiciste.

L2. Dependencias 05, 06 y 07 DONE verificadas en SPEC; main actualizado con fetch. `.atl/` preexistente sin seguimiento, no tocar. Exploración de dependencias delegada, completada.
L3. Diseño: extensión del sistema azul/coral/Geist; modo Operate dentro del panel existente. Sin rediseño. Impeccable context no disponible por instalación ausente; fallback a DESIGN.md y CSS.

L4. RED/GREEN: años decimales aceptados por el esquema → `.int()`; 18 tests schema verdes. UI: import ausente RED → 4 tests de interacción verdes. API/query worker: RED → 10 tests verdes; tuple Zod ajustada por typecheck para garantizar índice definido.
L5. Checks propios: pnpm lint y pnpm typecheck PASS; pnpm test 76/76. Rutas HTTP local: /, /cotizar/auto, /cotizar/moto 200; /cotizar/camion 404; API brandId inválido 400.
L6. Chromium instalado no inicia: libnspr4.so ausente (también fuera del sandbox). Pendiente verificación visual 360 px, teclado en navegador y capturas. Teclado/errores/form submit probados mediante Testing Library, no equivalen a prueba real de navegador. Base local no configurada en .env.local: catálogo real pendiente; se verificó el fallback sin inventar datos.
L7. Riesgos a revisar: item 3 (esquema compartido), item 4 (peticiones obsoletas), item 5 (dependencias). Revisión independiente y build pendientes. Advertencia Next Image quality 80 preexistente, fuera de scope.

L8. Revisión independiente S1 partial: uso undefined impedía superRefine y errores blur de patente/teléfono. Dos tests de regresión RED reproducidos localmente; corrección: grupos Zod independientes por intersección, sin relajar validación. GREEN 27 tests focalizados, incluye 3 pruebas catálogo/teclado del verificador incorporadas como regresión.
L9. Build estándar: falla descarga Geist en sandbox; reintento autorizado supera red pero falla worker Turbopack con EPERM al abrir puerto. No afirmar build PASS. Recheck independiente acotado al bloqueo solicitado.

L10. Recheck independiente RESOLVED: 4 pruebas blur + diferencial baseline 12/12 PASS. Lint/typecheck PASS; suite final81/81. Build alternativo `pnpm build --webpack` PASS con TypeScript/generación/trazas; default Turbopack continúa sin prueba exitosa por EPERM. Revisión estructural independiente no sustituye visual a360px ni DB real.
L11. T4 parcial por comprobaciones de entorno pendientes y revisión nativa antes de cierre. No PR/push ni fila SPEC09 DONE. Implementación sin commits todavía: preservar candidato para decisión sobre pruebas/revisión, no declarar cierre con proof parcial.

L12. Usuario: "funciona todo." (prueba manual reportada por usuario, no evidencia propia de navegador). Revisión nativa adicional rechazada solo para candidato anterior; no desactivar configuración global.
L13. Nueva solicitud literal: "no me parece mal. pero el formulario pide mucho, que solo esten estos datos: Nombre y Apellido: 
Telefono: 
Email: 
Patente:
Marca: 
Modelo:
Año del vehículo:
Código Postal:
Tipo de uso:
DNI:"
L14. Pregunta del agente: "¿mantenemos el selector Auto/Moto y el checkbox de privacidad como controles adicionales?" Usuario: "sisi, eso si." T3/T4 reabiertas para S3, ruta inline; verificación independiente por item3 esquema compartido.

L15. S3 implementada: diez campos ordenados, teléfono único con normalización nacional/internacional sin adivinar división de área; GNC null cuando no se recolecta. Se conservan tipos, consentimiento, catálogo y envío console.log. RED7/26 tests integración y9/9 teléfono; GREEN41 focalizados, suite92/92, lint/typecheck PASS.
L16. Revisión independiente del delta sin bloqueos:6 pruebas propias verifican auto/moto, consentimiento, foco y compatibilidad legacy; build estándar Turbopack PASS con TypeScript/generación10/10. Advisory documental corregida: phoneArea/phoneNumber son strings internos requeridos, no campos opcionales. Diseño/DB real aún no verificados por agente; usuario reportó manualmente que la versión anterior funcionaba.

L17. Incorporadas como regresión las3 pruebas independientes sin dependencia de baseline externo: envío AUTO/MOTO con consentimiento, GNC null y normalización; foco teléfono antes de patente. Compatibilidad legacy comprobada diferencialmente contra snapshot anterior. Suite final95tests18archivos, lint/typecheck PASS.

L18. Usuario autorizó: "perfecto no revises mas nada. subilo y marcalo como done". Confirmó con "si" publicar TriStack-dev/seguros con conexiones Git/GitHub CLI existentes, un único PR pese a superar400líneas y cierre DONE con número real. Revisión nativa adicional rechazada mediante invocación exacta: declined_this_candidate para3cc4fae2..., sin registro ni cambio global. Estrategia exception-ok/single-pr por autorización directa; unidad coherente de Step09, shadcn/lock generados y tests/documentación incluidos.
