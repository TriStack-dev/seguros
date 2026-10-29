// Copy de SEO [PROVISORIO]: se ajusta cuando el cliente confirme la propuesta comercial.
// La lógica (URLs absolutas, metadatos, sitemap, robots y JSON-LD) vive en src/lib/seo.ts.
// Este archivo es la fuente única de títulos, descripciones y rutas canónicas del sitio público.

export const SEO_SITE_NAME = "MiSeguro";

/** Plantilla del layout raíz: cada página aporta su título corto y acá se le agrega la marca. */
export const SEO_TITLE_TEMPLATE = `%s | ${SEO_SITE_NAME}`;

/** Título completo de la home; no pasa por la plantilla para no repetir la marca. */
export const SEO_DEFAULT_TITLE = "MiSeguro — Seguros de auto y moto con asesoramiento";

export const SEO_DEFAULT_DESCRIPTION =
  "Cotizá el seguro de tu auto o tu moto con asesoramiento personalizado. Un asesor te contacta por WhatsApp.";

export const SEO_OG_IMAGE_ALT = "MiSeguro — Seguros de auto y moto";

/**
 * Imagen Open Graph: la genera `src/app/opengraph-image.tsx` y se sirve en esta ruta.
 * Las páginas la declaran a mano porque un `openGraph` propio reemplaza el del layout;
 * el archivo de metadata solo cubre las rutas que no declaran Open Graph.
 */
export const SEO_OG_IMAGE = {
  path: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SEO_OG_IMAGE_ALT,
} as const;

export const SEO_BRAND_PHRASE = "Tu cotización, sin vueltas.";

export type PublicPageKey = "home" | "auto" | "moto" | "privacy";

type SeoPage = {
  /** Ruta canónica, siempre con barra inicial y sin barra final (salvo la home). */
  path: string;
  /** Título corto; la plantilla del layout raíz le agrega "| MiSeguro". Vacío en la home. */
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

export const SEO_PAGES: Record<PublicPageKey, SeoPage> = {
  home: {
    path: "/",
    title: "",
    description: SEO_DEFAULT_DESCRIPTION,
    ogTitle: SEO_BRAND_PHRASE,
    ogDescription:
      "Seguros para autos y motos con asesoramiento personalizado. Te contacta un asesor.",
    changeFrequency: "monthly",
    priority: 1,
  },
  auto: {
    path: "/cotizar/auto",
    title: "Seguro para auto",
    description:
      "Cotizá el seguro de tu auto con asesoramiento personalizado. Contanos qué auto tenés y un asesor te contacta por WhatsApp.",
    ogTitle: "Cotizá el seguro de tu auto",
    ogDescription: "Contanos qué auto tenés y un asesor te contacta por WhatsApp.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  moto: {
    path: "/cotizar/moto",
    title: "Seguro para moto",
    description:
      "Cotizá el seguro de tu moto con asesoramiento personalizado. Contanos qué moto tenés y un asesor te contacta por WhatsApp.",
    ogTitle: "Cotizá el seguro de tu moto",
    ogDescription: "Contanos qué moto tenés y un asesor te contacta por WhatsApp.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  privacy: {
    path: "/privacidad",
    title: "Política de privacidad",
    description:
      "Cómo tratamos los datos personales que nos compartís al cotizar tu seguro y cómo ejercer tus derechos como titular.",
    ogTitle: "Política de privacidad",
    ogDescription: "Cómo tratamos los datos personales que nos compartís al cotizar tu seguro.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
};

/** Migas de pan de las páginas internas; la home siempre es el primer nivel. */
export const BREADCRUMB_LABELS: Record<PublicPageKey, string> = {
  home: "Inicio",
  auto: "Cotizar auto",
  moto: "Cotizar moto",
  privacy: "Privacidad",
};
