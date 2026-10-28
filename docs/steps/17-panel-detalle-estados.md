# Step 17 — Detalle del lead y estados

**Etapa:** 4. Panel · **Depende de:** 12, 16 · **Leer:** `docs/reglas-negocio.md` secciones 5 y 8

## Objetivo

Mostrar toda la información de un lead, dar accesos rápidos para contactarlo y permitir cambiar su estado con las transiciones permitidas y su historial.

## Tareas

- [x] `src/lib/leads/status.ts` + tests: `canTransition(from, to)`, `allowedTransitions(from)`, etiquetas y colores por estado, y `shouldSetFirstContactedAt(lead, to)`. Los tests cubren **todas** las combinaciones de la sección 5.1.
- [x] Página `/admin/leads/[id]` (Server Component; 404 si no existe):
  - encabezado con número de solicitud, nombre, estado actual y fecha;
  - datos del formulario agrupados (contacto, vehículo, uso y código postal, consentimiento);
  - origen: origen clasificado (`classifySource` del step 12), UTM, gclid, página de entrada y referrer;
  - "Derivado a WhatsApp": sí/no y fecha.
- [x] Accesos rápidos: "Escribir por WhatsApp" (`wa.me/{teléfono del lead}` sin mensaje), "Llamar" (`tel:`) y "Copiar datos" (copia un resumen de texto al portapapeles con aviso de `sonner`).
- [x] Server Action `changeLeadStatus(leadId, toStatus, lostReason?)`:
  - `requireAdmin()`, validación con Zod y `canTransition`;
  - en una transacción: actualiza estado y motivo, completa `firstContactedAt` si corresponde, borra el motivo al reabrir, crea el `LeadStatusChange` con id y email del usuario;
  - evita condiciones de carrera: actualizar solo si el estado actual es el que vio el usuario (`where: { id, status: fromStatus }`); si no coincide, devolver "El lead cambió mientras lo veías; recargá la página".
- [x] UI de cambio de estado: solo muestra las transiciones permitidas; al elegir "Perdido" pide el motivo opcional (`select` con la lista de la sección 5.3).
- [x] Historial de estados en orden cronológico: estado anterior → nuevo, usuario y fecha en hora de Argentina.
- [x] Botón para volver al listado conservando los filtros.

## Criterios de aceptación

- Solo se pueden hacer las transiciones de la sección 5.1; intentar otra desde el servidor (por ejemplo, con un request manual) devuelve error.
- `firstContactedAt` se completa una sola vez y no cambia con transiciones posteriores.
- Cada cambio queda en el historial con usuario y fecha.

## Fuera de alcance

- Notas (step 18).

## Notas de implementación

- **Qué se hizo:**
  - Se agregó `src/lib/leads/status.ts` con `canTransition`, `allowedTransitions`, las etiquetas y variantes de badge por estado, y `shouldSetFirstContactedAt`. Los tests cubren las 25 combinaciones de la sección 5.1, además de las transiciones disponibles y la primera respuesta.
  - Se implementó la página `/admin/leads/[id]` con encabezado, datos agrupados del formulario, origen clasificado y de atribución, acceso rápido a WhatsApp/llamada/copiar y el historial de estados.
  - Se agregó la Server Action `changeLeadStatus` con Zod, `canTransition`, transacción y control de concurrencia por estado de origen. También completa `firstContactedAt` una sola vez, borra el motivo al reabrir y registra usuario y email.
  - La UI de cambio de estado muestra solo las transiciones permitidas y pide el motivo opcional al elegir "Perdido".
  - El listado ahora arma el link al detalle con un parámetro `back` y el detalle vuelve a `/admin/leads` con los filtros y la página.

- **Archivos clave:**
  - `src/lib/leads/status.ts` y `status.test.ts`
  - `src/lib/leads/list-query.ts` y `list-query.test.ts`
  - `src/lib/leads/summary.ts` y `summary.test.ts`
  - `src/lib/format.ts` y `format.test.ts`
  - `src/server/queries/leads.ts` (`getLeadDetail`)
  - `src/server/actions/lead-status.ts`
  - `src/app/admin/(protected)/leads/[id]/page.tsx`
  - `src/components/admin/leads/lead-status-changer.tsx`
  - `src/components/admin/leads/lead-quick-actions.tsx`
  - `src/components/admin/leads/leads-table.tsx`
  - `src/components/admin/leads/leads-filters.tsx`
  - `src/app/admin/(protected)/leads/page.tsx`

- **Decisiones:**
  - `status.ts` es la única fuente de etiquetas y variantes de badge; el listado, los filtros y el detalle lo consumen para no repetir la tabla de estados.
  - El botón "Volver al listado" usa un parámetro `back` con la query del listado. Al reconstruir el link se aceptan solo los filtros conocidos (`search`, fechas, tipo, estado y página), así un valor manipulado no puede redirigir a otro sitio.
  - `firstContactedAt` se completa con un `updateMany` aparte condicionado a `firstContactedAt: null`, dentro de la misma transacción. El update principal solo cambia el estado y el motivo.
  - Las fechas del panel se formatean con `hourCycle: "h23"` para mostrar siempre 24 horas en hora de Argentina.

- **Desvíos del spec:**
  - La Server Action recibe un objeto `{ leadId, fromStatus, toStatus, lostReason }` en lugar de `(leadId, toStatus, lostReason?)`. `fromStatus` es necesario para el control de concurrencia que pide el mismo step (`where: { id, status: fromStatus }`) y para registrar el estado anterior.

- **Cómo probarlo:**
  1. Levantar la base local (`pnpm db:up`), aplicar migraciones y sembrar leads (`pnpm db:deploy`, `pnpm db:seed:leads`); correr `pnpm dev` e iniciar sesión en `/admin/login`.
  2. En `/admin/leads`, aplicar filtros y abrir un lead. Verificar el encabezado, los datos agrupados, el origen, el estado de WhatsApp y que "Volver al listado" recupere los filtros.
  3. Usar "Escribir por WhatsApp", "Llamar" y "Copiar datos"; este último tiene que mostrar el aviso de `sonner`.
  4. Cambiar `Nuevo → Contactado` y `Contactado → Cotizado`; verificar el historial con usuario y fecha. Probar también un salto directo (`Nuevo → Cotizado`) y un retroceso de un estado.
  5. Pasar a "Perdido" con y sin motivo, y reabrir a "Contactado": el motivo tiene que borrarse.
  6. Abrir el mismo lead en dos pestañas, cambiar el estado en una y enviar desde la otra: tiene que aparecer "El lead cambió mientras lo veías; recargá la página".
  7. Comprobar que un cambio no permitido (por ejemplo `Emitido → Perdido`) se rechaza desde el servidor.
  8. Abrir un id inexistente o inválido: tiene que devolver 404.

- **Pendientes:**
  - Ninguno.

