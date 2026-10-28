# Step 22 — SEO técnico

**Etapa:** 5. Lanzamiento · **Depende de:** 07, 08 · **Leer:** Google Doc "Documentación — MiSeguro (v2)" sección 8 (SEO técnico)

## Objetivo

Dejar las páginas públicas listas para que Google las indexe bien desde el lanzamiento, y el panel fuera de los buscadores.

## Tareas

- [x] Metadata API de Next.js: `metadataBase` desde `NEXT_PUBLIC_SITE_URL`, plantilla de título (`%s | MiSeguro`), descripción, canonical y Open Graph/Twitter por página (landing, `/cotizar/auto`, `/cotizar/moto`, `/privacidad`). Textos en `src/content/seo.ts` [PROVISORIO].
- [x] Imagen Open Graph con `opengraph-image.tsx` (logo + frase) y favicon/íconos con los archivos convencionales de Next.js.
- [x] `src/app/sitemap.ts` con las páginas públicas indexables.
- [x] `src/app/robots.ts`: permite todo salvo `/admin` y `/api`; enlaza el sitemap. En cualquier entorno que no sea producción (la lógica es por variable de entorno), `Disallow: /` y `noindex` en los metadatos.
- [x] Datos estructurados JSON-LD: `InsuranceAgency` (u `Organization`) con los datos de `business.ts` (step 08) en el layout público, y `BreadcrumbList` en las páginas internas. Validar con la herramienta de resultados enriquecidos de Google.
- [x] Verificar que todas las páginas públicas se rendericen en el servidor (el HTML inicial contiene los textos).
- [x] `<html lang="es-AR">`.
- [x] Revisar Core Web Vitals con Lighthouse y corregir lo que esté fuera de rango "bueno" en landing y formulario (LCP, CLS, INP).

## Criterios de aceptación

- `view-source` de la landing muestra título, descripción, canonical, Open Graph y JSON-LD.
- `/sitemap.xml` y `/robots.txt` responden correctamente; cualquier entorno que no sea producción devuelve `Disallow: /` (la verificación sobre un preview real de Vercel queda para cuando exista la infra, step 26).
- La herramienta de resultados enriquecidos no muestra errores en el JSON-LD.
- Lighthouse SEO = 100 en la landing.

## Fuera de alcance

- Redirecciones 301 y alta en Search Console (step 25). Landings de contenido por vehículo o zona (post-MVP).

## Notas de implementación

**Qué se hizo:** el copy y las rutas canónicas viven en `src/content/seo.ts` [PROVISORIO] y la lógica en `src/lib/seo.ts` (funciones puras y testeables). El layout raíz define `metadataBase`, plantilla de título `%s | MiSeguro` y defaults; cada página pública declara su metadata con `buildPageMetadata`. Se agregaron `opengraph-image.tsx`, `icon.svg`, `sitemap.ts` y `robots.ts`. El layout público emite JSON-LD `InsuranceAgency` con los datos de `business.ts` y las páginas internas agregan `BreadcrumbList`. Fuera de producción todo queda `noindex` y `Disallow: /`, y `/admin` fija `noindex` siempre en su propio layout.

**Archivos clave:**
- `src/content/seo.ts` — títulos, descripciones, OG, rutas canónicas y frecuencias del sitemap.
- `src/lib/seo.ts` — `getSiteUrl`, `isProduction`, `buildSiteMetadata`, `buildPageMetadata`, `buildSitemap`, `buildRobots`, `buildOrganizationJsonLd`, `buildBreadcrumbJsonLd`.
- `src/components/public/json-ld.tsx` — render del JSON-LD con escape de `<`.
- `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/cotizar/[tipo]/page.tsx`, `src/app/(public)/privacidad/page.tsx`.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.svg`.
- `src/lib/seo.test.ts`, `src/components/public/json-ld.test.tsx`.

**Decisiones:** "producción" es `VERCEL_ENV === "production"` (no `NODE_ENV`, porque un build local también corre en production) y `NEXT_PUBLIC_SITE_URL` es obligatoria ahí: si falta, el build falla en vez de publicar canonical y sitemap apuntando a localhost. Detalle y alternativas en `docs/decisiones/0014-seo-indexacion-y-url-publica.md`.

**Desvíos del spec:** la imagen Open Graph se declara explícitamente en el `openGraph` de cada página, además del archivo `opengraph-image.tsx`. Cuando una página define su propio `openGraph`, Next no le inyecta la imagen del archivo de metadata, así que sin eso la landing y `/privacidad` salían sin `og:image`; el archivo sigue generando el PNG y cubre las rutas que no declaran Open Graph (por ejemplo `/admin`).

**Cómo probarlo:**
1. `pnpm build && pnpm start` y abrir `view-source:` de `/`: título, descripción, canonical, `og:*`, `twitter:*`, dos bloques JSON-LD y el texto de las respuestas del FAQ en el HTML inicial.
2. `/robots.txt` responde `Disallow: /` fuera de producción; `/sitemap.xml` lista las cuatro páginas públicas; `/opengraph-image` devuelve un PNG de 1200x630.
3. `/cotizar/auto` y `/cotizar/moto` llevan su título corto con la marca, canonical propio y `BreadcrumbList`; `/cotizar/barco` da 404.
4. Con `VERCEL_ENV=production` y `NEXT_PUBLIC_SITE_URL=https://miseguro.com.ar`, `pnpm build` deja `Allow: /`, `Disallow: /admin` y `Disallow: /api`, sitemap y `Host` absolutos, y `index, follow` en el HTML.
5. Tests: `pnpm test src/lib/seo.test.ts src/app/(public)/seo-metadata.test.tsx src/components/public/json-ld.test.tsx`. Los de `seo-metadata` verifican el cableado (cada página declara canonical y `og:image`, `/admin` queda `noindex`, sitemap y robots responden), no solo las funciones puras.

**Lighthouse (mobile, build de producción servido en local, Lighthouse 13.5):** SEO 100, accesibilidad 100, buenas prácticas 100, performance 92, CLS 0, TBT 40 ms, LCP 3,4 s. El LCP es la imagen del hero, que ya va con `preload` y `quality={80}`; el valor queda apenas arriba de 2,5 s en laboratorio y se vuelve a medir con CDN y datos de campo al desplegar (step 26).

**Pendientes:**
- Validar el JSON-LD con la herramienta de resultados enriquecidos de Google cuando exista el dominio (step 25). Hoy solo está validado por estructura en los tests, y los datos [PROVISORIO] de `business.ts` van a marcarse como incompletos hasta que el cliente los confirme.
- Cargar `NEXT_PUBLIC_SITE_URL` en Vercel para producción; sin ella el deploy falla a propósito (step 26).
- Los textos de `src/content/seo.ts` son [PROVISORIO].
