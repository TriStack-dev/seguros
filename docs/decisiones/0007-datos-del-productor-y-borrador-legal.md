# 0007 — Datos del productor y borrador legal

- **Fecha:** 2026-10-24
- **Step:** 08
- **Estado:** Aceptada

## Contexto

El step 08 pide datos editables en `src/content/business.ts`, mientras que
`AGENTS.md` exige centralizar los valores [PROVISORIO] en `src/lib/`.
La sección 9 del documento funcional deja los datos y el texto legal a validar
por el cliente. El plazo de conservación sigue sin definición.

## Decisión

Guardar los ejemplos en `src/lib/business.ts` y reexportarlos desde
`src/content/business.ts`, punto de acceso de las páginas. La landing, el footer
y la política consumen el mismo objeto. Mantener los ejemplos como texto sin
enlaces de llamada o email, para no presentarlos como canales operativos.

Usar `src/content/privacy.ts` para el borrador editable, interpolando los datos
del productor. La propiedad `draft` controla el aviso de validación pendiente.
No inventar un plazo de retención: explicitar que debe definirse antes del
lanzamiento y que no se implementa borrado automático en este step.

## Alternativas descartadas

- Duplicar datos en landing, footer y política: permite inconsistencias.
- Hardcodear ejemplos en `content/`: contradice la convención de provisorios.
- Publicar un plazo arbitrario: no existe una definición aprobada del cliente.

## Consecuencias

Un cambio en `src/lib/business.ts` se refleja en todas las superficies a través
de `content/business.ts`. Al recibir la aprobación deben reemplazarse los
ejemplos, revisar la política y definir la conservación y su procedimiento.
Solo entonces corresponde quitar el aviso (`draft: false`).

Referencias consultadas:

- [Documento funcional, sección 9](https://docs.google.com/document/d/12Py72ZPMoXFoc0B61a3iz9mDZQS4YYupTA6zhxeh--I/edit).
- [Derechos ante la AAIP](https://www.argentina.gob.ar/aaip/datospersonales/derechos).
- [Ley 25.326, texto actualizado](https://www.argentina.gob.ar/normativa/nacional/64790/actualizacion).
