# Step 18 — Notas del lead

**Etapa:** 4. Panel · **Depende de:** 17 · **Leer:** —

## Objetivo

Permitir que los asesores dejen notas en cada lead (qué se le cotizó, cuándo volver a llamarlo) con autor y fecha.

## Tareas

- [x] Server Action `addLeadNote(leadId, body)`: `requireAdmin()`, validación Zod (texto de 1 a 2000 caracteres, sin espacios sobrantes en los extremos), guarda autor (id y email) y fecha.
- [x] Sección "Notas" en `/admin/leads/[id]`: lista en orden cronológico (la más vieja arriba), con autor y fecha en hora de Argentina, y respetando los saltos de línea.
- [x] Formulario para agregar una nota (`textarea`), con estado de carga y actualización de la lista sin recargar la página (`revalidatePath` o actualización optimista).
- [x] Las notas no se editan ni se borran desde el panel (quedan como registro).
- [x] El texto se muestra como texto plano (nunca como HTML).

## Criterios de aceptación

- Agregar una nota la muestra al instante con el email del autor y la fecha.
- Una nota vacía o de más de 2000 caracteres es rechazada.
- Un texto con etiquetas HTML se ve literal, sin ejecutarse.

## Fuera de alcance

- Edición o borrado de notas. Menciones o recordatorios.

## Notas de implementación

**Qué se hizo:**

- `src/lib/leads/note.ts` concentra las reglas de la nota (límite de 2000, recorte de extremos y
  los mensajes de error) para que el formulario y la Server Action validen exactamente lo mismo.
- `addLeadNote({ leadId, body })` llama a `requireAdmin()`, valida con Zod (`.trim()` antes de
  `min`/`max`, así se mide el texto ya recortado), verifica que el lead exista, guarda la nota con
  el `id` y el `email` del autor y la fecha del servidor, y revalida solo `/admin/leads/<id>`.
- `getLeadDetail` trae las notas junto al historial de estados, ordenadas por `createdAt`
  ascendente. El modelo ya tenía el índice `[leadId, createdAt]`, así que la consulta no necesitó
  migración.
- La tarjeta "Notas" muestra el formulario y, debajo, la lista con `email · fecha` y el cuerpo en
  texto plano con `whitespace-pre-wrap break-words`.
- El formulario es cliente: `Textarea` con contador `N de 2000 caracteres` (se pone en rojo al
  pasarse), error en línea, botón deshabilitado mientras guarda y limpieza del campo al guardar.

**Archivos clave:**

- `src/lib/leads/note.ts` (+ `note.test.ts`).
- `src/server/actions/lead-note.ts` (+ `lead-note.test.ts`).
- `src/components/admin/leads/lead-note-list.tsx` (+ test) y `lead-note-form.tsx` (+ test).
- `src/server/queries/leads.ts`: `LeadDetail` incluye `notes`.
- `src/app/admin/(protected)/leads/[id]/page.tsx`: tarjeta "Notas".

**Decisiones:**

- La acción recibe un objeto `{ leadId, body }` en lugar de dos parámetros posicionales, para
  seguir el patrón de `changeLeadStatus` (step 17) y devolver el mismo tipo de resultado
  `{ ok } | { ok: false, code, message }`.
- No se usó `useOptimistic`: en Next.js 16 `revalidatePath` dentro de una Server Action re-renderiza
  la ruta y manda el RSC actualizado en la misma respuesta, así que la nota aparece sin pedir la
  página de nuevo ni duplicar estado en el cliente. Verificado en la documentación de
  `server-actions`.
- El botón de guardar solo se deshabilita mientras guarda, no cuando el campo está vacío: así el
  usuario recibe el mensaje "Escribí una nota antes de guardar" en lugar de un botón muerto. El
  límite tampoco se aplica con `maxLength`, para no truncar en silencio un texto pegado: se avisa
  con el contador en rojo y se rechaza al guardar.

**Desvíos del spec:** Ninguno.

**Cómo probarlo:**

1. `pnpm test` (incluye reglas de la nota, acción, lista y formulario).
2. `pnpm build && pnpm start`, entrar al panel con un administrador y abrir un lead.
3. Escribir una nota y guardar: aparece debajo del formulario con el email del autor y la fecha en
   hora de Argentina, y el campo queda vacío.
4. Guardar `<script>alert(1)</script>`: se ve tal cual, literal, y no se ejecuta.
5. Probar con una nota vacía, solo con espacios y de más de 2000 caracteres: las tres se rechazan.

**Pendientes:**

- Ninguno.
