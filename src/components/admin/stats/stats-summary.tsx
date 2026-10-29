import { formatDurationMs, formatRate } from "@/lib/stats/calculations";
import type { StatsOverview } from "@/server/queries/stats";

/** Tarjetas de resumen del rango elegido. */
export function StatsSummary({ stats }: { stats: StatsOverview }) {
  return (
    <dl className="admin-stats-summary">
      <div className="admin-stats-card">
        <dt>Total de leads</dt>
        <dd>{stats.total}</dd>
      </div>

      <div className="admin-stats-card">
        <dt>Tasa de contacto</dt>
        <dd>
          {formatRate(stats.contactRate)}
          <span className="admin-stats-card__hint">
            {stats.funnel.contacted} de {stats.total} contactados
          </span>
        </dd>
      </div>

      <div className="admin-stats-card">
        <dt>Tiempo mediano de primera respuesta</dt>
        <dd>
          {formatDurationMs(stats.medianResponseMs)}
          <span className="admin-stats-card__hint">
            Promedio: {formatDurationMs(stats.averageResponseMs)}
          </span>
        </dd>
      </div>

      <div className="admin-stats-card">
        <dt>Emitidos</dt>
        <dd>
          {stats.funnel.issued}
          <span className="admin-stats-card__hint">Cotizados: {stats.funnel.quoted}</span>
        </dd>
      </div>
    </dl>
  );
}
