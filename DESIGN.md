---
name: MiSeguro — identidad provisoria
description: Sistema visual observado en la landing del step 07.
colors:
  primary: "#ff795f"
  primary-foreground: "#171d2b"
  background: "#101725"
  foreground: "#f7f8fc"
  card: "#202839"
  muted: "#192232"
  muted-foreground: "#c3cad8"
  border: "#414c61"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(3rem, 5.1vw, 4.75rem)"
    fontWeight: 720
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 2.8rem)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontSize: "1.15rem"
    fontWeight: 600
  body:
    lineHeight: 1.75
  label:
    fontSize: "0.9rem"
rounded:
  panel: "1.5rem"
  container: "1rem"
  pill: "100vw"
spacing:
  section: "6rem"
  section-mobile: "3.5rem"
  panel: "2rem"
  panel-compact: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    height: "3.25rem"
    padding: "0 1.6rem"
  quote-panel:
    backgroundColor: "color-mix(in srgb, var(--card) 97%, transparent)"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
---

# Design System: MiSeguro

## Overview

Identidad provisoria del step 07: azul oscuro, coral y Geist, con fotografía estática de auto y moto al atardecer. El contraste entre texto claro, superficies oscuras y un único acento organiza la jerarquía.

Este documento describe la implementación; la fuente de verdad sigue en [globals.css](src/app/globals.css). La dirección, el prototipo de referencia y el prompt de la imagen están registrados en la [decisión 0006](docs/decisiones/0006-identidad-provisoria-de-la-landing.md). No constituye una identidad comercial definitiva.

**Key Characteristics:**

- Superficies azul oscuro con acento coral.
- Tipografía Geist y títulos compactos.
- Fotografía ambiental estática y contenido HTML accesible.

## Colors

### Primary

Coral: CTA, énfasis del título, segunda parte del logo, iconos y números de pasos. Texto oscuro sobre el CTA. Los estados, bordes destacados y foco derivan de `--primary`.

### Neutral

Azul oscuro para el fondo; superficies elevadas para el panel y fondos tonales para beneficios y footer. Texto claro para contenido principal, gris claro para apoyo y bordes discretos para separar información.

## Typography

Geist se carga mediante `next/font` y se comparte entre títulos y cuerpo. El hero usa título balanceado, peso alto y espaciado negativo; el énfasis ocupa una línea propia. Sus límites observados son (13ch) en escritorio y (15ch) en móvil. La descripción del hero limita la línea a (43ch); la introducción de secciones, a (48ch).

El título del hero se adapta en tablet a `clamp(2.75rem, 5.5vw, 4rem)` y en móvil a `clamp(2.6rem, 8vw, 3.75rem)`. Los números de pasos usan cifras tabulares.

## Layout

Contenedor centrado con ancho máximo (76rem), margen horizontal total (3rem), reducido a (2.5rem) en móvil. Hero de dos columnas (1.3fr / 1fr), iguales hasta (1023px); debajo de (768px), el panel se ubica después del texto en una columna. La fotografía usa recorte adaptativo y un degradado oscuro que sostiene la lectura.

Proceso de tres columnas; beneficios, confianza y FAQ de dos columnas. En móvil todos pasan a una columna. El header conserva logo y CTA; oculta los enlaces de navegación en móvil. La separación amplia entre secciones se reduce según la escala del frontmatter.

## Elevation & Depth

Predominan la separación tonal y los bordes. La sombra del panel de cotización (`0 20px 48px #0004`) lo separa de la fotografía; no se generaliza a cada sección. Sin animación ambiental: desplazamiento suave entre anclas y estados de controles; `prefers-reduced-motion` desactiva el desplazamiento suave y reduce las transiciones.

## Shapes

CTA en píldora. Panel con esquinas amplias y borde superior matizado por el acento; contenedor de reseñas con borde discontinuo y radio base. Separadores finos en proceso, FAQ y footer. Iconos lineales de Lucide acompañan contenido sin reemplazar sus etiquetas.

## Components

### Buttons

El CTA principal combina coral y texto oscuro, peso (650) y flecha. Hover con acento al (80%) de opacidad; foco visible coral de (3px), separado (5px). En móvil, el CTA del header mide (2.75rem) de alto y el del hero (3rem). El enlace secundario lleva subrayado y flecha.

### Navigation

Enlaces discretos sobre fondo oscuro; hover coral y foco visible. Logo textual encapsulado en `Logo`, con “Seguro” en coral. Los textos se centralizan en `src/content/landing.ts`.

### Cards / Containers

El panel `#cotizar` es una vista previa estática con iconografía, separadores y aviso explícito. No contiene campos ni envío. Las reseñas pendientes usan un contenedor de borde discontinuo, sin testimonios simulados.

### FAQ

Accordion shadcn de apertura única y colapsable; preguntas alineadas a la izquierda, altura mínima (4rem), respuestas en texto de apoyo e interlineado amplio.

## Do's and Don'ts

### Do:

- Do conservar el acento centralizado en --primary y derivar sus estados.
- Do mantener foco visible, navegación por teclado y movimiento reducido.
- Do conservar el carácter provisorio y explícito de los espacios sin datos confirmados.

### Don't:

- Don't incrustar textos, controles ni marcas dentro de la fotografía.
- Don't presentar el panel estático como formulario operativo ni inventar testimonios o datos comerciales.
