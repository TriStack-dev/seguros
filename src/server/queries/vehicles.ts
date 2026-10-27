import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";

export const getVehicleBrands = unstable_cache(
  async () =>
    db.vehicleBrand.findMany({
      select: { id: true, name: true, vehicleType: true },
      orderBy: { name: "asc" },
    }),
  ["vehicle-brands"],
  { revalidate: 3600 },
);

export const getVehicleModels = unstable_cache(
  async (brandId: string) =>
    db.vehicleModel.findMany({
      where: { brandId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ["vehicle-models"],
  { revalidate: 3600 },
);
