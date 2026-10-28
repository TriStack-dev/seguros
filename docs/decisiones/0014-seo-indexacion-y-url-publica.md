# 0014 — Indexación, URL pública y textos de SEO

- **Fecha:** 2026-10-28
- **Step:** 22
- **Estado:** Aceptada

## Contexto

El step 22 pide indexar solo el sitio público, dejar `/admin` fuera de los buscadores y
que los previews de Vercel no compitan con producción. El repo no tenía una noción de
"producción" para SEO, y `NEXT_PUBLIC_SITE_URL` estaba vacía en local. Además, los
metadatos se estaban declarando sueltos en el layout raíz.

## Decisión

**Producción es `VERCEL_ENV === "production"`.** Es la única variable que distingue el
dominio real de un preview o de local, y la setea Vercel sola. No se usa `NODE_ENV`
porque `pnpm build` local también corre en `production` y quedaría indexable. Fuera de
producción el layout raíz emite `robots: { index: false, follow: false }` y
`robots.txt` responde `Disallow: /` para todos los user-agents.

**`NEXT_PUBLIC_SITE_URL` es obligatoria en producción.** Fuera de producción cae a
`http://localhost:3000`; con `VERCEL_ENV=production` y la variable vacía o inválida el
build falla (`getSiteUrl` en `src/lib/seo.ts`). Un canonical o un sitemap apuntando a
localhost es peor que un deploy que no sale.

**El copy vive en `src/content/seo.ts` y la lógica en `src/lib/seo.ts`.** El primero
concentra títulos, descripciones, Open Graph, rutas canónicas y frecuencias del sitemap,
marcados [PROVISORIO]. El segundo expone funciones puras y testeables:
`getSiteUrl`, `isProduction`, `buildSiteMetadata`, `buildPageMetadata`, `buildSitemap`,
`buildRobots`, `buildOrganizationJsonLd` y `buildBreadcrumbJsonLd`.

**`metadataBase` en el layout raíz y canonical relativo por página.** Next compone las
URLs absolutas de canonical, Open Graph y Twitter a partir de `metadataBase`, así que
las páginas declaran rutas (`/cotizar/auto`) y no URLs completas. Sitemap, `robots.txt`
y JSON-LD sí usan URLs absolutas, porque los consumen crawlers que no resuelven relativas.

**La home usa título absoluto; las páginas internas usan la plantilla.** La home toma
`SEO_DEFAULT_TITLE` para no repetir la marca, y `/cotizar/auto`, `/cotizar/moto` y
`/privacidad` declaran un título corto al que el layout raíz le agrega `| MiSeguro`.

**`/admin` fija `noindex` en su propio layout**, sin depender del entorno: el panel no se
indexa ni en producción.

## Alternativas descartadas

- Usar `NODE_ENV`: un build local quedaría indexable y un preview también.
- Usar `NEXT_PUBLIC_SITE_URL` como señal de producción: la variable se puede cargar en
  un preview para probar enlaces absolutos sin que eso habilite la indexación.
- Fallback silencioso a localhost en producción: publica canonical y sitemap inválidos.
- Declarar los metadatos en cada página sin helper: duplica Open Graph y Twitter y se
  desincroniza con el canonical.

## Consecuencias

Todo preview y todo local quedan `noindex` sin configuración extra. Al crear el proyecto
de Vercel (step 26) hay que cargar `NEXT_PUBLIC_SITE_URL` con el dominio final en
producción; si falta, el deploy falla con un mensaje explícito. Cambiar el dominio es
cambiar esa variable. Los textos [PROVISORIO] de `src/content/seo.ts` se reemplazan
cuando el cliente confirme la propuesta comercial, y los datos del productor del JSON-LD
salen de `src/lib/business.ts` (decisión 0007).
