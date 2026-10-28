import { describe, expect, it } from "vitest";
import { buildLeadSummary, type LeadSummaryInput } from "./summary";

const base: LeadSummaryInput = {
  requestNumber: 123,
  fullName: "Ana Pérez",
  dni: "30123456",
  phone: "5493414123456",
  email: "ana@example.com",
  vehicleType: "AUTO",
  brandName: "Toyota",
  modelName: "Corolla",
  year: 2020,
  isZeroKm: false,
  plate: "AB123CD",
  hasGnc: false,
  usage: "PARTICULAR",
  postalCode: "2000",
  status: "NEW",
};

describe("buildLeadSummary", () => {
  it("includes the contact, vehicle and status data", () => {
    expect(buildLeadSummary(base)).toBe(
      [
        "Solicitud MS-000123",
        "Nombre: Ana Pérez",
        "DNI: 30123456",
        "Teléfono: +54 9 341 412-3456",
        "Email: ana@example.com",
        "Vehículo: Auto Toyota Corolla 2020",
        "Patente: AB123CD",
        "GNC: No",
        "Uso: Particular",
        "Código postal: 2000",
        "Estado: Nuevo",
      ].join("\n"),
    );
  });

  it("shows the GNC line only for cars", () => {
    const summary = buildLeadSummary({
      ...base,
      vehicleType: "MOTO",
      brandName: "Honda",
      modelName: "Titan",
      hasGnc: null,
    });
    expect(summary).toContain("Vehículo: Moto Honda Titan 2020");
    expect(summary).not.toContain("GNC:");
  });

  it("shows 0 km instead of the plate for zero-kilometer vehicles", () => {
    const summary = buildLeadSummary({ ...base, isZeroKm: true, plate: null });
    expect(summary).toContain("Patente: 0 km");
  });

  it("falls back to a dash when a used vehicle has no plate", () => {
    const summary = buildLeadSummary({ ...base, plate: null });
    expect(summary).toContain("Patente: —");
  });
});
