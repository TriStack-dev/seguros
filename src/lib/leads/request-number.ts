/** Formats the database request number for display (for example, 123 → MS-000123). */
export function formatRequestNumber(requestNumber: number): string {
  return `MS-${String(requestNumber).padStart(6, "0")}`;
}

/** Accepts the display format and the unprefixed forms used by panel searches. */
export function parseRequestNumber(text: string): number | null {
  const normalized = text.trim();
  const match = /^(?:MS-)?(\d+)$/i.exec(normalized);
  if (!match) return null;

  const requestNumber = Number(match[1]);
  return Number.isSafeInteger(requestNumber) && requestNumber > 0 ? requestNumber : null;
}
