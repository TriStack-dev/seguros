import { describe, expect, it } from "vitest";
import {
  CSV_BOM,
  CSV_EOL,
  escapeCsvField,
  serializeCsvHeader,
  serializeCsvRows,
} from "./serialize";

describe("escapeCsvField", () => {
  it("deja intactos los valores simples", () => {
    expect(escapeCsvField("Juan Pérez")).toBe("Juan Pérez");
    expect(escapeCsvField("")).toBe("");
  });

  it("entrecomilla los valores con el separador", () => {
    expect(escapeCsvField("Córdoba; Argentina")).toBe('"Córdoba; Argentina"');
  });

  it("duplica las comillas internas", () => {
    expect(escapeCsvField('Dijo "hola"')).toBe('"Dijo ""hola"""');
  });

  it("entrecomilla los valores con saltos de línea", () => {
    expect(escapeCsvField("linea 1\nlinea 2")).toBe('"linea 1\nlinea 2"');
    expect(escapeCsvField("linea 1\r\nlinea 2")).toBe('"linea 1\r\nlinea 2"');
  });

  it("neutraliza fórmulas al inicio del valor", () => {
    expect(escapeCsvField("=1+1")).toBe("'=1+1");
    expect(escapeCsvField("+5491130000000")).toBe("'+5491130000000");
    expect(escapeCsvField("-2+3")).toBe("'-2+3");
    expect(escapeCsvField("@SUM(A1)")).toBe("'@SUM(A1)");
  });

  it("neutraliza fórmulas aunque haya espacios o tabs antes", () => {
    expect(escapeCsvField("  =1+1")).toBe("'  =1+1");
    expect(escapeCsvField("\t@SUM(A1)")).toBe("'\t@SUM(A1)");
  });

  it("no toca los valores con guion en el medio", () => {
    expect(escapeCsvField("AA123-BB")).toBe("AA123-BB");
  });
});

describe("serializeCsvHeader", () => {
  it("empieza con BOM y termina con un salto de línea", () => {
    expect(serializeCsvHeader(["Número", "Nombre"])).toBe(`${CSV_BOM}Número;Nombre${CSV_EOL}`);
  });
});

describe("serializeCsvRows", () => {
  it("une las filas con el separador y cierra con salto de línea", () => {
    expect(
      serializeCsvRows([
        ["a", "b"],
        ["c", "d"],
      ]),
    ).toBe(`a;b${CSV_EOL}c;d${CSV_EOL}`);
  });

  it("devuelve una cadena vacía sin filas", () => {
    expect(serializeCsvRows([])).toBe("");
  });
});
