"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "cn";

/**
 * Envoltorio de gráficos de shadcn/ui sobre Recharts: aplica los colores del tema por
 * `ChartConfig` y deja el contenedor responsivo. Solo se usan las piezas que necesita el
 * panel de estadísticas.
 */

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart(): ChartContextProps {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart tiene que usarse dentro de un <ChartContainer />");
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme ?? itemConfig.color,
  );

  if (colorConfig.length === 0) return null;

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const variables = colorConfig
        .map(([key, itemConfig]) => {
          const color =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;

          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");

      return `${prefix} [data-chart="${id}"] {\n${variables}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipItem = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export type ChartTooltipContentProps = {
  active?: boolean;
  payload?: readonly ChartTooltipItem[];
  label?: React.ReactNode;
  hideLabel?: boolean;
  formatLabel?: (value: React.ReactNode) => React.ReactNode;
  formatValue?: (value: number | string) => React.ReactNode;
  className?: string;
};

/** Tooltip con la estética del panel, sin depender de los tipos internos de Recharts. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  formatLabel,
  formatValue,
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) return null;

  const labelText = formatLabel ? formatLabel(label) : label;

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {hideLabel || labelText === undefined || labelText === null ? null : (
        <p className="font-medium">{labelText}</p>
      )}
      <ul className="grid gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const name = config[key]?.label ?? item.name ?? key;
          const value = item.value ?? 0;

          return (
            <li key={key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color ?? "currentColor" }}
                />
                {name}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {formatValue ? formatValue(value) : value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
