import { describe, expect, it } from "vitest";
import { buildLeadWhere, parseLeadListFilters } from "./filters";

describe("parseLeadListFilters", () => {
  it("acepta los valores válidos del listado", () => {
    expect(
      parseLeadListFilters({
        search: " MS-000123 ",
        from: "2026-10-01",
        to: "2026-10-31",
        vehicleType: "MOTO",
        status: "LOST",
      }),
    ).toEqual({
      search: " MS-000123 ",
      from: "2026-10-01",
      to: "2026-10-31",
      vehicleType: "MOTO",
      status: "LOST",
    });
  });

  it("descarta tipos y estados desconocidos", () => {
    const filters = parseLeadListFilters({ vehicleType: "BARCO", status: "ARCHIVADO" });
    expect(filters.vehicleType).toBeUndefined();
    expect(filters.status).toBeUndefined();
  });

  it("ignora valores repetidos en la query", () => {
    expect(parseLeadListFilters({ status: ["NEW", "LOST"] }).status).toBeUndefined();
  });

  it("devuelve un objeto vacío sin parámetros", () => {
    expect(parseLeadListFilters({})).toEqual({
      search: undefined,
      from: undefined,
      to: undefined,
      vehicleType: undefined,
      status: undefined,
    });
  });
});

describe("buildLeadWhere", () => {
  it("no filtra nada sin filtros", () => {
    expect(buildLeadWhere({})).toEqual({});
  });

  it("filtra por tipo de vehículo y estado", () => {
    expect(buildLeadWhere({ vehicleType: "AUTO", status: "ISSUED" })).toEqual({
      vehicleType: "AUTO",
      status: "ISSUED",
    });
  });

  it("convierte los días de Argentina a límites UTC", () => {
    expect(buildLeadWhere({ from: "2026-10-01", to: "2026-10-31" })).toEqual({
      createdAt: {
        gte: new Date("2026-10-01T03:00:00.000Z"),
        lte: new Date("2026-11-01T02:59:59.999Z"),
      },
    });
  });

  it("ignora fechas inválidas", () => {
    expect(buildLeadWhere({ from: "ayer" })).toEqual({ createdAt: {} });
  });

  it("busca por número de solicitud, nombre, DNI, email, teléfono y patente", () => {
    const where = buildLeadWhere({ search: "MS-000123" });
    expect(where.OR).toContainEqual({ requestNumber: 123 });
    expect(where.OR).toContainEqual({ fullName: { contains: "MS-000123", mode: "insensitive" } });
    expect(where.OR).toContainEqual({ phone: { contains: "000123" } });
  });

  it("normaliza DNI, teléfono y patente en la búsqueda", () => {
    const where = buildLeadWhere({ search: "aa 123-bb" });
    expect(where.OR).toContainEqual({
      plate: { contains: "AA123BB", mode: "insensitive" },
    });
    expect(where.OR).toContainEqual({
      dni: { contains: "aa123-bb", mode: "insensitive" },
    });
  });

  it("recorta la búsqueda antes de usarla", () => {
    expect(buildLeadWhere({ search: "   " })).toEqual({});
  });
});
