const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

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
