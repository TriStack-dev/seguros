import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: { lead: { findMany } } }));

import { LEAD_EXPORT_BATCH_SIZE, iterateLeadsForExport } from "./lead-export";

function makeLead(index: number) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    requestNumber: index,
    createdAt: new Date("2026-10-28T13:05:00.000Z"),
    status: "NEW" as const,
    lostReason: null,
    vehicleType: "AUTO" as const,
    fullName: "Ana Gómez",
    dni: "30123456",
    phone: "5493414123456",
    email: "ana@example.com",
    brandName: "Toyota",
    modelName: "Corolla",
    year: 2020,
    hasGnc: null,
    plate: null,
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
}

async function collect(where: Parameters<typeof iterateLeadsForExport>[0]) {
  const batches: unknown[][] = [];
  for await (const batch of iterateLeadsForExport(where)) {
    batches.push(batch);
  }
  return batches;
}

describe("iterateLeadsForExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve todo en un solo lote cuando no llega al tamaño del lote", async () => {
    findMany.mockResolvedValueOnce([makeLead(1), makeLead(2)]);

    const batches = await collect({ status: "NEW" });

    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "NEW" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: LEAD_EXPORT_BATCH_SIZE,
      }),
    );
  });

  it("pagina por cursor cuando el lote viene completo", async () => {
    const lastOfFirstBatch = makeLead(LEAD_EXPORT_BATCH_SIZE);
    const fullBatch = [
      ...Array.from({ length: LEAD_EXPORT_BATCH_SIZE - 1 }, (_, index) => makeLead(index + 1)),
      lastOfFirstBatch,
    ];
    findMany
      .mockResolvedValueOnce(fullBatch)
      .mockResolvedValueOnce([makeLead(LEAD_EXPORT_BATCH_SIZE + 1)]);

    const batches = await collect({});

    expect(batches).toHaveLength(2);
    expect(batches[1]).toHaveLength(1);
    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        cursor: { id: lastOfFirstBatch.id },
        skip: 1,
      }),
    );
  });

  it("no pide otro lote cuando el anterior vino vacío", async () => {
    findMany.mockResolvedValueOnce([]);

    expect(await collect({})).toEqual([]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it("selecciona solo las columnas que usa el CSV", async () => {
    findMany.mockResolvedValueOnce([]);

    await collect({});

    const select = findMany.mock.calls[0]?.[0]?.select as Record<string, boolean>;
    expect(Object.keys(select ?? {}).sort()).toEqual(
      [
        "brandName",
        "createdAt",
        "dni",
        "email",
        "firstContactedAt",
        "fullName",
        "gclid",
        "hasGnc",
        "id",
        "isZeroKm",
        "lostReason",
        "modelName",
        "phone",
        "plate",
        "postalCode",
        "referrer",
        "requestNumber",
        "status",
        "usage",
        "utmCampaign",
        "utmMedium",
        "utmSource",
        "vehicleType",
        "whatsappClickedAt",
        "year",
      ].sort(),
    );
  });
});
