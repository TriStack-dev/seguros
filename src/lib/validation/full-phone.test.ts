import { describe, expect, it } from "vitest";
import { normalizeFullPhone } from "./normalizers";

describe("normalizeFullPhone", () => {
  it.each(["3414123456", "11 4123-4567", "0341 4123456", "+54 9 341 412-3456", "+54 341 4123456"])(
    "normalizes area and number without guessing their boundary: %s",
    (value) => {
      expect(normalizeFullPhone(value)).toBe(
        value.includes("11 ") ? "5491141234567" : "5493414123456",
      );
    },
  );
  it.each(["", "1", "341154123456", "12345678901234"])(
    "rejects incomplete or ambiguous phone: %s",
    (value) => {
      expect(() => normalizeFullPhone(value)).toThrow(
        "Ingresá un teléfono con código de área (10 dígitos, sin 15)",
      );
    },
  );
});
