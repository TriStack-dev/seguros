import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import type { StatsOverview } from "@/server/queries/stats";
import StatsPage from "./page";

const { getStatsOverview } = vi.hoisted(() => ({ getStatsOverview: vi.fn() }));

vi.mock("@/server/queries/stats", () => ({ getStatsOverview }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function buildStats(overrides: Partial<StatsOverview> = {}): StatsOverview {
  return {
    range: {
      key: "7",
      fromDate: "2026-10-23",
      toDate: "2026-10-29",
      label: "Últimos 7 días",
      groupBy: "day",
    },
    total: 5,
    contactRate: 0.6,
    medianResponseMs: 3_600_000,
    averageResponseMs: 7_200_000,
    funnel: { sent: 5, whatsapp: 1, contacted: 3, quoted: 2, issued: 1 },
    overTime: [{ bucket: "2026-10-27", count: 5 }],
    byVehicleType: [{ label: "Auto", count: 5 }],
    byBrand: [{ label: "Fiat", count: 5 }],
    byUsage: [{ label: "Particular", count: 5 }],
    byPostalCode: [{ label: "2000", count: 5 }],
    bySource: [{ label: "Orgánico", count: 5 }],
    ...overrides,
  };
}

it("muestra el resumen y los gráficos cuando hay leads en el rango", async () => {
  getStatsOverview.mockResolvedValue(buildStats());

  render(await StatsPage({ searchParams: Promise.resolve({ range: "7" }) }));

  expect(screen.getByRole("heading", { name: "Estadísticas" })).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("60 %")).toBeInTheDocument();
  expect(screen.getByText("1 h")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Leads en el tiempo" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Embudo hasta la emisión" })).toBeInTheDocument();
  expect(screen.getByText(/ver GA4/)).toBeInTheDocument();
});

it("muestra el estado vacío cuando el rango no tiene leads", async () => {
  getStatsOverview.mockResolvedValue(
    buildStats({
      total: 0,
      contactRate: null,
      medianResponseMs: null,
      averageResponseMs: null,
      funnel: { sent: 0, whatsapp: 0, contacted: 0, quoted: 0, issued: 0 },
      overTime: [],
      byVehicleType: [],
      byBrand: [],
      byUsage: [],
      byPostalCode: [],
      bySource: [],
    }),
  );

  render(await StatsPage({ searchParams: Promise.resolve({ range: "7" }) }));

  expect(screen.getByText("No hay leads en este rango.")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Leads en el tiempo" })).not.toBeInTheDocument();
});
