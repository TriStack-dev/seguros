# Step 07 — Layout base y landing

**Etapa:** 2. Formulario · **Depende de:** 01 · **Leer:** `AGENTS.md` sección "Convenciones de código" (UI)

## Objetivo

Construir la identidad visual base y la landing, con un espacio reservado para el formulario visible desde el primer scroll.

## Contexto

Diseño moderno, limpio y mobile-first. Referencias: multicotizadorseguros.com/ar y organizacionibera.com.ar. Logo, paleta y tipografía son [PROVISORIO] hasta el step 00: usar una propuesta propia definida en tokens para cambiarla en un solo lugar. Si hay skills de UI en el repo, seguirlas.

## Tareas

- [ ] Tokens de diseño (colores, radios, tipografía) en las variables CSS de shadcn/ui / Tailwind. Tipografía con `next/font`.
- [ ] Logo provisorio (texto "MiSeguro" o SVG simple) en un componente `Logo` para reemplazarlo fácil.
- [ ] Layout público `src/app/(public)/layout.tsx`: header (logo y botón "Cotizá ahora" que hace scroll al formulario) y footer (contacto, dirección y matrícula del productor como placeholders [PROVISORIO], enlace a `/privacidad`, año actual).
- [ ] Landing `src/app/(public)/page.tsx` como Server Component:
  - Hero con título, subtítulo y un contenedor `#cotizar` donde irá el formulario (por ahora un placeholder con el mismo tamaño aproximado). En mobile, el formulario empieza en el primer scroll; en desktop, al lado del hero.
  - Sección "Cómo funciona" en 3 pasos (completás, te contactamos por WhatsApp, elegís tu cobertura).
  - Sección de beneficios (asesoramiento personalizado, varias aseguradoras, autos y motos).
  - Sección de confianza con datos del productor (placeholders) y espacio para reseñas futuras.
  - Preguntas frecuentes (4 a 6, contenido [PROVISORIO]) con el componente `accordion`.
- [ ] Textos de la landing en un archivo de contenido (`src/content/landing.ts`) para que el cliente los cambie sin tocar componentes.
- [ ] Imágenes con `next/image`; nada de JavaScript de cliente innecesario en la landing.

## Criterios de aceptación

- Se ve bien en 360 px, 768 px y 1280 px de ancho, sin scroll horizontal.
- Lighthouse en mobile (local, modo producción): Performance ≥ 90 y Accessibility ≥ 95.
- Cambiar el color primario en un solo lugar cambia todo el sitio.

## Fuera de alcance

- El formulario real (step 09). Páginas legales (step 08). Metadatos SEO (step 22).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
