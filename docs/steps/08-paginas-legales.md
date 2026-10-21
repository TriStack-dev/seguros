# Step 08 — Páginas legales y datos del productor

**Etapa:** 2. Formulario · **Depende de:** 07 · **Leer:** Google Doc "Documentación — MiSeguro (v2)" sección 9

## Objetivo

Publicar la política de privacidad y centralizar los datos del productor asesor que exige la normativa, para que el formulario pueda enlazarlos.

## Contexto

El formulario recolecta DNI, teléfono y email, alcanzados por la Ley 25.326. El texto legal definitivo lo provee o valida el cliente (step 00). Mientras tanto, se publica un borrador claramente marcado.

## Tareas

- [ ] `src/content/business.ts`: razón social, nombre del productor, matrícula SSN, dirección, teléfono, email, horario. Todos [PROVISORIO] con valores de ejemplo evidentes (`"Matrícula SSN N° 00000"`).
- [ ] Footer y sección de confianza de la landing leen esos datos (reemplazar los placeholders del step 07).
- [ ] Página `/privacidad` (Server Component) con un borrador de política que cubra: responsable de los datos, qué datos se recolectan, finalidad (cotizar y contactar), con quién se comparten (aseguradoras para cotizar), plazo de conservación, derechos de acceso, rectificación y supresión (Ley 25.326) y cómo ejercerlos, y la mención a la AAIP como órgano de control. Incluir un aviso visible "Borrador pendiente de validación legal" que se quite cuando el cliente lo apruebe.
- [ ] El contenido de la política en un archivo editable (`src/content/privacy.md` o `.ts`).
- [ ] Mostrar la matrícula y los datos de contacto en el footer de todas las páginas públicas.

## Criterios de aceptación

- `/privacidad` existe, se lee bien en mobile y se enlaza desde el footer.
- Cambiar un dato del productor en `business.ts` lo cambia en todo el sitio.
- El borrador muestra el aviso de validación pendiente.

## Fuera de alcance

- Inscripción ante la AAIP (gestión del cliente). Checkbox de consentimiento (step 09).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
