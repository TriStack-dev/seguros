import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("Citroën C4 Lounge")).toBe("citroen-c4-lounge");
    expect(slugify("Mercedes-Benz")).toBe("mercedes-benz");
  });

  it("removes diacritics and the ñ keeps its base letter", () => {
    expect(slugify("Peña Ñandú")).toBe("pena-nandu");
    expect(slugify("¡Hola! ¿Qué tal?")).toBe("hola-que-tal");
  });

  it("collapses repeated separators and trims them from both ends", () => {
    expect(slugify("  Toyota   Hilux  ")).toBe("toyota-hilux");
    expect(slugify("--SW4--")).toBe("sw4");
    expect(slugify("R 1250 GS")).toBe("r-1250-gs");
  });

  it("keeps digits and returns an empty string when nothing is left", () => {
    expect(slugify("Peugeot 208")).toBe("peugeot-208");
    expect(slugify("!!!")).toBe("");
  });
});
