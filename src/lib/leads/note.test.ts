import { describe, expect, it } from "vitest";
import {
  LEAD_NOTE_EMPTY_MESSAGE,
  LEAD_NOTE_MAX_LENGTH,
  LEAD_NOTE_TOO_LONG_MESSAGE,
  normalizeNoteBody,
  validateNoteBody,
} from "./note";

describe("normalizeNoteBody", () => {
  it("quita espacios y saltos de línea de los extremos", () => {
    expect(normalizeNoteBody("  Cotizó la caja  \n")).toBe("Cotizó la caja");
  });

  it("conserva los saltos de línea internos y los espacios entre palabras", () => {
    expect(normalizeNoteBody("  Llamar mañana\n pasado a las 10  ")).toBe(
      "Llamar mañana\n pasado a las 10",
    );
  });
});

describe("validateNoteBody", () => {
  it("acepta un texto normal", () => {
    expect(validateNoteBody("Pidió cuota en 6 pagos")).toBeNull();
  });

  it("rechaza una nota vacía", () => {
    expect(validateNoteBody("")).toBe(LEAD_NOTE_EMPTY_MESSAGE);
  });

  it("rechaza una nota compuesta solo por espacios y saltos de línea", () => {
    expect(validateNoteBody("   \n\t  \n ")).toBe(LEAD_NOTE_EMPTY_MESSAGE);
  });

  it("acepta exactamente el máximo de caracteres", () => {
    expect(validateNoteBody("a".repeat(LEAD_NOTE_MAX_LENGTH))).toBeNull();
  });

  it("acepta el máximo cuando los espacios sobrantes se recortan", () => {
    expect(validateNoteBody(`  ${"a".repeat(LEAD_NOTE_MAX_LENGTH)}  `)).toBeNull();
  });

  it("rechaza un texto un carácter más largo que el máximo", () => {
    expect(validateNoteBody("a".repeat(LEAD_NOTE_MAX_LENGTH + 1))).toBe(LEAD_NOTE_TOO_LONG_MESSAGE);
  });
});
