# Step 06 — Esquemas de validación

**Etapa:** 2. Formulario · **Depende de:** 01 · **Leer:** `docs/reglas-negocio.md` secciones 1, 2 y 3

## Objetivo

Implementar en funciones puras todas las validaciones y normalizaciones del formulario, con un esquema Zod único que usan el navegador y el servidor.

## Tareas

- [x] Instalar Zod (versión estable).
- [x] `src/lib/constants.ts`: tipos de vehículo, tipos de uso con etiquetas y a qué tipo de vehículo aplican, año mínimo, y demás valores [PROVISORIO]. Los valores tienen que coincidir con los enums de Prisma (step 04).
- [x] `src/lib/validation/normalizers.ts` + tests: `normalizePhone(area, number)` → `549…` o error tipado, `formatPhoneForDisplay`, `normalizeDni`, `normalizePlate`, `normalizePostalCode`, `normalizeName`.
- [x] `src/lib/validation/plate.ts` + tests: `isValidPlate(plate, vehicleType)` con los cuatro formatos.
- [x] `src/lib/validation/lead-form.ts`: esquema `leadFormSchema` con todas las reglas, incluidas las condicionales:
  - patente obligatoria salvo `isZeroKm`;
  - `hasGnc` obligatorio en autos y ausente en motos;
  - `usage` válido para el tipo de vehículo;
  - marca del catálogo (`brandId`) **o** `brandOther`; lo mismo para el modelo; si la marca es "Otro", el modelo es texto libre;
  - honeypot `website` vacío.
- [x] Exportar el tipo `LeadFormInput` (entrada del formulario) y `LeadFormData` (datos normalizados, listos para guardar).
- [x] Mensajes de error en español rioplatense, cortos y accionables.
- [x] Tests unitarios del esquema con casos válidos e inválidos de cada campo, incluidos los casos borde de teléfono (con 0, con 15, con guiones) y de patente (auto con formato de moto y al revés).

## Criterios de aceptación

- `pnpm test` cubre cada regla de las secciones 2 y 3 de las reglas de negocio con al menos un caso válido y uno inválido.
- El esquema no depende de nada de servidor (se puede importar desde un componente cliente).
- No hay valores provisorios repetidos fuera de `constants.ts`.

## Fuera de alcance

- UI del formulario (step 09). Validación de que `brandId` exista en la base (step 10).

## Notas de implementación

- **Qué se hizo:** Se instaló Zod. Se creó `src/lib/constants.ts` con tipos de vehículo, tipos de uso, etiquetas, mapeo por vehículo, estados, motivos de pérdida y año mínimo. Se implementaron normalizadores (`normalizePhone`, `normalizeDni`, `normalizePlate`, `normalizePostalCode`, `normalizeName`, `formatPhoneForDisplay`) con `ValidationError` tipado. Se implementó `isValidPlate` para autos y motos con formatos viejo y Mercosur. Se creó `leadFormSchema` con todas las validaciones condicionales (patente obligatoria salvo 0 km, GNC obligatorio solo en autos y normalizado a null en motos, uso válido por tipo, marca/modelo con opción "Otro", honeypot). Se exportaron `LeadFormInput` y `LeadFormData`. Se agregaron tests unitarios para normalizadores, patentes y esquema completo.
- **Archivos clave:** `src/lib/constants.ts`, `src/lib/validation/normalizers.ts`, `src/lib/validation/normalizers.test.ts`, `src/lib/validation/plate.ts`, `src/lib/validation/plate.test.ts`, `src/lib/validation/lead-form.ts`, `src/lib/validation/lead-form.test.ts`
- **Decisiones:** Los valores provisorios (año mínimo, listas) se concentran en `constants.ts`. El esquema es puramente cliente/servidor (sin dependencias de DB). Se agrega `phone` normalizado y `plateNormalized` al output cuando corresponda.
- **Desvíos del spec:** Ninguno.
- **Cómo probarlo:** `pnpm test` debe pasar con todos los tests de validación. El esquema se puede importar desde componentes cliente sin errores.
- **Pendientes:** Ninguno.
