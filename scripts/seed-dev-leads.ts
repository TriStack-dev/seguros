import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "";
const databaseUrl = process.env.DATABASE_URL ?? "";

function isProductionDatabase(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("supabase.co") && !lower.includes("localhost") && !lower.includes("127.0.0.1")) {
    return true;
  }
  if (appEnv === "production" || appEnv === "prod") return true;
  if (lower.includes("pooler.supabase.com") && !lower.includes("db.") && !lower.includes("localhost")) {
    // Be defensive: in most real projects poolers to prod aren't used locally, but we still check host patterns
  }
  // Fallback: if APP_ENV explicitly not dev, be cautious
  if (appEnv && appEnv !== "development" && appEnv !== "dev") return true;
  return false;
}

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "ISSUED", "LOST"] as const;
const LOST_REASONS = ["PRICE", "NO_RESPONSE", "WENT_ELSEWHERE", "JUST_ASKING", "INVALID_DATA", "OTHER"] as const;

const FIRST_NAMES = ["Juan", "María", "Carlos", "Lucía", "Pedro", "Ana", "Diego", "Laura", "Santiago", "Camila"];
const LAST_NAMES = ["Pérez", "González", "Rodríguez", "López", "Martínez", "García", "Fernández", "Sánchez", "Romero", "Torres"];
const BRANDS = [
  { name: "Toyota", model: "Corolla" },
  { name: "Volkswagen", model: "Gol" },
  { name: "Ford", model: "Ka" },
  { name: "Chevrolet", model: "Onix" },
  { name: "Honda", model: "Wave" },
  { name: "Yamaha", model: "YBR" },
];

function randomItem<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) return arr[0] as T;
  return item;
}

function pad(n: number) {
  return String(n).padStart(8, "0");
}

function randomPlate(vehicleType: "AUTO" | "MOTO") {
  if (vehicleType === "AUTO") {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const l1 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    const l2 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    const l3 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    const n = String(Math.floor(100 + Math.random() * 900));
    return l1 + l2 + l3 + n;
  } else {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const n = String(Math.floor(100 + Math.random() * 900));
    const l1 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    const l2 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    const l3 = letters[Math.floor(Math.random() * letters.length)] ?? "A";
    return n + l1 + l2 + l3;
  }
}

function randomDateLast90Days() {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
  // randomize time of day a bit
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function main() {
  if (isProductionDatabase(databaseUrl)) {
    console.error("Refusing to run db:seed:leads against a production database.");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Seeding ~200 dev leads...");
    for (let i = 0; i < 200; i++) {
      const vehicleType = Math.random() < 0.7 ? ("AUTO" as const) : ("MOTO" as const);
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;
      const dni = pad(Math.floor(Math.random() * 10_000_0000));
      const phone = `549341${String(Math.floor(1000000 + Math.random() * 8999999))}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const isZeroKm = Math.random() < 0.1;
      const plate = isZeroKm ? null : randomPlate(vehicleType);
      const brand = randomItem(BRANDS);
      const year = 2015 + Math.floor(Math.random() * 11);
      const hasGnc = vehicleType === "AUTO" ? (Math.random() < 0.3) : null;
      const postalCode = String(2000 + Math.floor(Math.random() * 100));
      const usageOptions = vehicleType === "AUTO" ? ["PARTICULAR", "COMMERCIAL", "RIDE_HAILING"] : ["PARTICULAR", "COMMERCIAL", "DELIVERY"];
      const usage = randomItem(usageOptions) as "PARTICULAR" | "COMMERCIAL" | "RIDE_HAILING" | "DELIVERY";
      const status = randomItem(STATUSES);
      const createdAt = randomDateLast90Days();
      const lostReason = status === "LOST" ? randomItem(LOST_REASONS) : null;
      const firstContactedAt = ["CONTACTED", "QUOTED", "ISSUED"].includes(status)
        ? new Date(createdAt.getTime() + Math.floor(Math.random() * 4 * 60 * 60 * 1000))
        : null;
      const whatsappClickedAt = Math.random() < 0.4 ? new Date(createdAt.getTime() + Math.floor(Math.random() * 2 * 60 * 60 * 1000)) : null;

      await prisma.lead.create({
        data: {
          vehicleType,
          fullName,
          phone,
          email,
          dni,
          isZeroKm,
          plate,
          brandName: brand.name,
          modelName: brand.model,
          year,
          hasGnc,
          postalCode,
          usage,
          consentAt: createdAt,
          status,
          lostReason,
          firstContactedAt,
          whatsappClickedAt,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
