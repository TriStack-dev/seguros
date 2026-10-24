# Step 07 — Layout base y landing

**Etapa:** 2. Formulario · **Depende de:** 01 · **Leer:** `AGENTS.md` sección "Convenciones de código" (UI)

## Objetivo

Construir la identidad visual base y la landing, con un espacio reservado para el formulario visible desde el primer scroll.

## Contexto

Diseño moderno, limpio y mobile-first. Referencias: multicotizadorseguros.com/ar y organizacionibera.com.ar. Logo, paleta y tipografía son [PROVISORIO] hasta el step 00: usar una propuesta propia definida en tokens para cambiarla en un solo lugar. Si hay skills de UI en el repo, seguirlas.

## Tareas

- [x] Tokens de diseño (colores, radios, tipografía) en las variables CSS de shadcn/ui / Tailwind. Tipografía con `next/font`.
- [x] Logo provisorio (texto "MiSeguro" o SVG simple) en un componente `Logo` para reemplazarlo fácil.
- [x] Layout público `src/app/(public)/layout.tsx`: header (logo y botón "Cotizá ahora" que hace scroll al formulario) y footer (contacto, dirección y matrícula del productor como placeholders [PROVISORIO], enlace a `/privacidad`, año actual).
- [x] Landing `src/app/(public)/page.tsx` como Server Component:
  - Hero con título «Tu cotización, sin vueltas.», subtítulo y un contenedor `#cotizar` donde irá el formulario (por ahora un placeholder con el mismo tamaño aproximado). En mobile, el formulario empieza en el primer scroll; en desktop, al lado del hero.
  - Sección "Cómo funciona" en 3 pasos (completás, te contactamos por WhatsApp, elegís tu cobertura).
  - Sección de beneficios (asesoramiento personalizado, varias aseguradoras, autos y motos).
  - Sección de confianza con datos del productor (placeholders) y espacio para reseñas futuras.
  - Preguntas frecuentes (4 a 6, contenido [PROVISORIO]) con el componente `accordion`.
- [x] Textos de la landing en un archivo de contenido (`src/content/landing.ts`) para que el cliente los cambie sin tocar componentes.
- [x] Imágenes con `next/image`; nada de JavaScript de cliente innecesario en la landing.

## Criterios de aceptación

- Se ve bien en 360 px, 768 px y 1280 px de ancho, sin scroll horizontal.
- Lighthouse en mobile (local, modo producción): Performance ≥ 90 y Accessibility ≥ 95.
- Cambiar el color primario en un solo lugar cambia todo el sitio.

## Fuera de alcance

- El formulario real (step 09). Páginas legales (step 08). Metadatos SEO (step 22).

## Notas de implementación

### Qué se hizo

Se construyó el layout público y la landing como Server Components, con identidad
provisoria navy/coral y Geist. Se generó una escena de auto y moto inspirada en el
prototipo y se optimizó en WebP con `next/image`. Se agregaron proceso, beneficios,
productor, espacio para reseñas y cinco FAQ con Accordion de shadcn.
El panel `#cotizar` queda reservado, sin campos, envío ni recepción de datos.
Se actualizó el título del hero a «Tu cotización, sin vueltas.» a pedido del usuario,
conservando el énfasis visual en «sin vueltas.» y los textos centralizados.

### Archivos clave

- `src/app/(public)/layout.tsx` y `page.tsx`: layout y landing; reemplazan la home de construcción.
- `src/app/globals.css` y `src/app/layout.tsx`: tokens, estilos responsivos y fuente.
- `src/content/landing.ts`: textos y datos provisionales editables.
- `src/components/logo.tsx` y `src/components/ui/accordion.tsx`: identidad e interacción.
- `public/images/landing-vehicles.webp`: imagen generada de la escena, sin interfaz ni marcas.

### Decisiones

Ver [0006 — Identidad provisoria de la landing](../decisiones/0006-identidad-provisoria-de-la-landing.md).
La referencia guía la composición; el formulario y las promesas de resultados
instantáneos no se trasladan. La imagen decorativa lleva alt vacío. Solo el
Accordion agrega una frontera cliente. El año del footer corresponde al build.

### Desvíos del spec

Ninguno en la implementación. El cierre administrativo en `SPEC.md` queda pendiente
hasta disponer de un PR real; no se inventó un número ni se marcó DONE anticipadamente.

### Cómo probarlo

1. Ejecutar `pnpm dev` y abrir `http://localhost:3000`.
2. Revisar a 360, 768 y 1280 px: sin scroll horizontal; a 360 px el panel comienza
   aproximadamente a 577 px del inicio, dentro del primer scroll.
3. Usar los CTA y comprobar que llegan a `#cotizar`. Confirmar que no hay campos ni envío.
4. Navegar con Tab y abrir/cerrar las FAQ con Enter; probar también el enlace para saltar al contenido.
5. Cambiar `--primary` en `src/app/globals.css`: botones, logo, título e iconos actualizan su acento.
6. Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`: todos pasaron (2 tests).
7. Para medir producción, ejecutar `pnpm build` y `pnpm start`. Lighthouse mobile local
   obtuvo Performance **96**, Accessibility **100**, CLS **0**, FCP **0,8 s** y LCP **2,7 s**.

Se revisó en Chromium con capturas completas a los tres anchos. Las comprobaciones
verificaron ausencia de overflow y errores JavaScript, cero campos de formulario,
Accordion con teclado, anclas y cambio de color primario. Una revisión independiente
de las capturas y el código dio SHIP sin correcciones obligatorias.
Herramientas e informes temporales: `/tmp/seguros-step07-review/` (incluye
`browser-results.json`, `screenshots/` y `lighthouse.html`/`.json`).

Revisión del cambio de título (2026-10-24): lint pasó con 94 advertencias en los
scripts de la skill Impeccable; typecheck y los 2 tests pasaron. `pnpm build`
quedó bloqueado por la restricción de apertura de puertos de Turbopack;
`pnpm build --webpack` pasó. La revisión en navegador de este build no cargó los
estilos completos, por lo que no se revalidaron los criterios visuales ni Lighthouse
para el nuevo título. Las métricas anteriores corresponden a la revisión original.

### Pendientes

- Crear el PR del step y completar únicamente su fila en `SPEC.md` con fecha, autor y número real.
- Step 00: confirmar identidad y contenido. Step 08: completar datos reales y `/privacidad`.
- Step 09: reemplazar el placeholder por el formulario funcional.
- Engram: la consulta funcionó, pero el hook bloqueó el guardado porque la sesión host
  de Codex no estaba registrada; reintentar cuando se restablezca esa vinculación.
