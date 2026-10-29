/**
 * Rango de fechas del panel de estadísticas.
 *
 * Todo se calcula sobre el calendario de Argentina: un lead creado a las 23:30 de Argentina
 * pertenece a ese día, no al siguiente (ver criterio de aceptación del step 20).
 */

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export const STATS_PATH = "/admin/estadisticas";
export const STATS_RANGE_KEYS = ["7", "30", "90", "custom"] as const;
export const DEFAULT_RANGE_KEY = "30";

export type StatsRangeKey = (typeof STATS_RANGE_KEYS)[number];
export type StatsGroupBy = "day" | "week" | "month";

export type StatsRange = {
  key: StatsRangeKey;
  /** Primer día incluido, `YYYY-MM-DD` en hora de Argentina. */
  fromDate: string;
  /** Último día incluido, `YYYY-MM-DD` en hora de Argentina. */
  toDate: string;
  groupBy: StatsGroupBy;
  label: string;
};

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Fecha `YYYY-MM-DD` del calendario de Argentina. */
function todayInArgentina(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  return formatUtcDate(new Date(toUtcDate(date).getTime() + days * DAY_MS));
}

/** Valida forma y existencia real de la fecha (`2026-02-31` no existe). */
function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = toUtcDate(value);
  return !Number.isNaN(parsed.getTime()) && formatUtcDate(parsed) === value;
}

function spanDays(fromDate: string, toDate: string): number {
  return Math.round((toUtcDate(toDate).getTime() - toUtcDate(fromDate).getTime()) / DAY_MS) + 1;
}

/** Día para rangos cortos, semana para medios y mes para los largos. */
export function groupByForSpan(days: number): StatsGroupBy {
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function quickRange(key: Exclude<StatsRangeKey, "custom">, now: Date): StatsRange {
  const days = Number(key);
  const toDate = todayInArgentina(now);
  const fromDate = addDays(toDate, -(days - 1));

  return {
    key,
    fromDate,
    toDate,
    groupBy: groupByForSpan(days),
    label: `Últimos ${days} días`,
  };
}

/**
 * Normaliza el rango que viene en la URL. Es la única puerta de entrada: un parámetro
 * manipulado no puede producir fechas inválidas ni rangos al revés.
 */
export function resolveStatsRange(
  params: Record<string, string | string[] | undefined>,
  now: Date = new Date(),
): StatsRange {
  const rawKey = single(params.range);
  const key: StatsRangeKey = (STATS_RANGE_KEYS as readonly string[]).includes(rawKey ?? "")
    ? (rawKey as StatsRangeKey)
    : DEFAULT_RANGE_KEY;

  if (key !== "custom") return quickRange(key, now);

  const from = single(params.from) ?? "";
  const to = single(params.to) ?? "";
  if (!isValidDate(from) || !isValidDate(to)) return quickRange(DEFAULT_RANGE_KEY, now);

  const [fromDate, toDate] = from <= to ? [from, to] : [to, from];

  return {
    key,
    fromDate,
    toDate,
    groupBy: groupByForSpan(spanDays(fromDate, toDate)),
    label: `${formatShortDate(fromDate)} a ${formatShortDate(toDate)}`,
  };
}

/**
 * Instantes UTC que abarcan el rango del calendario de Argentina. `from` es inclusivo y `to`
 * es exclusivo (el día siguiente al último incluido), que es lo que espera Prisma.
 * Argentina es UTC-3 todo el año (sin horario de verano desde 2009).
 */
export function argentinaRangeToUtc(range: Pick<StatsRange, "fromDate" | "toDate">): {
  from: Date;
  to: Date;
} {
  return {
    from: new Date(`${range.fromDate}T00:00:00-03:00`),
    to: new Date(`${addDays(range.toDate, 1)}T00:00:00-03:00`),
  };
}

/** Link al panel para un rango rápido o personalizado. */
export function buildStatsHref(
  key: StatsRangeKey,
  dates?: { from: string; to: string },
): string {
  const query = new URLSearchParams({ range: key });

  if (key === "custom" && dates && isValidDate(dates.from) && isValidDate(dates.to)) {
    query.set("from", dates.from);
    query.set("to", dates.to);
  }

  return `${STATS_PATH}?${query.toString()}`;
}
