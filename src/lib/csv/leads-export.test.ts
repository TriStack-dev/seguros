import { describe, expect, it } from "vitest";
import { LEAD_EXPORT_HEADERS, buildLeadExportRow, type LeadExportData } from "./leads-export";

const lead: LeadExportData = {
  requestNumber: 123,
  createdAt: new Date("2026-10-28T13:05:00.000Z"),
  status: "LOST",
  lostReason: "PRICE",
  vehicleType: "AUTO",
  fullName: "Ana Gómez",
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
  usage: "PARTICULAR",
  whatsappClickedAt: new Date("2026-10-28T13:10:00.000Z"),
  firstContactedAt: new Date("2026-10-28T18:30:00.000Z"),
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "autos-octubre",
  gclid: "abc123",
  referrer: null,
};

describe("LEAD_EXPORT_HEADERS", () => {
  it("respeta las columnas y el orden de la sección 10", () => {
    expect(LEAD_EXPORT_HEADERS).toEqual([
      "Número de solicitud",
      "Fecha",
      "Estado",
      "Motivo de pérdida",
      "Tipo de vehículo",
      "Nombre",
      "DNI",
      "Teléfono",
      "Email",
      "Marca",
      "Modelo",
      "Versión",
      "Año",
      "GNC",
      "Patente",
      "0 km",
      "Código postal",
      "Tipo de uso",
      "Derivado a WhatsApp",
      "Primera respuesta",
      "Origen",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "gclid",
    ]);
  });
});

describe("buildLeadExportRow", () => {
  it("arma la fila con etiquetas en español y fechas de Argentina", () => {
    expect(buildLeadExportRow(lead)).toEqual([
      "MS-000123",
      "28/10/2026 10:05",
      "Perdido",
      "Le pareció caro",
      "Auto",
      "Ana Gómez",
      "30123456",
      "+54 9 341 412-3456",
      "ana@example.com",
      "Toyota",
      "Corolla",
      "",
      "2020",
      "Sí",
      "AA123BB",
      "No",
      "2000",
      "Particular",
      "Sí",
      "28/10/2026 15:30",
      "Campaña",
      "google",
      "cpc",
      "autos-octubre",
      "abc123",
    ]);
  });

  it("deja vacíos los datos que el lead no tiene", () => {
    const row = buildLeadExportRow({
      ...lead,
      status: "NEW",
      lostReason: null,
      hasGnc: null,
      plate: null,
      isZeroKm: true,
      whatsappClickedAt: null,
      firstContactedAt: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      gclid: null,
      referrer: null,
    });

    expect(row[2]).toBe("Nuevo");
    expect(row[3]).toBe("");
    expect(row[13]).toBe("");
    expect(row[14]).toBe("");
    expect(row[15]).toBe("Sí");
    expect(row[18]).toBe("No");
    expect(row[19]).toBe("");
    expect(row[20]).toBe("Directo");
    expect(row.slice(21)).toEqual(["", "", "", ""]);
  });

  it("marca GNC y 0 km en negativo cuando corresponde", () => {
    const row = buildLeadExportRow({
      ...lead,
      hasGnc: false,
      vehicleType: "MOTO",
      usage: "DELIVERY",
    });
    expect(row[13]).toBe("No");
    expect(row[4]).toBe("Moto");
    expect(row[17]).toBe("Delivery / mensajería");
  });
});
