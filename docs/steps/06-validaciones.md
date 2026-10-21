# Step 06 — Esquemas de validación

**Etapa:** 2. Formulario · **Depende de:** 01 · **Leer:** `docs/reglas-negocio.md` secciones 1, 2 y 3

## Objetivo

Implementar en funciones puras todas las validaciones y normalizaciones del formulario, con un esquema Zod único que usan el navegador y el servidor.

## Tareas

- [ ] Instalar Zod (versión estable).
- [ ] `src/lib/constants.ts` (o `src/lib/leads/constants.ts`): tipos de vehículo, tipos de uso con etiquetas y a qué tipo de vehículo aplican, año mínimo, y demás valores [PROVISORIO]. Los valores tienen que coincidir con los enums de Prisma (step 04).
- [ ] `src/lib/validation/normalizers.ts` + tests: `normalizePhone(area, number)` → `549…` o error tipado, `formatPhoneForDisplay`, `normalizeDni`, `normalizePlate`, `normalizePostalCode`, `normalizeName`.
- [ ] `src/lib/validation/plate.ts` + tests: `isValidPlate(plate, vehicleType)` con los cuatro formatos.
- [ ] `src/lib/validation/lead-form.ts`: esquema `leadFormSchema` con todas las reglas, incluidas las condicionales:
  - patente obligatoria salvo `isZeroKm`;
  - `hasGnc` obligatorio en autos y ausente en motos;
  - `usage` válido para el tipo de vehículo;
  - marca del catálogo (`brandId`) **o** `brandOther`; lo mismo para el modelo; si la marca es "Otro", el modelo es texto libre;
  - honeypot `website` vacío.
- [ ] Exportar el tipo `LeadFormInput` (entrada del formulario) y `LeadFormData` (datos normalizados, listos para guardar).
- [ ] Mensajes de error en español rioplatense, cortos y accionables.
- [ ] Tests unitarios del esquema con casos válidos e inválidos de cada campo, incluidos los casos borde de teléfono (con 0, con 15, con guiones) y de patente (auto con formato de moto y al revés).

## Criterios de aceptación

- `pnpm test` cubre cada regla de las secciones 2 y 3 de las reglas de negocio con al menos un caso válido y uno inválido.
- El esquema no depende de nada de servidor (se puede importar desde un componente cliente).
- No hay valores provisorios repetidos fuera de `constants.ts`.

## Fuera de alcance

- UI del formulario (step 09). Validación de que `brandId` exista en la base (step 10).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
