import { beforeEach, describe, expect, it, vi } from "vitest";

const { getVehicleModels } = vi.hoisted(() => ({ getVehicleModels: vi.fn() }));
vi.mock("@/server/queries/vehicles", () => ({ getVehicleModels }));

import { GET } from "./route";

const brandId = "550e8400-e29b-41d4-a716-446655440000";
const request = (query = "") => new Request(`http://localhost/api/vehicles/models${query}`);

describe("GET /api/vehicles/models", () => {
  beforeEach(() => {
    getVehicleModels.mockReset();
  });

  it.each(["", "?brandId=", "?brandId=Honda", `?brandId=${brandId}&brandId=${brandId}`])(
    "rejects invalid query %s without querying the database",
    async (query) => {
      const response = await GET(request(query));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Seleccioná una marca válida" });
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(getVehicleModels).not.toHaveBeenCalled();
    },
  );

  it("returns models for one brand and allows caching for one hour", async () => {
    const models = [{ id: "model-id", name: "Corolla" }];
    getVehicleModels.mockResolvedValue(models);

    const response = await GET(request(`?brandId=${brandId}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(models);
    expect(getVehicleModels).toHaveBeenCalledWith(brandId);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600");
  });

  it("returns an empty catalog for a valid unknown brand", async () => {
    getVehicleModels.mockResolvedValue([]);
    const response = await GET(request(`?brandId=${brandId}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it("returns a noncacheable error without leaking database details", async () => {
    getVehicleModels.mockImplementation(async () => {
      throw new Error("private database error");
    });
    const response = await GET(request(`?brandId=${brandId}`));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "No pudimos cargar los modelos. Probá de nuevo.",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
