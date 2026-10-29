import { describe, expect, it } from "vitest";

import {
  average,
  buildFunnel,
  formatBucketLabel,
  formatDurationMs,
  formatRate,
  median,
  ratio,
  topNWithOther,
} from "./calculations";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe("median", () => {
  it("devuelve null sin datos", () => {
    expect(median([])).toBeNull();
  });

  it("toma el valor del medio con cantidad impar", () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  it("promedia los dos del medio con cantidad par", () => {
    expect(median([1, 2, 3, 10])).toBe(2.5);
  });
});

describe("average", () => {
  it("devuelve null sin datos", () => {
    expect(average([])).toBeNull();
  });

  it("promedia los valores", () => {
    expect(average([2, 4, 6])).toBe(4);
  });
});

describe("ratio", () => {
  it("devuelve null cuando el total es cero", () => {
    expect(ratio(0, 0)).toBeNull();
    expect(ratio(3, 0)).toBeNull();
  });

  it("calcula la proporción", () => {
    expect(ratio(1, 4)).toBe(0.25);
    expect(ratio(4, 4)).toBe(1);
  });
});

describe("formatRate", () => {
  it("muestra el porcentaje con coma decimal", () => {
    expect(formatRate(0.625)).toBe("62,5 %");
    expect(formatRate(1)).toBe("100 %");
    expect(formatRate(0)).toBe("0 %");
  });

  it("muestra una raya cuando no hay tasa", () => {
    expect(formatRate(null)).toBe("—");
  });
});

describe("formatDurationMs", () => {
  it("muestra horas y minutos", () => {
    expect(formatDurationMs(3 * HOUR + 12 * MINUTE)).toBe("3 h 12 min");
    expect(formatDurationMs(2 * HOUR)).toBe("2 h");
  });

  it("muestra solo minutos cuando no llega a la hora", () => {
    expect(formatDurationMs(45 * MINUTE)).toBe("45 min");
    expect(formatDurationMs(20_000)).toBe("0 min");
  });

  it("muestra una raya cuando no hay dato", () => {
    expect(formatDurationMs(null)).toBe("—");
  });
});

describe("buildFunnel", () => {
  it("arma los cinco pasos con su proporción sobre los enviados", () => {
    const funnel = buildFunnel({
      sent: 100,
      whatsapp: 80,
      contacted: 50,
      quoted: 20,
      issued: 5,
    });

    expect(funnel.map((step) => step.label)).toEqual([
      "Enviados",
      "Derivados a WhatsApp",
      "Contactados",
      "Cotizados",
      "Emitidos",
    ]);
    expect(funnel.map((step) => step.count)).toEqual([100, 80, 50, 20, 5]);
    expect(funnel.at(0)?.shareOfSent).toBe(1);
    expect(funnel.at(2)?.shareOfSent).toBe(0.5);
    expect(funnel.at(4)?.shareOfSent).toBe(0.05);
  });

  it("calcula la conversión contra el paso anterior", () => {
    const funnel = buildFunnel({ sent: 100, whatsapp: 80, contacted: 40, quoted: 20, issued: 10 });

    expect(funnel.at(0)?.conversionFromPrevious).toBeNull();
    expect(funnel.at(1)?.conversionFromPrevious).toBe(0.8);
    expect(funnel.at(2)?.conversionFromPrevious).toBe(0.5);
    expect(funnel.at(4)?.conversionFromPrevious).toBe(0.5);
  });

  it("no divide por cero cuando no hay enviados", () => {
    const funnel = buildFunnel({ sent: 0, whatsapp: 0, contacted: 0, quoted: 0, issued: 0 });

    expect(funnel.every((step) => step.shareOfSent === null)).toBe(true);
    expect(funnel.every((step) => step.conversionFromPrevious === null)).toBe(true);
  });
});

describe("formatBucketLabel", () => {
  it("muestra día y mes para buckets diarios", () => {
    expect(formatBucketLabel("2026-10-05", "day")).toBe("05/10");
  });

  it("muestra la semana para buckets semanales", () => {
    expect(formatBucketLabel("2026-10-05", "week")).toBe("Sem. 05/10");
  });

  it("muestra mes y año para buckets mensuales", () => {
    expect(formatBucketLabel("2026-10-01", "month")).toBe("10/2026");
  });
});

describe("topNWithOther", () => {
  it("ordena de mayor a menor y deja el resto en Otras", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({
      label: `Marca ${index + 1}`,
      count: 12 - index,
    }));

    const result = topNWithOther(rows, 10);

    expect(result).toHaveLength(11);
    expect(result[0]).toEqual({ label: "Marca 1", count: 12 });
    expect(result[9]).toEqual({ label: "Marca 10", count: 3 });
    expect(result[10]).toEqual({ label: "Otras", count: 2 + 1 });
  });

  it("no agrega Otras cuando no sobran filas", () => {
    const rows = [
      { label: "Toyota", count: 2 },
      { label: "Ford", count: 5 },
    ];

    expect(topNWithOther(rows, 10)).toEqual([
      { label: "Ford", count: 5 },
      { label: "Toyota", count: 2 },
    ]);
  });

  it("no muta la lista original", () => {
    const rows = [
      { label: "A", count: 1 },
      { label: "B", count: 9 },
    ];
    topNWithOther(rows, 1);

    expect(rows.at(0)?.label).toBe("A");
  });
});
