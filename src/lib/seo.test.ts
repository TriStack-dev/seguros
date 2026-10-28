import { describe, expect, it } from "vitest";
import {
  SITE_URL_FALLBACK,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildRobots,
  buildSiteMetadata,
  buildSitemap,
  getSiteUrl,
  isProduction,
} from "./seo";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_OG_IMAGE,
  SEO_OG_IMAGE_ALT,
  SEO_PAGES,
  SEO_TITLE_TEMPLATE,
} from "@/content/seo";
import { business } from "@/content/business";

const production = { NEXT_PUBLIC_SITE_URL: "https://miseguro.com.ar", VERCEL_ENV: "production" };
const preview = {
  NEXT_PUBLIC_SITE_URL: "https://seguros-git-pr-1.vercel.app",
  VERCEL_ENV: "preview",
};
const local = { NEXT_PUBLIC_SITE_URL: "", VERCEL_ENV: undefined };

describe("isProduction", () => {
  it("only treats the Vercel production environment as production", () => {
    expect(isProduction(production)).toBe(true);
    expect(isProduction(preview)).toBe(false);
    expect(isProduction({ VERCEL_ENV: "development" })).toBe(false);
    expect(isProduction(local)).toBe(false);
  });
});

describe("getSiteUrl", () => {
  it("falls back to localhost outside production", () => {
    expect(getSiteUrl(local)).toBe(SITE_URL_FALLBACK);
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " })).toBe(SITE_URL_FALLBACK);
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "miseguro.com.ar" })).toBe(SITE_URL_FALLBACK);
  });

  it("removes trailing slashes", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://miseguro.com.ar/" })).toBe(
      "https://miseguro.com.ar",
    );
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: " https://miseguro.com.ar/// " })).toBe(
      "https://miseguro.com.ar",
    );
  });

  it("fails the build in production when the URL is missing or invalid", () => {
    expect(() => getSiteUrl({ VERCEL_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() => getSiteUrl({ ...production, NEXT_PUBLIC_SITE_URL: "miseguro.com.ar" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
    expect(() =>
      getSiteUrl({ ...production, NEXT_PUBLIC_SITE_URL: "ftp://miseguro.com.ar" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});

describe("buildSiteMetadata", () => {
  it("sets metadataBase, the title template and the site description", () => {
    const metadata = buildSiteMetadata(production);

    expect(metadata.metadataBase?.toString()).toBe("https://miseguro.com.ar/");
    expect(metadata.title).toEqual({ template: SEO_TITLE_TEMPLATE, default: SEO_DEFAULT_TITLE });
    expect(metadata.description).toBe(SEO_DEFAULT_DESCRIPTION);
    expect(metadata.openGraph?.locale).toBe("es_AR");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(SEO_TITLE_TEMPLATE).toBe("%s | MiSeguro");
  });

  it("keeps the site out of search engines outside production", () => {
    expect(buildSiteMetadata(local).robots).toEqual({ index: false, follow: false });
    expect(buildSiteMetadata(preview).robots).toEqual({ index: false, follow: false });
    expect(buildSiteMetadata(production).robots).toEqual({ index: true, follow: true });
  });
});

describe("buildPageMetadata", () => {
  it("uses the default title for the home page", () => {
    expect(buildPageMetadata("home").title).toEqual({ absolute: SEO_DEFAULT_TITLE });
  });

  it("sets a short title for the internal pages so the layout template applies", () => {
    const title = buildPageMetadata("auto").title;

    expect(title).toBe("Seguro para auto");
    expect(`${title} | MiSeguro`).toBe("Seguro para auto | MiSeguro");
  });

  it("sets canonical, Open Graph and Twitter tags for every public page", () => {
    for (const [key, page] of Object.entries(SEO_PAGES)) {
      const metadata = buildPageMetadata(key as keyof typeof SEO_PAGES);

      expect(metadata.alternates?.canonical).toBe(page.path);
      expect(metadata.openGraph?.title).toBe(page.ogTitle);
      expect(metadata.openGraph?.description).toBe(page.ogDescription);
      expect(metadata.openGraph?.url).toBe(page.path);
      expect(metadata.twitter?.title).toBe(page.ogTitle);
      expect(metadata.twitter?.description).toBe(page.ogDescription);
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
      expect(metadata.description).toBe(page.description);
    }
  });

  it("declares the Open Graph image on every public page", () => {
    for (const key of Object.keys(SEO_PAGES) as Array<keyof typeof SEO_PAGES>) {
      const metadata = buildPageMetadata(key);

      expect(metadata.openGraph).toMatchObject({
        images: [
          {
            url: SEO_OG_IMAGE.path,
            width: 1200,
            height: 630,
            alt: SEO_OG_IMAGE_ALT,
          },
        ],
      });
      expect(metadata.twitter).toMatchObject({ images: [SEO_OG_IMAGE.path] });
    }
  });
});

describe("buildSitemap", () => {
  it("lists the public pages with absolute URLs", () => {
    const lastModified = new Date("2026-10-28T12:00:00.000Z");
    const sitemap = buildSitemap(production, lastModified);

    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://miseguro.com.ar/",
      "https://miseguro.com.ar/cotizar/auto",
      "https://miseguro.com.ar/cotizar/moto",
      "https://miseguro.com.ar/privacidad",
    ]);
    for (const entry of sitemap) {
      expect(entry.lastModified).toBe(lastModified);
      expect(entry.url.replace("https://", "")).not.toContain("//");
    }
  });
});

describe("buildRobots", () => {
  it("allows the public site and blocks the panel and the API in production", () => {
    expect(buildRobots(production)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      sitemap: "https://miseguro.com.ar/sitemap.xml",
      host: "https://miseguro.com.ar",
    });
  });

  it("blocks every crawler outside production", () => {
    expect(buildRobots(local)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(buildRobots(preview)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});

describe("JSON-LD", () => {
  it("describes the insurance agency with the producer data", () => {
    const jsonLd = buildOrganizationJsonLd(production);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("InsuranceAgency");
    expect(jsonLd["@id"]).toBe("https://miseguro.com.ar/#organization");
    expect(jsonLd.name).toBe("MiSeguro");
    expect(jsonLd.legalName).toBe(business.legalName);
    expect(jsonLd.telephone).toBe(business.phone);
    expect(jsonLd.url).toBe("https://miseguro.com.ar/");
    expect(jsonLd.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressCountry: "AR",
    });
  });

  it("builds a two-level breadcrumb for internal pages", () => {
    expect(buildBreadcrumbJsonLd("moto", production)).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://miseguro.com.ar/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cotizar moto",
          item: "https://miseguro.com.ar/cotizar/moto",
        },
      ],
    });
  });
});

describe("SEO content", () => {
  it("covers the four public pages with unique paths and search-friendly lengths", () => {
    const pages = Object.values(SEO_PAGES);

    expect(pages).toHaveLength(4);
    expect(new Set(pages.map((page) => page.path)).size).toBe(4);
    for (const page of pages) {
      expect(page.path.startsWith("/")).toBe(true);
      expect(page.path.endsWith("/")).toBe(page.path === "/");
      expect(page.title.length).toBeLessThanOrEqual(60);
      expect(page.description.length).toBeLessThanOrEqual(160);
      expect(page.ogTitle.length).toBeGreaterThan(0);
      expect(page.ogDescription.length).toBeGreaterThan(0);
    }
  });
});
