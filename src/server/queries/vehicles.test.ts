import { beforeEach, describe, expect, it, vi } from "vitest";

const { findBrands, findModels, cache } = vi.hoisted(() => ({
  findBrands: vi.fn(),
  findModels: vi.fn(),
  cache: vi.fn((fn: (...args: string[]) => Promise<unknown>) => fn),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: cache }));
vi.mock("@/lib/db", () => ({
  db: {
    vehicleBrand: { findMany: findBrands },
    vehicleModel: { findMany: findModels },
  },
}));

import { getVehicleBrands, getVehicleModels } from "./vehicles";

describe("vehicle catalog queries", () => {
  beforeEach(() => {
    findBrands.mockReset();
    findModels.mockReset();
  });

  it("loads only public brand fields in alphabetical order", async () => {
    const brands = [{ id: "brand-id", name: "Honda", vehicleType: "MOTO" }];
    findBrands.mockResolvedValue(brands);

    expect(await getVehicleBrands()).toEqual(brands);
    expect(findBrands).toHaveBeenCalledWith({
      select: { id: true, name: true, vehicleType: true },
      orderBy: { name: "asc" },
    });
  });

  it("filters models by the requested brand with deterministic ordering", async () => {
    const models = [{ id: "model-id", name: "Wave" }];
    findModels.mockResolvedValue(models);

    expect(await getVehicleModels("brand-id")).toEqual(models);
    expect(findModels).toHaveBeenCalledWith({
      where: { brandId: "brand-id" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  });

  it("configures both database query caches for one hour", async () => {
    vi.resetModules();
    await import("./vehicles");
    expect(cache).toHaveBeenCalledWith(expect.any(Function), ["vehicle-brands"], {
      revalidate: 3600,
    });
    expect(cache).toHaveBeenCalledWith(expect.any(Function), ["vehicle-models"], {
      revalidate: 3600,
    });
  });
});
