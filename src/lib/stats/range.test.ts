import { describe, expect, it } from "vitest";

import { argentinaRangeToUtc, buildStatsHref, resolveStatsRange } from "./range";

// `now` fijo: 2026-10-29 12:00 en Argentina (UTC-3).
const NOON_AR = new Date("2026-10-29T15:00:00Z");

describe("resolveStatsRange", () => {
  it("usa los últimos 30 días cuando no hay parámetros", () => {
    const range = resolveStatsRange({}, NOON_AR);

    expect(range.key).toBe("30");
    expect(range.fromDate).toBe("2026-09-30");
    expect(range.toDate).toBe("2026-10-29");
    expect(range.groupBy).toBe("day");
    expect(range.label).toBe("Últimos 30 días");
  });

  it("respeta los rangos rápidos de 7 y 90 días", () => {
    const seven = resolveStatsRange({ range: "7" }, NOON_AR);
    expect(seven.fromDate).toBe("2026-10-23");
    expect(seven.toDate).toBe("2026-10-29");
    expect(seven.groupBy).toBe("day");

    const ninety = resolveStatsRange({ range: "90" }, NOON_AR);
    expect(ninety.fromDate).toBe("2026-08-01");
    expect(ninety.toDate).toBe("2026-10-29");
    expect(ninety.groupBy).toBe("week");
  });

  it("toma el día en hora de Argentina: a las 23:30 sigue siendo el mismo día", () => {
    // 2026-10-30 02:30 UTC = 2026-10-29 23:30 en Argentina.
    const lateNight = new Date("2026-10-30T02:30:00Z");
    const range = resolveStatsRange({ range: "7" }, lateNight);

    expect(range.toDate).toBe("2026-10-29");
    expect(range.fromDate).toBe("2026-10-23");
  });

  it("acepta un rango personalizado válido", () => {
    const range = resolveStatsRange({ range: "custom", from: "2026-01-01", to: "2026-01-31" }, NOON_AR);

    expect(range.key).toBe("custom");
    expect(range.fromDate).toBe("2026-01-01");
    expect(range.toDate).toBe("2026-01-31");
    expect(range.groupBy).toBe("day");
    expect(range.label).toBe("01/01/2026 a 31/01/2026");
  });

  it("invierte un rango personalizado con las fechas al revés", () => {
    const range = resolveStatsRange({ range: "custom", from: "2026-03-31", to: "2026-01-01" }, NOON_AR);

    expect(range.fromDate).toBe("2026-01-01");
    expect(range.toDate).toBe("2026-03-31");
  });

  it("vuelve al rango por defecto si el personalizado es inválido", () => {
    expect(resolveStatsRange({ range: "custom", from: "2026-02-31", to: "2026-01-01" }, NOON_AR).key).toBe(
      "30",
    );
    expect(resolveStatsRange({ range: "custom", from: "ayer", to: "hoy" }, NOON_AR).key).toBe("30");
    expect(resolveStatsRange({ range: "custom" }, NOON_AR).key).toBe("30");
    expect(resolveStatsRange({ range: "999" }, NOON_AR).key).toBe("30");
  });

  it("agrupa por mes cuando el rango pasa los 120 días", () => {
    const range = resolveStatsRange({ range: "custom", from: "2025-01-01", to: "2026-02-04" }, NOON_AR);

    expect(range.groupBy).toBe("month");
  });

  it("arma links al panel conservando el rango", () => {
    expect(buildStatsHref("7")).toBe("/admin/estadisticas?range=7");
    expect(buildStatsHref("custom", { from: "2026-01-01", to: "2026-01-31" })).toBe(
      "/admin/estadisticas?range=custom&from=2026-01-01&to=2026-01-31",
    );
  });
});

describe("argentinaRangeToUtc", () => {
  it("convierte el rango al calendario de Argentina con el fin exclusivo", () => {
    const { from, to } = argentinaRangeToUtc({ fromDate: "2026-09-30", toDate: "2026-10-29" });

    expect(from.toISOString()).toBe("2026-09-30T03:00:00.000Z");
    expect(to.toISOString()).toBe("2026-10-30T03:00:00.000Z");
  });
});
