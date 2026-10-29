import { buildStatsHref, STATS_PATH, type StatsRange } from "@/lib/stats/range";

const QUICK_RANGES = [
  { key: "7", label: "Últimos 7 días" },
  { key: "30", label: "Últimos 30 días" },
  { key: "90", label: "Últimos 90 días" },
] as const;

/**
 * Selector de rango del panel. Es un formulario GET: el rango queda en la URL, así el
 * enlace se puede compartir y recargar sin perder el estado.
 */
export function StatsRangeSelector({ range }: { range: StatsRange }) {
  return (
    <section className="admin-stats-range" aria-label="Rango de fechas">
      <div className="admin-stats-range__quick" role="group" aria-label="Rangos rápidos">
        {QUICK_RANGES.map((option) => (
          <a
            key={option.key}
            href={buildStatsHref(option.key)}
            className="admin-stats-range__link"
            aria-current={range.key === option.key ? "true" : undefined}
          >
            {option.label}
          </a>
        ))}
      </div>

      <form className="admin-stats-range__form" method="get" action={STATS_PATH}>
        <input type="hidden" name="range" value="custom" />
        <label htmlFor="stats-from">Desde</label>
        <input
          id="stats-from"
          name="from"
          type="date"
          defaultValue={range.key === "custom" ? range.fromDate : ""}
          required
        />
        <label htmlFor="stats-to">Hasta</label>
        <input
          id="stats-to"
          name="to"
          type="date"
          defaultValue={range.key === "custom" ? range.toDate : ""}
          required
        />
        <button type="submit">Aplicar</button>
      </form>

      <p className="admin-stats-range__current">Mostrando {range.label.toLowerCase()}</p>
    </section>
  );
}
