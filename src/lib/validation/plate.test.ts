import { describe, it, expect } from "vitest";
import { isValidPlate } from "./plate";

describe("plate validation", () => {
  it("validates auto plates", () => {
    // old format
    expect(isValidPlate("AAA999", "AUTO")).toBe(true);
    expect(isValidPlate("aaa999", "AUTO")).toBe(true);
    // mercosur
    expect(isValidPlate("AA999AA", "AUTO")).toBe(true);
    expect(isValidPlate("AB123CD", "AUTO")).toBe(true);
  });

  it("validates moto plates", () => {
    // old format
    expect(isValidPlate("999AAA", "MOTO")).toBe(true);
    // mercosur
    expect(isValidPlate("A999AAA", "MOTO")).toBe(true);
    expect(isValidPlate("B123CCC", "MOTO")).toBe(true);
  });

  it("rejects wrong formats", () => {
    expect(isValidPlate("AAA999", "MOTO")).toBe(false); // auto format for moto
    expect(isValidPlate("999AAA", "AUTO")).toBe(false); // moto format for auto
    expect(isValidPlate("AA1234", "AUTO")).toBe(false);
    expect(isValidPlate("12345", "MOTO")).toBe(false);
  });
});
