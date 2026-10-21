# Step 17 — Detalle del lead y estados

**Etapa:** 4. Panel · **Depende de:** 12, 16 · **Leer:** `docs/reglas-negocio.md` secciones 5 y 8

## Objetivo

Mostrar toda la información de un lead, dar accesos rápidos para contactarlo y permitir cambiar su estado con las transiciones permitidas y su historial.

## Tareas

- [ ] `src/lib/leads/status.ts` + tests: `canTransition(from, to)`, `allowedTransitions(from)`, etiquetas y colores por estado, y `shouldSetFirstContactedAt(lead, to)`. Los tests cubren **todas** las combinaciones de la sección 5.1.
- [ ] Página `/admin/leads/[id]` (Server Component; 404 si no existe):
  - encabezado con número de solicitud, nombre, estado actual y fecha;
  - datos del formulario agrupados (contacto, vehículo, uso y código postal, consentimiento);
  - origen: origen clasificado (`classifySource` del step 12), UTM, gclid, página de entrada y referrer;
  - "Derivado a WhatsApp": sí/no y fecha.
- [ ] Accesos rápidos: "Escribir por WhatsApp" (`wa.me/{teléfono del lead}` sin mensaje), "Llamar" (`tel:`) y "Copiar datos" (copia un resumen de texto al portapapeles con aviso de `sonner`).
- [ ] Server Action `changeLeadStatus(leadId, toStatus, lostReason?)`:
  - `requireAdmin()`, validación con Zod y `canTransition`;
  - en una transacción: actualiza estado y motivo, completa `firstContactedAt` si corresponde, borra el motivo al reabrir, crea el `LeadStatusChange` con id y email del usuario;
  - evita condiciones de carrera: actualizar solo si el estado actual es el que vio el usuario (`where: { id, status: fromStatus }`); si no coincide, devolver "El lead cambió mientras lo veías; recargá la página".
- [ ] UI de cambio de estado: solo muestra las transiciones permitidas; al elegir "Perdido" pide el motivo opcional (`select` con la lista de la sección 5.3).
- [ ] Historial de estados en orden cronológico: estado anterior → nuevo, usuario y fecha en hora de Argentina.
- [ ] Botón para volver al listado conservando los filtros.

## Criterios de aceptación

- Solo se pueden hacer las transiciones de la sección 5.1; intentar otra desde el servidor (por ejemplo, con un request manual) devuelve error.
- `firstContactedAt` se completa una sola vez y no cambia con transiciones posteriores.
- Cada cambio queda en el historial con usuario y fecha.

## Fuera de alcance

- Notas (step 18).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
