"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBucketLabel, formatRate } from "@/lib/stats/calculations";

export type StatsSeriesPoint = { bucket: string; count: number };
export type StatsDistributionRow = { label: string; count: number };
export type StatsFunnelRow = { label: string; count: number; share: number | null };

type StatsChartsProps = {
  groupBy: "day" | "week" | "month";
  overTime: StatsSeriesPoint[];
  byVehicleType: StatsDistributionRow[];
  byBrand: StatsDistributionRow[];
  byUsage: StatsDistributionRow[];
  byPostalCode: StatsDistributionRow[];
  bySource: StatsDistributionRow[];
  funnel: StatsFunnelRow[];
};

const AXIS_TICK = { fill: "var(--admin-muted)", fontSize: 12 };
const GRID_STROKE = "var(--admin-border)";

const leadsConfig = {
  count: { label: "Leads", color: "var(--admin-accent)" },
} satisfies ChartConfig;

const funnelConfig = {
  count: { label: "Leads", color: "var(--admin-accent)" },
} satisfies ChartConfig;

const distributionConfig = {
  count: { label: "Leads", color: "var(--admin-accent)" },
} satisfies ChartConfig;

function shortLabel(value: string, max = 22): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function ChartPanel({
  title,
  description,
  children,
  isEmpty,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  return (
    <section className="admin-stats-panel" aria-label={title}>
      <h2>{title}</h2>
      {description ? <p className="admin-stats-panel__description">{description}</p> : null}
      {isEmpty ? (
        <p className="admin-stats-empty">Sin datos en este rango.</p>
      ) : (
        <div className="admin-stats-chart">{children}</div>
      )}
    </section>
  );
}

/** Serie temporal de leads según el rango elegido. */
export function LeadsOverTimeChart({
  groupBy,
  data,
}: {
  groupBy: "day" | "week" | "month";
  data: StatsSeriesPoint[];
}) {
  const rows = data.map((point) => ({
    label: formatBucketLabel(point.bucket, groupBy),
    count: point.count,
  }));

  return (
    <ChartPanel
      title="Leads en el tiempo"
      description="Solicitudes creadas en cada período del rango."
      isEmpty={rows.length === 0}
    >
      <ChartContainer config={leadsConfig}>
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeOpacity={0.35} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={32}
          />
          <ChartTooltip
            content={<ChartTooltipContent className="admin-stats-tooltip" />}
            cursor={{ stroke: GRID_STROKE }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--admin-accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartPanel>
  );
}

/** Embudo hasta la emisión: enviados, WhatsApp, contactados, cotizados y emitidos. */
export function FunnelChart({ data }: { data: StatsFunnelRow[] }) {
  return (
    <ChartPanel
      title="Embudo hasta la emisión"
      description="Cuántas solicitudes avanzaron en cada paso."
      isEmpty={data.length === 0}
    >
      <ChartContainer config={funnelConfig}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeOpacity={0.35} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={32}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="admin-stats-tooltip"
                formatValue={(value) => String(value)}
              />
            }
            cursor={{ fill: "var(--admin-surface-raised)", fillOpacity: 0.4 }}
          />
          <Bar dataKey="count" fill="var(--admin-accent)" radius={4} />
        </BarChart>
      </ChartContainer>
      <ul className="admin-stats-funnel-legend">
        {data.map((step) => (
          <li key={step.label}>
            <span>{step.label}</span>
            <span>
              {step.count} · {formatRate(step.share)}
            </span>
          </li>
        ))}
      </ul>
    </ChartPanel>
  );
}

/** Distribución de leads por una dimensión, en barras horizontales. */
export function DistributionChart({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: StatsDistributionRow[];
}) {
  return (
    <ChartPanel title={title} description={description} isEmpty={data.length === 0}>
      <ChartContainer config={distributionConfig}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeOpacity={0.35} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={(value: string) => shortLabel(value)}
          />
          <ChartTooltip
            content={<ChartTooltipContent className="admin-stats-tooltip" />}
            cursor={{ fill: "var(--admin-surface-raised)", fillOpacity: 0.4 }}
          />
          <Bar dataKey="count" fill="var(--admin-accent)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  );
}

/** Todos los gráficos del panel, en el orden del step. */
export function StatsCharts(props: StatsChartsProps) {
  return (
    <div className="admin-stats-grid">
      <LeadsOverTimeChart groupBy={props.groupBy} data={props.overTime} />
      <FunnelChart data={props.funnel} />
      <DistributionChart
        title="Por tipo de vehículo"
        description="Qué tipo de vehículo se está cotizando."
        data={props.byVehicleType}
      />
      <DistributionChart
        title="Por marca"
        description="Las 10 marcas más consultadas; el resto se agrupa en Otras."
        data={props.byBrand}
      />
      <DistributionChart
        title="Por tipo de uso"
        description="Uso declarado del vehículo."
        data={props.byUsage}
      />
      <DistributionChart
        title="Por código postal"
        description="Los 10 códigos postales con más solicitudes."
        data={props.byPostalCode}
      />
      <DistributionChart
        title="Por origen"
        description="Cómo llegó cada lead, según la atribución del formulario."
        data={props.bySource}
      />
    </div>
  );
}
