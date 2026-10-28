import type { Metadata, MetadataRoute } from "next";
import { business } from "@/content/business";
import {
  BREADCRUMB_LABELS,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_OG_IMAGE,
  SEO_PAGES,
  SEO_SITE_NAME,
  SEO_TITLE_TEMPLATE,
  type PublicPageKey,
} from "@/content/seo";

/**
 * Fallback de desarrollo: en local la URL pública es el servidor de `pnpm dev`.
 * En producción se exige `NEXT_PUBLIC_SITE_URL` (ver `getSiteUrl`).
 */
export const SITE_URL_FALLBACK = "http://localhost:3000";

/** Variables de entorno que decide el SEO. Se inyectan en los tests. */
export type SeoEnv = Record<string, string | undefined>;

/**
 * Único criterio de "producción" para SEO. `VERCEL_ENV` la setea Vercel sola:
 * `production` en el dominio real, `preview` en los deploys de PR y `development` en local.
 * No se usa `NODE_ENV` a propósito: un `pnpm build` local no debe quedar indexable.
 */
export function isProduction(env: SeoEnv = process.env): boolean {
  return env.VERCEL_ENV === "production";
}

/**
 * URL pública del sitio, sin barra final. Fuera de producción cae al fallback local
 * para que el build y los tests no dependan de la variable; en producción falla el
 * build, porque un canonical o un sitemap apuntando a localhost es peor que no deployar.
 */
export function getSiteUrl(env: SeoEnv = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const normalized = raw.replace(/\/+$/, "");

  if (normalized === "") {
    return missingSiteUrl(env, "NEXT_PUBLIC_SITE_URL está vacía");
  }

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return missingSiteUrl(env, "NEXT_PUBLIC_SITE_URL no es una URL http(s)");
    }
    return normalized;
  } catch {
    return missingSiteUrl(env, "NEXT_PUBLIC_SITE_URL no es una URL válida");
  }
}

function missingSiteUrl(env: SeoEnv, reason: string): string {
  if (isProduction(env)) {
    throw new Error(
      `[seo] ${reason}. Definí NEXT_PUBLIC_SITE_URL con la URL pública de producción ` +
        "(por ejemplo https://miseguro.com.ar, sin barra final).",
    );
  }
  return SITE_URL_FALLBACK;
}

/** Imagen Open Graph compartida; la ruta se resuelve contra `metadataBase`. */
const OG_IMAGE = {
  url: SEO_OG_IMAGE.path,
  width: SEO_OG_IMAGE.width,
  height: SEO_OG_IMAGE.height,
  alt: SEO_OG_IMAGE.alt,
};

/** Metadatos del layout raíz: base de URLs, plantilla de título y defaults del sitio. */
export function buildSiteMetadata(env: SeoEnv = process.env): Metadata {
  return {
    metadataBase: new URL(getSiteUrl(env)),
    applicationName: SEO_SITE_NAME,
    title: { template: SEO_TITLE_TEMPLATE, default: SEO_DEFAULT_TITLE },
    description: SEO_DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: SEO_SITE_NAME,
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      images: [OG_IMAGE.url],
    },
    robots: buildRobotsMetadata(env),
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/**
 * `noindex` en todo lo que no sea producción. El layout de `/admin` además lo fija
 * siempre (ver `src/app/admin/layout.tsx`), porque el panel no se indexa nunca.
 */
export function buildRobotsMetadata(env: SeoEnv = process.env): Metadata["robots"] {
  return isProduction(env) ? { index: true, follow: true } : { index: false, follow: false };
}

/** Metadatos de una página pública: título, descripción, canonical, Open Graph y Twitter. */
export function buildPageMetadata(key: PublicPageKey): Metadata {
  const page = SEO_PAGES[key];

  return {
    title: key === "home" ? { absolute: SEO_DEFAULT_TITLE } : page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: SEO_SITE_NAME,
      title: page.ogTitle,
      description: page.ogDescription,
      url: page.path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: page.ogTitle,
      description: page.ogDescription,
      images: [OG_IMAGE.url],
    },
  };
}

/** Solo las páginas públicas indexables; `/admin` y `/api` quedan afuera por `robots.txt`. */
export function buildSitemap(
  env: SeoEnv = process.env,
  lastModified: Date = new Date(),
): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl(env);

  return Object.values(SEO_PAGES).map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

/** En producción permite el sitio público y bloquea panel y API; fuera de producción bloquea todo. */
export function buildRobots(env: SeoEnv = process.env): MetadataRoute.Robots {
  const siteUrl = getSiteUrl(env);

  if (!isProduction(env)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

/** JSON-LD del layout público con los datos del productor (step 08). */
export function buildOrganizationJsonLd(env: SeoEnv = process.env): Record<string, unknown> {
  const siteUrl = getSiteUrl(env);

  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "@id": `${siteUrl}/#organization`,
    name: SEO_SITE_NAME,
    legalName: business.legalName,
    description: SEO_DEFAULT_DESCRIPTION,
    url: `${siteUrl}/`,
    telephone: business.phone,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressCountry: "AR",
    },
    areaServed: { "@type": "Country", name: "Argentina" },
    availableLanguage: "es-AR",
  };
}

/** JSON-LD de migas de pan: home → página actual. */
export function buildBreadcrumbJsonLd(
  key: Exclude<PublicPageKey, "home">,
  env: SeoEnv = process.env,
): Record<string, unknown> {
  const siteUrl = getSiteUrl(env);
  const page = SEO_PAGES[key];
  const items = [
    { name: BREADCRUMB_LABELS.home, path: SEO_PAGES.home.path },
    { name: BREADCRUMB_LABELS[key], path: page.path },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
