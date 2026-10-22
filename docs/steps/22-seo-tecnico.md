# Step 22 — SEO técnico

**Etapa:** 5. Lanzamiento · **Depende de:** 07, 08 · **Leer:** Google Doc "Documentación — MiSeguro (v2)" sección 8 (SEO técnico)

## Objetivo

Dejar las páginas públicas listas para que Google las indexe bien desde el lanzamiento, y el panel fuera de los buscadores.

## Tareas

- [ ] Metadata API de Next.js: `metadataBase` desde `NEXT_PUBLIC_SITE_URL`, plantilla de título (`%s | MiSeguro`), descripción, canonical y Open Graph/Twitter por página (landing, `/cotizar/auto`, `/cotizar/moto`, `/privacidad`). Textos en `src/content/seo.ts` [PROVISORIO].
- [ ] Imagen Open Graph con `opengraph-image.tsx` (logo + frase) y favicon/íconos con los archivos convencionales de Next.js.
- [ ] `src/app/sitemap.ts` con las páginas públicas indexables.
- [ ] `src/app/robots.ts`: permite todo salvo `/admin` y `/api`; enlaza el sitemap. En cualquier entorno que no sea producción (la lógica es por variable de entorno), `Disallow: /` y `noindex` en los metadatos.
- [ ] Datos estructurados JSON-LD: `InsuranceAgency` (u `Organization`) con los datos de `business.ts` (step 08) en el layout público, y `BreadcrumbList` en las páginas internas. Validar con la herramienta de resultados enriquecidos de Google.
- [ ] Verificar que todas las páginas públicas se rendericen en el servidor (el HTML inicial contiene los textos).
- [ ] `<html lang="es-AR">`.
- [ ] Revisar Core Web Vitals con Lighthouse y corregir lo que esté fuera de rango "bueno" en landing y formulario (LCP, CLS, INP).

## Criterios de aceptación

- `view-source` de la landing muestra título, descripción, canonical, Open Graph y JSON-LD.
- `/sitemap.xml` y `/robots.txt` responden correctamente; cualquier entorno que no sea producción devuelve `Disallow: /` (la verificación sobre un preview real de Vercel queda para cuando exista la infra, step 26).
- La herramienta de resultados enriquecidos no muestra errores en el JSON-LD.
- Lighthouse SEO = 100 en la landing.

## Fuera de alcance

- Redirecciones 301 y alta en Search Console (step 25). Landings de contenido por vehículo o zona (post-MVP).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
