import { describe, it, expect } from "vitest";
import { normalizePhone, normalizeDni, normalizePlate, normalizePostalCode, normalizeName, ValidationError } from "./normalizers";

describe("normalizers", () => {
  it("normalizeName trims and collapses spaces", () => {
    expect(normalizeName("  Juan   Pablo   Pérez  ")).toBe("Juan Pablo Pérez");
  });

  it("normalizeDni removes dots and spaces", () => {
    expect(normalizeDni("12.345.678")).toBe("12345678");
    expect(normalizeDni("12345678")).toBe("12345678");
  });

  it("normalizePlate uppercases and removes spaces/dashes", () => {
    expect(normalizePlate("ab 123 cd")).toBe("AB123CD");
    expect(normalizePlate("aa-999-aa")).toBe("AA999AA");
  });

  it("normalizePostalCode uppercases and removes spaces", () => {
    expect(normalizePostalCode("s 2000 abc")).toBe("S2000ABC");
    expect(normalizePostalCode("2000")).toBe("2000");
  });

  it("normalizePhone builds 549... and handles tolerances", () => {
    // normal case
    expect(normalizePhone("341", "4123456")).toBe("5493414123456");
    // with leading 0 in area
    expect(normalizePhone("0341", "4123456")).toBe("5493414123456");
    // with 15 in number
    expect(normalizePhone("341", "154123456")).toBe("5493414123456");
    // with spaces/dashes handled
    expect(normalizePhone("(341)", "412-3456")).toBe("5493414123456");
  });

  it("normalizePhone throws on invalid", () => {
    expect(() => normalizePhone("", "123456")).toThrow(ValidationError);
    expect(() => normalizePhone("341", "")).toThrow(ValidationError);
  });
});
