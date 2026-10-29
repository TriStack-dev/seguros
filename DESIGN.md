---
name: MiSeguro — identidad provisoria
description: Sistema visual compartido por la cotización pública y la gestión de consultas.
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
    fontSize: "clamp(2.6rem, 4.6vw, 4rem)"
    fontWeight: 720
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontSize: "1.15rem"
    fontWeight: 600
  body:
    lineHeight: 1.6
  label:
    fontSize: "0.9rem"
rounded:
  panel: "1.5rem"
  control: "0.5rem"
  container: "0.8rem"
  pill: "100vw"
spacing:
  section: "6rem"
  section-mobile: "3.5rem"
  panel: "clamp(1.25rem, 3vw, 2.25rem)"
  panel-compact: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    height: "3.25rem"
    padding: "0 1.6rem"
  form-control:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "2.75rem"
    padding: "0.65rem 0.75rem"
  hero-quote:
    backgroundColor: "color-mix(in srgb, var(--card) 97%, transparent)"
    rounded: "{rounded.panel}"
    padding: "1.35rem"
---

# Design System: MiSeguro

## Overview

Identidad provisoria, conservada en la cotización pública y extendida al panel de administración: azul profundo, coral y Geist. En escritorio, el hero y un formulario compacto comparten la primera vista; en pantallas de hasta (900px), el diseño se apila. La fotografía de vehículos permanece como fondo estático y no sustituye el contenido.

Este documento describe la implementación; la fuente de verdad sigue en [globals.css](src/app/globals.css) y [admin.css](src/app/admin/admin.css). La dirección y el origen de la identidad provisoria están registrados en la [decisión 0006](docs/decisiones/0006-identidad-provisoria-de-la-landing.md). No constituye una identidad comercial definitiva.

**Key Characteristics:**

- Azul oscuro y superficies tonales con coral como acento único.
- Tipografía Geist, campos legibles y agrupación semántica.
- Cotización lateral progresiva, de etapas visibles y alineación tranquila, junto con un panel administrativo organizado para lectura rápida.

**The Side-by-Side Rule.** En escritorio, conservar texto del hero y formulario dentro de una composición de dos columnas; apilar al reducirse el viewport.

## Colors

### Primary

Coral: CTA, énfasis, estados seleccionados y foco visible. El texto oscuro conserva el contraste del botón principal. El panel administrativo reutiliza los mismos roles en su navegación, acciones y estados.

### Neutral

Azul profundo para el fondo; superficies elevadas para formularios, navegación y tarjetas; tonos más oscuros para controles. Texto claro para contenido principal, gris claro para apoyo y bordes discretos para estructura. Los colores exclusivos de administración están acotados a `.admin-shell` y `.admin-auth` en `admin.css`; no redefinen la paleta pública.

## Typography

Geist, cargada mediante `next/font`, se comparte entre encabezados, texto y controles. El hero usa un título fluido, de peso alto y espaciado negativo, con un máximo de (16ch) en escritorio y (15ch) en móvil. En tablet se reduce a `clamp(2.75rem, 5.5vw, 3.6rem)`; en móvil a `clamp(2.6rem, 8vw, 3.75rem)`. Los controles del formulario conservan texto de (1rem); títulos y rótulos subordinados usan tamaños compactos.

## Layout

En escritorio, el hero ubica el texto a la izquierda y el formulario a la derecha, con ancho máximo de (30rem); no se convierte en una sección inferior independiente. A (900px) o menos, las columnas se apilan. El panel compacto abre con «Cotizá tu seguro», una breve introducción contextual y un indicador visible de tres etapas: «Tus datos», «Vehículo» y «Envío». La ruta `/cotizar` conserva el formulario completo en su formato original.

La etapa de contacto mantiene los campos en una columna. En la etapa de vehículo, «0 km» ocupa todo el ancho; patente/año y marca/modelo se alinean en pares cuando hay espacio, mientras los campos alternativos permanecen anchos. El grupo de uso se adapta a los cortes de contenedor de (26rem) y (64rem); los campos marcados como anchos ocupan toda la fila. El avance valida antes de continuar; volver mantiene los valores ingresados. Si hay errores, se revela la etapa correcta y se enfoca el campo con error.

En administración, el header admite navegación refluida por debajo de (900px), los filtros pasan de seis columnas a dos y luego una, y la ficha se apila en móvil. El listado expone «Ver detalle» junto a la solicitud en móvil y en una columna de acción en escritorio. La fila también abre el detalle con clic simple; los enlaces internos, los modificadores del navegador y la selección de texto conservan su comportamiento. La tabla mantiene sus columnas dentro de una región con desplazamiento horizontal accesible.

## Elevation & Depth

Predominan superficies tonales, bordes y separación antes que sombras. El panel del formulario usa la superficie de tarjeta; el panel administrativo distingue filtros, navegación y datos con fondos cercanos y bordes. Las transiciones son breves y no esenciales; `prefers-reduced-motion` reduce o desactiva el movimiento.

## Shapes

El CTA conserva forma de píldora. El panel lateral público usa esquinas amplias (radio de (1.5rem)); controles usan radios más ajustados (8px). En administración, navegación y paneles emplean radios contenidos (aprox. 9–14px). El foco visible general usa un contorno coral de (3px), separado del control; el modo compacto de la cotización lo reduce a (2px) y elimina la sombra del foco. Los errores se distinguen también por borde y mensaje, no solo por color.

## Components

### Buttons and Controls

El CTA principal conserva coral, texto oscuro, flecha y estados de hover y foco. Los campos tienen altura mínima de (2.75rem), texto de (1rem) y foco visible; los grupos de vehículo presentan selección con fondo tonal y borde coral. Las acciones del panel mantienen al menos (44px) de altura.

### Public Quote Form

El formulario de la landing conserva todos los campos y funcionalidades, presentados en tres etapas con introducción breve por etapa. La lista ordenada marca la etapa actual (`aria-current="step"`), indica las completadas y conserva el anuncio de estado para lectores de pantalla. Los `legend` se ocultan visualmente en el modo compacto, pero permanecen accesibles. Continuar valida el grupo actual; volver conserva sus datos; ante errores se revela la etapa correspondiente y se devuelve el foco. El primer botón de continuación ocupa el ancho completo; las acciones de volver y continuar y el envío final conservan un pie alineado. En `/cotizar`, el formulario sigue completo, sin etapas compactas.

**The Progressive Form Rule.** El cambio de presentación no debe descartar datos, debilitar validaciones ni ocultar errores: cada error revela su etapa y recibe foco.

Los controles y botones del modo compacto usan un contorno de foco coral de (2px) con separación, sin sombra apilada. El formulario conserva así una señal de foco nítida sin agregar ruido visual.

### Admin Navigation and Leads

La navegación resalta la sección actual con una superficie tonal y un indicador coral. El listado mantiene jerarquía de encabezados, estados legibles y el acceso explícito «Ver detalle» en cada fila. En escritorio, la acción queda al final de la fila; en móvil acompaña al número de solicitud. El clic en el resto de la fila también navega, salvo cuando se activa un enlace/acción, se usa un modificador o se selecciona texto. La ficha prioriza el nombre, después organiza Contacto y Vehículo frente a Gestión e Historial de estados, y mantiene el origen de la consulta dentro de un `<details>` nativo. El listado continúa desplazable por teclado.

**The Detail-First Rule.** Mantener la acción explícita además del acceso por fila; la fila no debe interferir con enlaces ni gestos de selección.

### FAQ

Accordion shadcn de apertura única y colapsable; preguntas alineadas a la izquierda, altura mínima (4rem), respuestas en texto de apoyo e interlineado amplio.

## Do's and Don'ts

### Do:

- Do mantener el acento centralizado en `--primary` y derivar de él estados y foco.
- Do preservar etiquetas, foco visible, navegación por teclado y movimiento reducido.
- Do mantener el formulario compacto a la derecha del hero en escritorio y apilarlo hasta (900px).
- Do adaptar las etapas del formulario al ancho real del contenedor con los cortes actuales de (26rem) y (64rem).
- Do mantener contacto en una columna y reservar el ancho completo para «0 km» y los campos alternativos del vehículo.
- Do mantener el carácter provisorio y explícito de los espacios sin datos confirmados.

### Don't:

- Don't convertir el formulario lateral compacto de la landing en una sección ancha separada ni cambiar el formulario completo de `/cotizar`.
- Don't sustituir campos funcionales por una vista previa estática ni alterar validaciones o acciones existentes.
- Don't presentar estadísticas, testimonios o datos comerciales no verificados.
