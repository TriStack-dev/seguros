import { describe, it, expect } from "vitest";
import { slugify } from "../../src/lib/slugify";
import catalogJson from "./vehicles.json";

// Valida el catálogo versionado antes de que llegue a la base. No prueba el seed en sí:
// eso se verifica corriendo `pnpm db:seed` dos veces contra la base local.

type CatalogBrand = { name: string; models: string[] };
type Catalog = {
  version: string;
  sources: string[];
  AUTO: CatalogBrand[];
  MOTO: CatalogBrand[];
};

const catalog = catalogJson as Catalog;

const MIN_BRANDS = { AUTO: 40, MOTO: 30 } as const;

// Los más patentados de los últimos años, según ACARA (autos) y ACARA Motovehículos / SIOMAA
// (motos). Si se reemplaza el catálogo por uno pago, estos tienen que seguir estando.
const TOP_AUTO: { brand: string; model: string }[] = [
  { brand: "Fiat", model: "Cronos" },
  { brand: "Peugeot", model: "208" },
  { brand: "Toyota", model: "Hilux" },
  { brand: "Volkswagen", model: "Amarok" },
  { brand: "Chevrolet", model: "Onix" },
  { brand: "Ford", model: "Ranger" },
  { brand: "Toyota", model: "Yaris" },
  { brand: "Volkswagen", model: "Polo" },
  { brand: "Renault", model: "Sandero" },
  { brand: "Fiat", model: "Strada" },
];

const TOP_MOTO: { brand: string; model: string }[] = [
  { brand: "Honda", model: "Wave 110" },
  { brand: "Motomel", model: "Blitz 110" },
  { brand: "Corven", model: "Energy 110" },
  { brand: "Gilera", model: "Smash 110" },
  { brand: "Zanella", model: "RX 150" },
  { brand: "Motomel", model: "S2 150" },
  { brand: "Corven", model: "Triax 150" },
  { brand: "Honda", model: "CG 150 Titan" },
  { brand: "Yamaha", model: "YBR 125" },
  { brand: "Zanella", model: "Styler 150" },
];

function brandsOf(type: "AUTO" | "MOTO"): CatalogBrand[] {
  return catalog[type];
}

function findBrand(type: "AUTO" | "MOTO", name: string): CatalogBrand | undefined {
  return brandsOf(type).find((brand) => slugify(brand.name) === slugify(name));
}

describe("vehicles.json", () => {
  it("has the expected structure", () => {
    expect(catalog.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(catalog.version))).toBe(false);
    expect(Array.isArray(catalog.sources)).toBe(true);
    expect(catalog.sources.length).toBeGreaterThan(0);
    for (const source of catalog.sources) {
      expect(typeof source).toBe("string");
      expect(source.trim()).not.toBe("");
    }
    expect(Array.isArray(catalog.AUTO)).toBe(true);
    expect(Array.isArray(catalog.MOTO)).toBe(true);
  });

  it("loads at least 40 car brands and 30 motorcycle brands", () => {
    expect(brandsOf("AUTO").length).toBeGreaterThanOrEqual(MIN_BRANDS.AUTO);
    expect(brandsOf("MOTO").length).toBeGreaterThanOrEqual(MIN_BRANDS.MOTO);
  });

  it("has no empty brand, no empty model and no brand without models", () => {
    for (const type of ["AUTO", "MOTO"] as const) {
      for (const brand of brandsOf(type)) {
        expect(typeof brand.name).toBe("string");
        expect(brand.name).toBe(brand.name.trim());
        expect(brand.name).not.toBe("");
        expect(Array.isArray(brand.models)).toBe(true);
        expect(brand.models.length).toBeGreaterThan(0);
        for (const model of brand.models) {
          expect(typeof model).toBe("string");
          expect(model).toBe(model.trim());
          expect(model).not.toBe("");
        }
      }
    }
  });

  it("has no duplicate brands per vehicle type", () => {
    for (const type of ["AUTO", "MOTO"] as const) {
      const slugs = brandsOf(type).map((brand) => slugify(brand.name));
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("has no slug collisions between models of the same brand", () => {
    for (const type of ["AUTO", "MOTO"] as const) {
      for (const brand of brandsOf(type)) {
        const slugs = brand.models.map((model) => slugify(model));
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    }
  });

  it("keeps brands and models sorted alphabetically by slug", () => {
    for (const type of ["AUTO", "MOTO"] as const) {
      const brandSlugs = brandsOf(type).map((brand) => slugify(brand.name));
      expect(brandSlugs).toEqual([...brandSlugs].sort());

      for (const brand of brandsOf(type)) {
        const modelSlugs = brand.models.map((model) => slugify(model));
        expect(modelSlugs).toEqual([...modelSlugs].sort());
      }
    }
  });

  it("includes the ten most patented cars", () => {
    for (const { brand, model } of TOP_AUTO) {
      const found = findBrand("AUTO", brand);
      expect(found, `falta la marca ${brand}`).toBeDefined();
      expect(found?.models, `falta ${brand} ${model}`).toContain(model);
    }
  });

  it("includes the ten most patented motorcycles", () => {
    for (const { brand, model } of TOP_MOTO) {
      const found = findBrand("MOTO", brand);
      expect(found, `falta la marca ${brand}`).toBeDefined();
      expect(found?.models, `falta ${brand} ${model}`).toContain(model);
    }
  });
});
