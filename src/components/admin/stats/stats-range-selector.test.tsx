import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it } from "vitest";
import { resolveStatsRange } from "@/lib/stats/range";
import { StatsRangeSelector } from "./stats-range-selector";

afterEach(() => cleanup());

const NOW = new Date("2026-10-29T15:00:00Z");

it("marca el rango activo y enlaza los rangos rápidos", () => {
  render(<StatsRangeSelector range={resolveStatsRange({ range: "7" }, NOW)} />);

  expect(screen.getByRole("link", { name: "Últimos 7 días" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  expect(screen.getByRole("link", { name: "Últimos 30 días" })).not.toHaveAttribute("aria-current");
  expect(screen.getByRole("link", { name: "Últimos 90 días" })).toHaveAttribute(
    "href",
    "/admin/estadisticas?range=90",
  );
});

it("precarga las fechas cuando el rango es personalizado", () => {
  const range = resolveStatsRange(
    { range: "custom", from: "2026-09-01", to: "2026-09-15" },
    NOW,
  );
  render(<StatsRangeSelector range={range} />);

  expect(screen.getByLabelText("Desde")).toHaveValue("2026-09-01");
  expect(screen.getByLabelText("Hasta")).toHaveValue("2026-09-15");
});

it("deja las fechas vacías en los rangos rápidos", () => {
  render(<StatsRangeSelector range={resolveStatsRange({}, NOW)} />);

  expect(screen.getByLabelText("Desde")).toHaveValue("");
  expect(screen.getByLabelText("Hasta")).toHaveValue("");
});
