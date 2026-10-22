# 0004 — `field` en lugar de `form` para los componentes base de shadcn/ui

- **Fecha:** 2026-10-22
- **Step:** 01
- **Estado:** Aceptada

## Contexto
El step 01 pide agregar los componentes base de shadcn/ui, entre ellos `form`: el wrapper histórico
(`Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`) que envolvía React Hook Form con el
`FormProvider` y un contexto propio. En el registry actual (shadcn 4.22, estilo `radix-nova`) ese
componente ya no existe: `pnpm dlx shadcn@latest add form` corre sin error pero no escribe ningún
archivo, porque la integración con React Hook Form pasó a hacerse con `Controller` de RHF más el
componente `field` (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`).

## Decisión
Se agrega `field` en lugar de `form`. Los demás componentes del step (`button`, `input`, `label`,
`select`, `checkbox`, `card`, `sonner`) se agregan tal cual. `field` arrastró además `separator`
como dependencia del registry.

## Alternativas descartadas
- **Copiar a mano el `form.tsx` de una versión vieja de shadcn:** queda un componente sin
  mantenimiento, escrito para Tailwind v3 y React 18, dentro de un proyecto con Tailwind v4 y
  React 19.
- **No agregar nada y resolverlo en el step 09 (formulario):** el step 01 existe justamente para
  dejar los componentes base listos; patearlo deja el step 09 arrancando con tooling a medio hacer.

## Consecuencias
- El step 09 (formulario de cotización) se escribe con `Controller` + `Field`, no con `FormField`.
  La doc de referencia es https://ui.shadcn.com/docs/forms/react-hook-form.
- `FieldError` recibe los errores de Zod vía `fieldState.error`, y la accesibilidad depende de
  poner `data-invalid` en el `Field` y `aria-invalid` en el input: hay que hacerlo campo por campo,
  no lo resuelve el wrapper.
- Si el registry vuelve a traer `form`, no hay nada que revertir: `field` seguiría siendo válido.
