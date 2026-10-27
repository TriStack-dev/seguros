import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import { slugify } from "../../src/lib/slugify";
import catalogJson from "./vehicles.json";

// Seed del catálogo [PROVISORIO] de marcas y modelos. Es idempotente: hace upsert por
// (vehicleType, slug) y por (brandId, slug), así que correrlo dos veces no duplica filas.
// No borra lo que ya no está en el JSON porque puede tener leads asociados: solo lo avisa.

type CatalogBrand = { name: string; models: string[] };
type Catalog = {
  version: string;
  sources: string[];
  AUTO: CatalogBrand[];
  MOTO: CatalogBrand[];
};

const VEHICLE_TYPES = ["AUTO", "MOTO"] as const;
type VehicleTypeKey = (typeof VEHICLE_TYPES)[number];

const catalog = catalogJson as Catalog;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copiá .env.example a .env.local (ver README) o exportá la variable.",
    );
  }
  return url;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  });

  try {
    for (const vehicleType of VEHICLE_TYPES) {
      for (const brand of catalog[vehicleType]) {
        const brandSlug = slugify(brand.name);
        const savedBrand = await prisma.vehicleBrand.upsert({
          where: { vehicleType_slug: { vehicleType, slug: brandSlug } },
          update: { name: brand.name },
          create: { name: brand.name, slug: brandSlug, vehicleType },
        });

        for (const modelName of brand.models) {
          const modelSlug = slugify(modelName);
          await prisma.vehicleModel.upsert({
            where: { brandId_slug: { brandId: savedBrand.id, slug: modelSlug } },
            update: { name: modelName },
            create: { brandId: savedBrand.id, name: modelName, slug: modelSlug },
          });
        }
      }
    }

    const brands = await prisma.vehicleBrand.findMany({ include: { models: true } });

    const missingBrands: string[] = [];
    const missingModels: string[] = [];

    for (const brand of brands) {
      const catalogBrand = catalog[brand.vehicleType as VehicleTypeKey].find(
        (candidate) => slugify(candidate.name) === brand.slug,
      );

      if (!catalogBrand) {
        missingBrands.push(`${brand.vehicleType} ${brand.name}`);
        continue;
      }

      const catalogModelSlugs = new Set(catalogBrand.models.map((model) => slugify(model)));
      for (const model of brand.models) {
        if (!catalogModelSlugs.has(model.slug)) {
          missingModels.push(`${brand.vehicleType} ${brand.name} / ${model.name}`);
        }
      }
    }

    const totals = VEHICLE_TYPES.map((vehicleType) => {
      const brandsOfType = catalog[vehicleType];
      const modelsOfType = brandsOfType.reduce((total, brand) => total + brand.models.length, 0);
      return `${vehicleType}: ${brandsOfType.length} marcas, ${modelsOfType} modelos`;
    });

    console.log(`Catálogo ${catalog.version} cargado.`);
    for (const total of totals) console.log(`  ${total}`);

    if (missingBrands.length > 0) {
      console.warn(
        `\nAviso: ${missingBrands.length} marca(s) en la base que ya no están en el JSON. No se borran:`,
      );
      for (const brand of missingBrands) console.warn(`  - ${brand}`);
    }

    if (missingModels.length > 0) {
      console.warn(
        `\nAviso: ${missingModels.length} modelo(s) en la base que ya no están en el JSON. No se borran:`,
      );
      for (const model of missingModels) console.warn(`  - ${model}`);
    }

    if (missingBrands.length === 0 && missingModels.length === 0) {
      console.log("La base coincide con el JSON: no hay registros de más.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
