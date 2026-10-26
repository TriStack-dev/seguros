import { describe, it, expect } from "vitest";
import { buildWhatsappLink } from "./build-link";
import { ValidationError } from "@/lib/validation/normalizers";

const PHONE = "5493794057190";

describe("buildWhatsappLink", () => {
  it("builds a wa.me link with the encoded message", () => {
    const message = "Peña & Cía #1";

    expect(buildWhatsappLink(PHONE, message)).toBe(
      "https://wa.me/5493794057190?text=Pe%C3%B1a%20%26%20C%C3%ADa%20%231",
    );
  });

  it("keeps the original message when decoded", () => {
    const message = "¡Hola! ¿Cotizamos?\nVehículo: Peugeot 208 #2";

    const link = buildWhatsappLink(PHONE, message);
    const decoded = decodeURIComponent(new URL(link).searchParams.get("text") ?? "");

    expect(decoded).toBe(message);
  });

  it("rejects numbers that are not only digits", () => {
    expect(() => buildWhatsappLink("+5493794057190", "hola")).toThrow(ValidationError);
    expect(() => buildWhatsappLink("549 379 405 7190", "hola")).toThrow(ValidationError);
    expect(() => buildWhatsappLink("", "hola")).toThrow(ValidationError);
  });
});
