import { describe, it, expect } from "vitest";
import { buildWhatsappMessage, formatRequestNumber, type WhatsappLeadData } from "./build-message";

function makeLead(overrides: Partial<WhatsappLeadData> = {}): WhatsappLeadData {
  return {
    vehicleType: "AUTO",
    fullName: "Juan Pablo Pérez",
    phoneArea: "341",
    phoneNumber: "4123456",
    phone: "5493414123456",
    email: "juan@example.com",
    dni: "12345678",
    isZeroKm: false,
    plate: "AB 123 CD",
    plateNormalized: "AB123CD",
    brandId: "toyota",
    brandOther: "",
    modelId: "corolla",
    modelOther: "",
    version: "XEI",
    year: 2020,
    hasGnc: true,
    postalCode: "S2000ABC",
    usage: "PARTICULAR",
    consent: true,
    website: "",
    requestNumber: 123,
    brandName: "Toyota",
    modelName: "Corolla",
    ...overrides,
  };
}

describe("buildWhatsappMessage", () => {
  it("builds the full message for a car", () => {
    expect(buildWhatsappMessage(makeLead())).toBe(
      [
        "¡Hola! Quiero cotizar un seguro para mi auto.",
        "Solicitud N° MS-000123",
        "Nombre: Juan Pablo Pérez",
        "DNI: 12345678",
        "Teléfono: +54 9 341 412-3456",
        "Email: juan@example.com",
        "Vehículo: Toyota Corolla XEI 2020",
        "Patente: AB123CD",
        "GNC: Sí",
        "Uso: Particular",
        "Código postal: S2000ABC",
      ].join("\n"),
    );
  });

  it("omits the GNC line for motorcycles", () => {
    const message = buildWhatsappMessage(
      makeLead({
        vehicleType: "MOTO",
        hasGnc: null,
        usage: "DELIVERY",
        brandName: "Honda",
        modelName: "Titán",
        version: "150",
        plateNormalized: "A123BCD",
      }),
    );

    expect(message).toContain("¡Hola! Quiero cotizar un seguro para mi moto.");
    expect(message).toContain("Uso: Delivery / mensajería");
    expect(message).not.toContain("GNC");
  });

  it("shows 'Patente: 0 km' for a brand new vehicle without a plate", () => {
    const message = buildWhatsappMessage(
      makeLead({
        isZeroKm: true,
        plate: "",
        plateNormalized: undefined,
      }),
    );

    expect(message).toContain("Patente: 0 km");
  });

  it("omits the version when the lead has none", () => {
    const message = buildWhatsappMessage(makeLead({ version: "" }));

    expect(message).toContain("Vehículo: Toyota Corolla 2020");
    expect(message).not.toContain("Vehículo: Toyota Corolla  2020");
  });

  it("uses the free text brand and model when the lead chose 'Otro'", () => {
    const message = buildWhatsappMessage(
      makeLead({
        brandId: "",
        brandOther: "Marca Ñandú",
        modelId: "",
        modelOther: "Custom & Cía",
        brandName: "Marca Ñandú",
        modelName: "Custom & Cía",
      }),
    );

    expect(message).toContain("Vehículo: Marca Ñandú Custom & Cía XEI 2020");
  });

  it("formats the request number with six digits and pads only when needed", () => {
    expect(formatRequestNumber(123)).toBe("MS-000123");
    expect(formatRequestNumber(1234567)).toBe("MS-1234567");
  });
});
