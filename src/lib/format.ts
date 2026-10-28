const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

function argentinaParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: ARGENTINA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

/** Fecha y hora en hora de Argentina, para mostrar en el panel. */
export function formatDateTimeAr(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: ARGENTINA_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** Fecha y hora `DD/MM/AAAA HH:mm` en hora de Argentina, sin comas (exportaciones). */
export function formatDateTimeArCompact(date: Date): string {
  const parts = argentinaParts(date);
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

/** Fecha `AAAA-MM-DD` en hora de Argentina, para nombrar archivos. */
export function formatDateArCompact(date: Date): string {
  const parts = argentinaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}
