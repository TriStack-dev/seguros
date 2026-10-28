/** BOM UTF-8: sin esto Excel no reconoce los acentos ni la ñ al abrir el archivo. */
export const CSV_BOM = "\uFEFF";

/** Excel en español usa `;` como separador de columnas. */
export const CSV_DELIMITER = ";";

/** Fin de registro según RFC 4180; Excel lo espera así. */
export const CSV_EOL = "\r\n";

/** Un valor que abre con estos caracteres se interpretaría como fórmula. */
const FORMULA_PATTERN = /^\s*[=+\-@]/;

/**
 * Antepone `'` a los valores que Excel podría ejecutar como fórmula. Mira el primer carácter
 * significativo, así que ` =1+1` también queda neutralizado.
 */
export function neutralizeFormula(value: string): string {
  return FORMULA_PATTERN.test(value) ? `'${value}` : value;
}

/** Deja el valor listo para una celda: neutraliza fórmulas y entrecomilla si hace falta. */
export function escapeCsvField(value: string): string {
  const safe = neutralizeFormula(value);
  if (!/[;"\r\n]/.test(safe)) return safe;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Serializa una fila completa, sin salto de línea. */
export function serializeCsvRow(values: readonly string[]): string {
  return values.map(escapeCsvField).join(CSV_DELIMITER);
}

/** Encabezado del archivo: BOM, etiquetas y salto de línea. */
export function serializeCsvHeader(headers: readonly string[]): string {
  return CSV_BOM + serializeCsvRow(headers) + CSV_EOL;
}

/** Filas de datos listas para agregar al archivo, sin BOM. */
export function serializeCsvRows(rows: readonly (readonly string[])[]): string {
  if (rows.length === 0) return "";
  return rows.map(serializeCsvRow).join(CSV_EOL) + CSV_EOL;
}
