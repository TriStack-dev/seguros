import "server-only";

import { classifySource, type AttributionSource } from "@/lib/attribution/classify-source";
import { USAGE_LABELS, VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ratio, topNWithOther, type FunnelCounts } from "@/lib/stats/calculations";
import { argentinaRangeToUtc, type StatsRange } from "@/lib/stats/range";
import { requireAdmin } from "@/server/auth";

const ARGENTINA_ZONE = "America/Argentina/Buenos_Aires";

const GROUP_INTERVAL: Record<StatsRange["groupBy"], string> = {
  day: "1 day",
  week: "1 week",
  month: "1 month",
};

const SOURCE_ORDER: AttributionSource[] = [
  "Campaña",
  "Campaña (otra)",
  "Orgánico",
  "Referido",
  "Directo",
];

export type StatsSeriesPoint = {
  /** `YYYY-MM-DD` del inicio del bucket, en hora de Argentina. */
  bucket: string;
  count: number;
};

export type StatsDistribution = {
  label: string;
  count: number;
};

export type StatsOverview = {
  range: StatsRange;
  total: number;
  contactRate: number | null;
  medianResponseMs: number | null;
  averageResponseMs: number | null;
  funnel: FunnelCounts;
  overTime: StatsSeriesPoint[];
  byVehicleType: StatsDistribution[];
  byBrand: StatsDistribution[];
  byUsage: StatsDistribution[];
  byPostalCode: StatsDistribution[];
  bySource: StatsDistribution[];
};

type FunnelRow = {
  sent: bigint;
  whatsapp: bigint;
  contacted: bigint;
  quoted: bigint;
  issued: bigint;
  average_ms: string | null;
  median_ms: string | null;
};

/** Serie de leads por día, semana o mes, con los buckets vacíos en cero. */
async function leadsOverTime(range: StatsRange): Promise<StatsSeriesPoint[]> {
  const rows = await db.$queryRaw<{ bucket: string; total: bigint }[]>`
    WITH bounds AS (
      SELECT
        (${range.fromDate}::timestamp AT TIME ZONE ${ARGENTINA_ZONE}::text) AS from_ts,
        ((${range.toDate}::date + 1)::timestamp AT TIME ZONE ${ARGENTINA_ZONE}::text) AS to_ts
    ),
    buckets AS (
      SELECT generate_series(
        date_trunc(
          ${range.groupBy}::text,
          (SELECT from_ts FROM bounds) AT TIME ZONE ${ARGENTINA_ZONE}::text
        ),
        date_trunc(
          ${range.groupBy}::text,
          (SELECT to_ts FROM bounds) AT TIME ZONE ${ARGENTINA_ZONE}::text - interval '1 second'
        ),
        ${GROUP_INTERVAL[range.groupBy]}::interval
      ) AS bucket
    ),
    counted AS (
      SELECT
        date_trunc(
          ${range.groupBy}::text,
          "createdAt" AT TIME ZONE ${ARGENTINA_ZONE}::text
        ) AS bucket,
        count(*) AS total
      FROM "Lead"
      WHERE "createdAt" >= (SELECT from_ts FROM bounds)
        AND "createdAt" < (SELECT to_ts FROM bounds)
      GROUP BY 1
    )
    SELECT to_char(b.bucket, 'YYYY-MM-DD') AS bucket, COALESCE(c.total, 0) AS total
    FROM buckets b
    LEFT JOIN counted c ON c.bucket = b.bucket
    ORDER BY b.bucket
  `;

  return rows.map((row) => ({ bucket: row.bucket, count: Number(row.total) }));
}

/** Embudo y tiempos de primera respuesta, en una sola pasada sobre el rango. */
async function funnelAndResponseTimes(range: StatsRange): Promise<FunnelRow | null> {
  const rows = await db.$queryRaw<FunnelRow[]>`
    WITH bounds AS (
      SELECT
        (${range.fromDate}::timestamp AT TIME ZONE ${ARGENTINA_ZONE}::text) AS from_ts,
        ((${range.toDate}::date + 1)::timestamp AT TIME ZONE ${ARGENTINA_ZONE}::text) AS to_ts
    ),
    in_range AS (
      SELECT id, status, "createdAt", "firstContactedAt", "whatsappClickedAt"
      FROM "Lead"
      WHERE "createdAt" >= (SELECT from_ts FROM bounds)
        AND "createdAt" < (SELECT to_ts FROM bounds)
    )
    SELECT
      (SELECT count(*) FROM in_range) AS sent,
      (SELECT count(*) FROM in_range WHERE "whatsappClickedAt" IS NOT NULL) AS whatsapp,
      (SELECT count(*) FROM in_range WHERE "firstContactedAt" IS NOT NULL) AS contacted,
      (
        SELECT count(*) FROM in_range r
        WHERE r.status IN ('QUOTED', 'ISSUED')
          OR EXISTS (
            SELECT 1 FROM "LeadStatusChange" sc
            WHERE sc."leadId" = r.id AND sc."toStatus" IN ('QUOTED', 'ISSUED')
          )
      ) AS quoted,
      (
        SELECT count(*) FROM in_range r
        WHERE r.status = 'ISSUED'
          OR EXISTS (
            SELECT 1 FROM "LeadStatusChange" sc
            WHERE sc."leadId" = r.id AND sc."toStatus" = 'ISSUED'
          )
      ) AS issued,
      (
        SELECT avg(EXTRACT(EPOCH FROM ("firstContactedAt" - "createdAt")) * 1000)
        FROM in_range
        WHERE "firstContactedAt" IS NOT NULL
      ) AS average_ms,
      (
        SELECT percentile_cont(0.5) WITHIN GROUP (
          ORDER BY EXTRACT(EPOCH FROM ("firstContactedAt" - "createdAt")) * 1000
        )
        FROM in_range
        WHERE "firstContactedAt" IS NOT NULL
      ) AS median_ms
  `;

  return rows[0] ?? null;
}

function toMs(value: string | null): number | null {
  if (value === null) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortDesc(rows: StatsDistribution[]): StatsDistribution[] {
  return [...rows].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

/** Resumen completo del panel para un rango, en hora de Argentina. */
export async function getStatsOverview(range: StatsRange): Promise<StatsOverview> {
  await requireAdmin();

  const { from, to } = argentinaRangeToUtc(range);
  const where = { createdAt: { gte: from, lt: to } };

  const [
    overTime,
    funnelRow,
    vehicleTypeRows,
    brandRows,
    usageRows,
    postalCodeRows,
    attributionRows,
  ] = await Promise.all([
    leadsOverTime(range),
    funnelAndResponseTimes(range),
    db.lead.groupBy({ by: ["vehicleType"], where, _count: { _all: true } }),
    db.lead.groupBy({ by: ["brandName"], where, _count: { _all: true } }),
    db.lead.groupBy({ by: ["usage"], where, _count: { _all: true } }),
    db.lead.groupBy({ by: ["postalCode"], where, _count: { _all: true } }),
    db.lead.findMany({
      where,
      select: {
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        gclid: true,
        landingPage: true,
        referrer: true,
      },
    }),
  ]);

  const funnel: FunnelCounts = {
    sent: Number(funnelRow?.sent ?? 0),
    whatsapp: Number(funnelRow?.whatsapp ?? 0),
    contacted: Number(funnelRow?.contacted ?? 0),
    quoted: Number(funnelRow?.quoted ?? 0),
    issued: Number(funnelRow?.issued ?? 0),
  };

  const sourceCounts = new Map<AttributionSource, number>();
  for (const row of attributionRows) {
    const source = classifySource({
      utmSource: row.utmSource ?? undefined,
      utmMedium: row.utmMedium ?? undefined,
      utmCampaign: row.utmCampaign ?? undefined,
      utmTerm: row.utmTerm ?? undefined,
      utmContent: row.utmContent ?? undefined,
      gclid: row.gclid ?? undefined,
      landingPage: row.landingPage ?? undefined,
      referrer: row.referrer ?? undefined,
    });
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }

  return {
    range,
    total: funnel.sent,
    contactRate: ratio(funnel.contacted, funnel.sent),
    medianResponseMs: toMs(funnelRow?.median_ms ?? null),
    averageResponseMs: toMs(funnelRow?.average_ms ?? null),
    funnel,
    overTime,
    byVehicleType: sortDesc(
      vehicleTypeRows.map((row) => ({
        label: VEHICLE_TYPE_LABELS[row.vehicleType],
        count: row._count._all,
      })),
    ),
    byBrand: topNWithOther(
      brandRows.map((row) => ({ label: row.brandName, count: row._count._all })),
      10,
    ),
    byUsage: sortDesc(
      usageRows.map((row) => ({ label: USAGE_LABELS[row.usage], count: row._count._all })),
    ),
    byPostalCode: topNWithOther(
      postalCodeRows.map((row) => ({ label: row.postalCode, count: row._count._all })),
      10,
    ),
    bySource: SOURCE_ORDER.map((label) => ({ label, count: sourceCounts.get(label) ?? 0 })),
  };
}
