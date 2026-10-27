import { beforeEach, describe, expect, it, vi } from "vitest";

const { brandFindUnique, modelFindUnique, leadCreate, statusChangeCreate, transaction } =
  vi.hoisted(() => {
    const brandFindUnique = vi.fn();
    const modelFindUnique = vi.fn();
    const leadCreate = vi.fn();
    const statusChangeCreate = vi.fn();
    const transaction = vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({ lead: { create: leadCreate }, leadStatusChange: { create: statusChangeCreate } }),
    );
    return { brandFindUnique, modelFindUnique, leadCreate, statusChangeCreate, transaction };
  });

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  db: {
    vehicleBrand: { findUnique: brandFindUnique },
    vehicleModel: { findUnique: modelFindUnique },
    $transaction: transaction,
  },
}));

import { submitLead } from "./submit-lead";
import type { LeadFormInput } from "@/lib/validation/lead-form";

const validInput: LeadFormInput = {
  vehicleType: "AUTO",
  fullName: "Ana Pérez",
  phone: "3414123456",
  phoneArea: "",
  phoneNumber: "",
  email: "ANA@example.com",
  dni: "12.345.678",
  isZeroKm: false,
  plate: "AA123BB",
  brandId: "brand-id",
  brandOther: "",
  modelId: "model-id",
  modelOther: "",
  hasGnc: null,
  postalCode: "2000",
  consent: true,
  website: "",
  year: "2020",
  usage: "PARTICULAR",
};

beforeEach(() => {
  vi.clearAllMocks();
  brandFindUnique.mockResolvedValue({ id: "brand-id", name: "Ford", vehicleType: "AUTO" });
  modelFindUnique.mockResolvedValue({ id: "model-id", name: "Ka", brandId: "brand-id" });
  leadCreate.mockResolvedValue({ id: "lead-id", requestNumber: 123 });
});

describe("submitLead", () => {
  it("rejects invalid data with field errors without writing", async () => {
    const result = await submitLead({ ...validInput, email: "invalid" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { email: expect.any(Array) } });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns fake success for a filled honeypot without reading or writing", async () => {
    const result = await submitLead({ ...validInput, website: "bot" });
    expect(result.ok).toBe(true);
    expect(transaction).not.toHaveBeenCalled();
    expect(brandFindUnique).not.toHaveBeenCalled();
  });

  it("rejects a brand belonging to another vehicle type", async () => {
    brandFindUnique.mockResolvedValue({ id: "brand-id", name: "Yamaha", vehicleType: "MOTO" });
    const result = await submitLead(validInput);
    expect(result).toMatchObject({ ok: false, fieldErrors: { brandId: expect.any(Array) } });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("rejects a model that belongs to a different brand", async () => {
    modelFindUnique.mockResolvedValue({ id: "model-id", name: "Ka", brandId: "other-brand" });
    const result = await submitLead(validInput);
    expect(result).toMatchObject({ ok: false, fieldErrors: { modelId: expect.any(Array) } });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("creates a normalized lead and its initial status in one transaction", async () => {
    const result = await submitLead(validInput);
    expect(result).toEqual({ ok: true, leadId: "lead-id", requestNumber: "MS-000123" });
    expect(transaction).toHaveBeenCalledOnce();
    expect(leadCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        vehicleType: "AUTO",
        fullName: "Ana Pérez",
        phone: "5493414123456",
        email: "ana@example.com",
        dni: "12345678",
        plate: "AA123BB",
        brandId: "brand-id",
        brandName: "Ford",
        modelId: "model-id",
        modelName: "Ka",
        year: 2020,
        usage: "PARTICULAR",
        status: "NEW",
        consentAt: expect.any(Date),
      }),
    });
    expect(statusChangeCreate).toHaveBeenCalledWith({
      data: {
        leadId: "lead-id",
        fromStatus: null,
        toStatus: "NEW",
      },
    });
  });

  it("returns a generic failure when persistence fails", async () => {
    transaction.mockRejectedValueOnce(new Error("database unavailable"));
    const result = await submitLead(validInput);
    expect(result).toMatchObject({
      ok: false,
      message: expect.stringContaining("No pudimos enviar"),
    });
  });
});

it.each([true, false])(
  "persists zero km without plate and GNC=%s without version",
  async (hasGnc) => {
    const result = await submitLead({ ...validInput, isZeroKm: true, plate: "", hasGnc });
    expect(result.ok).toBe(true);
    expect(leadCreate.mock.calls[0]?.[0].data).toMatchObject({
      isZeroKm: true,
      plate: null,
      hasGnc,
    });
    expect(leadCreate.mock.calls[0]?.[0].data).not.toHaveProperty("version");
  },
);
