import { describe, it, expect } from "vitest";
import { leadFormSchema } from "./lead-form";

const validBase = {
  vehicleType: "AUTO" as const,
  fullName: "Juan Pablo Pérez",
  phoneArea: "341",
  phoneNumber: "4123456",
  email: "juan.perez@example.com",
  dni: "12345678",
  isZeroKm: false,
  plate: "AA123BB",
  brandId: "brand-1",
  modelId: "model-1",
  version: "1.6",
  year: 2020,
  hasGnc: false,
  postalCode: "2000",
  usage: "PARTICULAR" as const,
  consent: true,
  website: "",
};

describe("leadFormSchema", () => {
  it("accepts a single phone input and reports invalid input on its visible control", () => {
    const valid = leadFormSchema.safeParse({
      ...validBase,
      phone: "+54 9 341 412-3456",
      phoneArea: "",
      phoneNumber: "",
      hasGnc: null,
    });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.phone).toBe("5493414123456");
    const invalid = leadFormSchema.safeParse({ ...validBase, phone: "1" });
    expect(invalid.success).toBe(false);
    if (!invalid.success)
      expect(invalid.error.issues.some((issue) => issue.path[0] === "phone")).toBe(true);
  });
  it("rejects fractional years", () => {
    expect(leadFormSchema.safeParse({ ...validBase, year: 2020.5 }).success).toBe(false);
  });
  it("validates a correct auto lead", () => {
    const result = leadFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("validates a correct moto lead", () => {
    const result = leadFormSchema.safeParse({
      ...validBase,
      vehicleType: "MOTO",
      plate: "A123BBB",
      hasGnc: null,
      usage: "DELIVERY",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email to lowercase", () => {
    const result = leadFormSchema.safeParse({ ...validBase, email: "JUAN@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
    }
  });

  it("normalizes dni by removing dots", () => {
    const result = leadFormSchema.safeParse({ ...validBase, dni: "12.345.678" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dni).toBe("12345678");
    }
  });

  it("requires plate unless zero km", () => {
    const result = leadFormSchema.safeParse({ ...validBase, plate: "", isZeroKm: false });
    expect(result.success).toBe(false);
  });

  it("allows no plate for zero km", () => {
    const result = leadFormSchema.safeParse({ ...validBase, isZeroKm: true, plate: "" });
    expect(result.success).toBe(true);
  });

  it("accepts unknown GNC when the simplified form does not collect it", () => {
    const result = leadFormSchema.safeParse({ ...validBase, hasGnc: null });
    expect(result.success).toBe(true);
  });

  it("sets hasGnc to null for moto", () => {
    const result = leadFormSchema.safeParse({
      ...validBase,
      vehicleType: "MOTO",
      plate: "A123BBB",
      hasGnc: true, // should be normalized to null
      usage: "PARTICULAR",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hasGnc).toBe(null);
    }
  });

  it("validates usage by vehicle type", () => {
    const result = leadFormSchema.safeParse({ ...validBase, usage: "DELIVERY" }); // delivery not allowed for auto
    expect(result.success).toBe(false);
  });

  it("allows RIDE_HAILING for auto", () => {
    const result = leadFormSchema.safeParse({ ...validBase, usage: "RIDE_HAILING" });
    expect(result.success).toBe(true);
  });

  it("allows brandOther and modelOther when brand is other", () => {
    const result = leadFormSchema.safeParse({
      ...validBase,
      brandId: "",
      brandOther: "Otra Marca",
      modelId: "",
      modelOther: "Modelo X",
    });
    expect(result.success).toBe(true);
  });

  it("requires modelOther when brandOther is used", () => {
    const result = leadFormSchema.safeParse({
      ...validBase,
      brandId: "",
      brandOther: "Otra Marca",
      modelId: "",
      modelOther: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects honeypot filled", () => {
    const result = leadFormSchema.safeParse({ ...validBase, website: "spam" });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = leadFormSchema.safeParse({ ...validBase, consent: false });
    expect(result.success).toBe(false);
  });

  it("validates phone with leading 0 in area and 15 in number", () => {
    const result = leadFormSchema.safeParse({
      ...validBase,
      phoneArea: "0341",
      phoneNumber: "154123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).phone).toBe("5493414123456");
    }
  });

  it("rejects auto plate format for moto and vice versa", () => {
    const motoWithAutoPlate = leadFormSchema.safeParse({
      ...validBase,
      vehicleType: "MOTO",
      plate: "AA123BB",
      usage: "PARTICULAR",
    });
    expect(motoWithAutoPlate.success).toBe(false);

    const autoWithMotoPlate = leadFormSchema.safeParse({ ...validBase, plate: "123AAA" });
    expect(autoWithMotoPlate.success).toBe(false);
  });

  it("validates postal code formats", () => {
    expect(leadFormSchema.safeParse({ ...validBase, postalCode: "2000" }).success).toBe(true);
    expect(leadFormSchema.safeParse({ ...validBase, postalCode: "S2000ABC" }).success).toBe(true);
  });
});
