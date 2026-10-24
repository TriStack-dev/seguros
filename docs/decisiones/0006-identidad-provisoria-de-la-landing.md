# 0006 — Identidad provisoria de la landing

- **Fecha:** 2026-10-24
- **Step:** 07
- **Estado:** Aceptada

## Contexto

El step 07 requiere una identidad reemplazable hasta el relevamiento del step 00.
El usuario indicó `src/public/Prototipo.png` como guía visual y eligió generar una
escena similar sin interfaz, textos ni marcas. El formulario del prototipo queda
expresamente fuera del alcance de este step.

## Decisión

Usar azul oscuro, coral y Geist mediante `next/font`, con tokens semánticos de
shadcn/Tailwind en `src/app/globals.css`. `--primary` es la fuente única del acento;
los estados relacionados se derivan de ese valor. La marca provisoria se encapsula
en `Logo` y los textos editables se centralizan en `src/content/landing.ts`.

La landing y su layout son Server Components. Solo el Accordion de shadcn requiere
una frontera cliente. `#cotizar` es un panel estático sin campos ni envío que avisa
que todavía no recibe solicitudes. Los datos del productor se identifican como
`[PROVISORIO]`, sin testimonios ni datos comerciales inventados.

La fotografía se generó con `imagegen`, usando el prototipo como referencia de
escena e iluminación. Se convirtió a WebP con Sharp (calidad 85, 1672 × 941,
173918 bytes) y se sirve con `next/image` desde
`public/images/landing-vehicles.webp`. No contiene elementos de interfaz.

Prompt técnico utilizado:

> Generate a photorealistic wide cinematic background photograph for an Argentine car and motorcycle insurance website. Use the supplied image ONLY as a visual reference for the physical scene and lighting. Recreate a similar scene: a dark graphite unbranded modern sedan and black naked motorcycle parked together on wet stone paving outside a contemporary house, distant mountains and city lights at dusk, warm sunset coral light and deep navy blue sky. Vehicles occupy lower left and center, leaving generous dark negative space in upper left for HTML headline and right half for HTML panel. Landscape 16:9 composition. NO text, NO letters, NO UI, NO form, NO buttons, NO logo, NO watermark, NO identifiable vehicle badges. This must be a clean photograph, not a website screenshot. Natural proportions, realistic wheels, elegant atmospheric photography.

## Alternativas descartadas

- Usar el prototipo como fondo: duplicaría textos y controles dentro de la imagen.
- Implementar el formulario o simular campos: corresponde al step 09.
- Inventar un teléfono o enlace de WhatsApp: no hay datos comerciales confirmados.

## Consecuencias

La identidad puede cambiarse desde sus tokens y componentes sin reescribir la
landing. El step 08 debe completar los datos del productor y `/privacidad`; el
step 09 debe reemplazar el interior del panel conservando el ancla `#cotizar`.
El año del footer se calcula al renderizar: al ser una página estática se actualiza
con cada build.
