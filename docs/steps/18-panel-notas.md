# Step 18 — Notas del lead

**Etapa:** 4. Panel · **Depende de:** 17 · **Leer:** —

## Objetivo

Permitir que los asesores dejen notas en cada lead (qué se le cotizó, cuándo volver a llamarlo) con autor y fecha.

## Tareas

- [ ] Server Action `addLeadNote(leadId, body)`: `requireAdmin()`, validación Zod (texto de 1 a 2000 caracteres, sin espacios sobrantes en los extremos), guarda autor (id y email) y fecha.
- [ ] Sección "Notas" en `/admin/leads/[id]`: lista en orden cronológico (la más vieja arriba), con autor y fecha en hora de Argentina, y respetando los saltos de línea.
- [ ] Formulario para agregar una nota (`textarea`), con estado de carga y actualización de la lista sin recargar la página (`revalidatePath` o actualización optimista).
- [ ] Las notas no se editan ni se borran desde el panel (quedan como registro).
- [ ] El texto se muestra como texto plano (nunca como HTML).

## Criterios de aceptación

- Agregar una nota la muestra al instante con el email del autor y la fecha.
- Una nota vacía o de más de 2000 caracteres es rechazada.
- Un texto con etiquetas HTML se ve literal, sin ejecutarse.

## Fuera de alcance

- Edición o borrado de notas. Menciones o recordatorios.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
