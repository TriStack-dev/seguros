# Step 08 — Páginas legales y datos del productor

**Etapa:** 2. Formulario · **Depende de:** 07 · **Leer:** Google Doc "Documentación — MiSeguro (v2)" sección 9

## Objetivo

Publicar la política de privacidad y centralizar los datos del productor asesor que exige la normativa, para que el formulario pueda enlazarlos.

## Contexto

El formulario recolecta DNI, teléfono y email, alcanzados por la Ley 25.326. El texto legal definitivo lo provee o valida el cliente (step 00). Mientras tanto, se publica un borrador claramente marcado.

## Tareas

- [x] `src/content/business.ts`: razón social, nombre del productor, matrícula SSN, dirección, teléfono, email, horario. Todos [PROVISORIO] con valores de ejemplo evidentes (`"Matrícula SSN N° 00000"`).
- [x] Footer y sección de confianza de la landing leen esos datos (reemplazar los placeholders del step 07).
- [x] Página `/privacidad` (Server Component) con un borrador de política que cubra: responsable de los datos, qué datos se recolectan, finalidad (cotizar y contactar), con quién se comparten (aseguradoras para cotizar), plazo de conservación, derechos de acceso, rectificación y supresión (Ley 25.326) y cómo ejercerlos, y la mención a la AAIP como órgano de control. Incluir un aviso visible "Borrador pendiente de validación legal" que se quite cuando el cliente lo apruebe.
- [x] El contenido de la política en un archivo editable (`src/content/privacy.md` o `.ts`).
- [x] Mostrar la matrícula y los datos de contacto en el footer de todas las páginas públicas.

## Criterios de aceptación

- `/privacidad` existe, se lee bien en mobile y se enlaza desde el footer.
- Cambiar un dato del productor en `business.ts` lo cambia en todo el sitio.
- El borrador muestra el aviso de validación pendiente.

## Fuera de alcance

- Inscripción ante la AAIP (gestión del cliente). Checkbox de consentimiento (step 09).

## Notas de implementación

### Qué se hizo

Se agregó `/privacidad` como Server Component con contenido editable, índice de
secciones y aviso visible de borrador pendiente de validación legal.
Se centralizaron los datos de ejemplo del productor, utilizados por el footer,
la sección de confianza y la política. El footer público muestra matrícula,
razón social, productor, domicilio, teléfono, email y horario.
Se consultó la sección 9 del documento funcional y las fuentes oficiales de la AAIP.

### Archivos clave

- `src/lib/business.ts` y `src/content/business.ts`.
- `src/content/privacy.ts` y `src/app/(public)/privacidad/page.tsx`.
- `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`.
- `src/content/landing.ts` y `src/app/globals.css`.

### Decisiones

[0007 — Datos del productor y borrador legal](../decisiones/0007-datos-del-productor-y-borrador-legal.md):
valores provisorios en `src/lib/`, reexportados desde `content/business.ts`;
contenido legal en TypeScript; contactos de ejemplo sin enlaces operativos;
conservación pendiente de definición, sin inventar un plazo.

### Desvíos del spec

Los valores se editan en `src/lib/business.ts` y se exponen a través de
`src/content/business.ts` para cumplir la regla de provisorios de `AGENTS.md`.
La dependencia 07 está integrada en el PR #12 y el usuario confirmó su cierre;
la fila 07 del índice sigue desactualizada y no se modificó por estar fuera del alcance.

### Cómo probarlo

1. Correr `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
2. Iniciar `pnpm start` y abrir `/privacidad` desde el footer de la landing.
3. Comprobar el aviso de borrador, sus siete secciones y los enlaces a AAIP y ley.
4. Revisar a 360, 768 y 1280 px: sin desbordamiento; texto principal de 16 px
   con interlineado de 28 px. Tab y Enter activan “Ir al contenido” y las anclas.
5. Verificar que “Cotizá ahora” vuelve a `/#cotizar` y “Volver al inicio” a `/`.
6. Cambiar un dato en `src/lib/business.ts`, volver a compilar y verificar el
   cambio en footer, confianza de la landing (nombre/matrícula) y política.

Controles locales: lint aprobado (94 advertencias preexistentes en las skills),
typecheck aprobado, 28 tests aprobados y build aprobado. Revisión con Chromium
sobre build de producción en los tres anchos: enlaces, anclas, foco del salto
al contenido, datos del footer y ausencia de errores JavaScript verificados.
El detector automático de Impeccable no pudo ejecutarse porque falta su motor.

### Pendientes

- Step 00: recibir datos reales y aprobación legal; definir plazo de conservación,
  procedimiento de supresión, proveedores y eventuales transferencias.
- Quitar el aviso (`privacyContent.draft = false`) solo tras aprobación y
  revisar las referencias temporales al formulario en preparación al habilitarlo.
- Corregir la fila del step 07 en su propio cierre documental (PR #12).
