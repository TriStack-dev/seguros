/**
 * Cálculos del panel de estadísticas que no son SQL: mediana, tasas, embudo y agrupación
 * de "Otras". Se mantienen puros para poder testearlos sin base de datos.
 */

export type FunnelCounts = {
  sent: number;
  whatsapp: number;
  contacted: number;
  quoted: number;
  issued: number;
};

export type FunnelStep = {
  key: keyof FunnelCounts;
  label: string;
  count: number;
  /** Proporción sobre los enviados (0..1), o null si no hay enviados. */
  shareOfSent: number | null;
  /** Proporción sobre el paso anterior (0..1), o null en el primer paso. */
  conversionFromPrevious: number | null;
};

const FUNNEL_STEPS: { key: keyof FunnelCounts; label: string }[] = [
  { key: "sent", label: "Enviados" },
  { key: "whatsapp", label: "Derivados a WhatsApp" },
  { key: "contacted", label: "Contactados" },
  { key: "quoted", label: "Cotizados" },
  { key: "issued", label: "Emitidos" },
];

const MINUTE_MS = 60_000;
const HOUR_MINUTES = 60;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? null;
  }

  const lower = sorted[middle - 1];
  const upper = sorted[middle];

  return lower === undefined || upper === undefined ? null : (lower + upper) / 2;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Proporción `part / total`, o null cuando no hay base de comparación. */
export function ratio(part: number, total: number): number | null {
  if (!Number.isFinite(total) || total === 0) return null;

  return part / total;
}

export function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return "—";

  const percent = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(rate * 100);

  return `${percent} %`;
}

/** Duración legible en horas y minutos ("3 h 12 min"), o "—" sin dato. */
export function formatDurationMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";

  const minutes = Math.max(0, Math.round(ms / MINUTE_MS));
  if (minutes < HOUR_MINUTES) return `${minutes} min`;

  const hours = Math.floor(minutes / HOUR_MINUTES);
  const rest = minutes % HOUR_MINUTES;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function buildFunnel(counts: FunnelCounts): FunnelStep[] {
  const steps = FUNNEL_STEPS.map(({ key, label }) => ({ key, label, count: counts[key] }));

  return steps.map((step, index) => {
    const previous = index === 0 ? null : steps[index - 1];

    return {
      ...step,
      shareOfSent: ratio(step.count, counts.sent),
      conversionFromPrevious: previous ? ratio(step.count, previous.count) : null,
    };
  });
}

/** Top `limit` de mayor a menor, con el resto sumado en una fila "Otras". */
export function topNWithOther(
  rows: { label: string; count: number }[],
  limit = 10,
): { label: string; count: number }[] {
  const sorted = [...rows].sort((a, b) => b.count - a.count).map((row) => ({ ...row }));

  if (sorted.length <= limit) return sorted;

  const top = sorted.slice(0, limit);
  const otherCount = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);

  return [...top, { label: "Otras", count: otherCount }];
}

/** Etiqueta corta del bucket de la serie, según cómo se agrupó. */
export function formatBucketLabel(bucket: string, groupBy: "day" | "week" | "month"): string {
  const [year, month, day] = bucket.split("-");

  if (groupBy === "month") return `${month}/${year}`;
  if (groupBy === "week") return `Sem. ${day}/${month}`;

  return `${day}/${month}`;
}
