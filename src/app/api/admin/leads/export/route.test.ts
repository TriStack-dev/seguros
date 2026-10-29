import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, iterateLeadsForExport } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  iterateLeadsForExport: vi.fn(),
}));

vi.mock("@/server/auth", () => ({ requireAdmin }));
vi.mock("@/server/queries/lead-export", () => ({ iterateLeadsForExport }));

import { GET } from "./route";

import type { Prisma } from "@/generated/prisma/client";

const lead = {
  requestNumber: 123,
  createdAt: new Date("2026-10-28T13:05:00.000Z"),
  status: "LOST" as const,
  lostReason: "PRICE" as const,
  vehicleType: "AUTO" as const,
  fullName: "=Ana Gómez",
  dni: "30123456",
  phone: "5493414123456",
  email: "ana@example.com",
  brandName: "Toyota",
  modelName: "Corolla",
  year: 2020,
  hasGnc: true,
  plate: "AA123BB",
  isZeroKm: false,
  postalCode: "2000",
  usage: "PARTICULAR" as const,
  whatsappClickedAt: null,
  firstContactedAt: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  gclid: null,
  referrer: null,
};

function get(query = "") {
  return GET(new Request(`https://panel.test/api/admin/leads/export${query}`));
}

/** Simula el stream con los lotes indicados. */
function batches(...values: unknown[][]) {
  iterateLeadsForExport.mockImplementation(async function* () {
    for (const batch of values) yield batch;
  });
}

/** `where` con el que el route handler consultó los leads. */
function firstWhere(): Prisma.LeadWhereInput {
  const call = iterateLeadsForExport.mock.calls[0];
  if (!call) throw new Error("no se llamó a iterateLeadsForExport");
  return call[0] as Prisma.LeadWhereInput;
}

describe("GET /api/admin/leads/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-28T12:00:00.000Z"));
    requireAdmin.mockResolvedValue({ id: "admin", email: "admin@example.com" });
    batches([lead]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exige sesión de administrador", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));

    await expect(get()).rejects.toThrow("NEXT_REDIRECT");
    expect(iterateLeadsForExport).not.toHaveBeenCalled();
  });

  it("devuelve el archivo como adjunto con el nombre del día en Argentina", async () => {
    const response = await get();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="leads-2026-10-28.csv"',
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("genera el CSV con BOM, separador ; y encabezado en español", async () => {
    const bytes = new Uint8Array(await (await get()).arrayBuffer());

    // Se miran los bytes porque `text()` descarta el BOM al decodificar.
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);

    const body = new TextDecoder().decode(bytes);
    const [header = "", firstRow = ""] = body.replace(/^\uFEFF/, "").split("\r\n");
    expect(header.split(";")).toHaveLength(25);
    expect(header).toBe(
      "Número de solicitud;Fecha;Estado;Motivo de pérdida;Tipo de vehículo;Nombre;DNI;Teléfono;Email;Marca;Modelo;Versión;Año;GNC;Patente;0 km;Código postal;Tipo de uso;Derivado a WhatsApp;Primera respuesta;Origen;utm_source;utm_medium;utm_campaign;gclid",
    );
    expect(firstRow.split(";")[0]).toBe("MS-000123");
    expect(firstRow).toContain("28/10/2026 10:05");
    expect(firstRow).toContain("Perdido");
  });

  it("neutraliza un nombre que empieza con =", async () => {
    const body = await (await get()).text();
    expect(body).toContain("'=Ana Gómez");
  });

  it("conserva los filtros de la URL en la consulta", async () => {
    await get("?status=LOST&vehicleType=MOTO&search=Ana&from=2026-10-01&to=2026-10-31");

    const where = firstWhere();
    expect(where.status).toBe("LOST");
    expect(where.vehicleType).toBe("MOTO");
    expect(where.createdAt).toMatchObject({ gte: new Date("2026-10-01T03:00:00.000Z") });
    expect(where.OR).toContainEqual({ fullName: { contains: "Ana", mode: "insensitive" } });
  });

  it("ignora los filtros inválidos", async () => {
    await get("?status=ARCHIVADO&vehicleType=BARCO");

    expect(firstWhere()).toEqual({});
  });

  it("escribe todos los lotes en el mismo archivo", async () => {
    batches([lead], [{ ...lead, requestNumber: 124 }]);

    const body = await (await get()).text();
    expect(body).toContain("MS-000123");
    expect(body).toContain("MS-000124");
  });
});
