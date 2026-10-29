import { describe, expect, it, vi } from "vitest";
import { SEO_OG_IMAGE } from "@/content/seo";
import * as homePage from "./page";
import * as privacyPage from "./privacidad/page";
import * as adminLayout from "../admin/layout";
import robots from "../robots";
import sitemap from "../sitemap";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/components/public/quote-form-section", () => ({
  QuoteFormSection: () => <div />,
}));

/**
 * Estos tests no repiten la lógica de `src/lib/seo.ts`: verifican que cada ruta la
 * esté usando de verdad. Sin ellos, borrar el `export const metadata` de una página
 * deja el sitio sin metadatos y la suite sigue en verde.
 */
describe("public page metadata wiring", () => {
  it.each([
    ["home", homePage.metadata, "/"],
    ["privacy", privacyPage.metadata, "/privacidad"],
  ])("declares canonical and the Open Graph image on %s", (_name, metadata, canonical) => {
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.openGraph).toMatchObject({
      images: [{ url: SEO_OG_IMAGE.path, width: 1200, height: 630 }],
    });
    expect(metadata.twitter).toMatchObject({ images: [SEO_OG_IMAGE.path] });
    expect(metadata.description).toBeTruthy();
  });

  it("sets a title that differs per page", () => {
    expect(homePage.metadata.title).not.toEqual(privacyPage.metadata.title);
  });
});

describe("quote route metadata", () => {
  it.each([
    ["auto", "/cotizar/auto", "Seguro para auto"],
    ["moto", "/cotizar/moto", "Seguro para moto"],
  ])("resolves metadata for %s", async (tipo, canonical, title) => {
    const { generateMetadata } = await import("./cotizar/[tipo]/page");
    const metadata = await generateMetadata({ params: Promise.resolve({ tipo }) });

    expect(metadata.title).toBe(title);
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.openGraph).toMatchObject({ images: [{ url: SEO_OG_IMAGE.path }] });
  });
});

describe("panel metadata", () => {
  it("keeps /admin out of search engines in every environment", () => {
    expect(adminLayout.metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("metadata routes", () => {
  it("serves a sitemap with the four public URLs", () => {
    const entries = sitemap();

    expect(entries.map((entry) => new URL(entry.url).pathname)).toEqual([
      "/",
      "/cotizar/auto",
      "/cotizar/moto",
      "/privacidad",
    ]);
  });

  it("blocks every crawler outside production", async () => {
    const { rules } = await robots();

    expect(rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});
