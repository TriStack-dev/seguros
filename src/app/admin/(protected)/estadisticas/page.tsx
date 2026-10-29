import type { Metadata } from "next";

import { StatsCharts } from "@/components/admin/stats/stats-charts";
import { StatsRangeSelector } from "@/components/admin/stats/stats-range-selector";
import { StatsSummary } from "@/components/admin/stats/stats-summary";
import { buildFunnel } from "@/lib/stats/calculations";
import { resolveStatsRange } from "@/lib/stats/range";
import { getStatsOverview } from "@/server/queries/stats";

export const metadata: Metadata = { title: "Estadísticas" };
export const dynamic = "force-dynamic";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveStatsRange(params);
  const stats = await getStatsOverview(range);

  return (
    <>
      <header className="admin-page-heading">
        <div>
          <h1>Estadísticas</h1>
          <p>Evolución de las solicitudes en el rango elegido.</p>
        </div>
      </header>

      <StatsRangeSelector range={range} />

      {stats.total === 0 ? (
        <div className="admin-leads-empty" role="status">
          <strong>No hay leads en este rango.</strong>
          <p>Probá con un rango más amplio o esperá nuevas solicitudes.</p>
        </div>
      ) : (
        <>
          <StatsSummary stats={stats} />
          <StatsCharts
            groupBy={range.groupBy}
            overTime={stats.overTime}
            byVehicleType={stats.byVehicleType}
            byBrand={stats.byBrand}
            byUsage={stats.byUsage}
            byPostalCode={stats.byPostalCode}
            bySource={stats.bySource}
            funnel={buildFunnel(stats.funnel).map((step) => ({
              label: step.label,
              count: step.count,
              share: step.shareOfSent,
            }))}
          />
        </>
      )}

      <p className="admin-stats-notice">
        Formularios vistos, iniciados y abandonos: ver GA4.
      </p>
    </>
  );
}
