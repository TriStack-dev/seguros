/** Límite de caracteres de una nota del lead (después de recortar los extremos). */
export const LEAD_NOTE_MAX_LENGTH = 2000;

export const LEAD_NOTE_EMPTY_MESSAGE = "Escribí una nota antes de guardar.";
export const LEAD_NOTE_TOO_LONG_MESSAGE = `La nota no puede superar los ${LEAD_NOTE_MAX_LENGTH} caracteres.`;

/**
 * Texto de la nota sin espacios sobrantes en los extremos. Los saltos de línea internos y los
 * espacios entre palabras se conservan tal cual los escribió el asesor.
 */
export function normalizeNoteBody(value: string): string {
  return value.trim();
}

/**
 * Valida el texto de una nota ya recortado. Devuelve el mensaje de error, o null si es válido.
 * La usan el formulario y la Server Action para no tener dos reglas distintas.
 */
export function validateNoteBody(body: string): string | null {
  const normalized = normalizeNoteBody(body);

  if (normalized.length === 0) return LEAD_NOTE_EMPTY_MESSAGE;
  if (normalized.length > LEAD_NOTE_MAX_LENGTH) return LEAD_NOTE_TOO_LONG_MESSAGE;

  return null;
}
