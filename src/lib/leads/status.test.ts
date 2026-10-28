import { describe, expect, it } from "vitest";
import {
  LEAD_STATUS_BADGE_VARIANTS,
  LEAD_STATUS_LABELS,
  allowedTransitions,
  canTransition,
  shouldSetFirstContactedAt,
} from "./status";
import { LEAD_STATUSES } from "@/lib/constants";
import type { LeadStatus } from "@/generated/prisma/client";

// Matriz de la sección 5.1: fila = estado actual, columna = estado nuevo.
const EXPECTED: Record<LeadStatus, Record<LeadStatus, boolean>> = {
  NEW: { NEW: false, CONTACTED: true, QUOTED: true, ISSUED: true, LOST: true },
  CONTACTED: { NEW: true, CONTACTED: false, QUOTED: true, ISSUED: true, LOST: true },
  QUOTED: { NEW: false, CONTACTED: true, QUOTED: false, ISSUED: true, LOST: true },
  ISSUED: { NEW: false, CONTACTED: false, QUOTED: true, ISSUED: false, LOST: false },
  LOST: { NEW: false, CONTACTED: true, QUOTED: false, ISSUED: false, LOST: false },
};

describe("canTransition", () => {
  const cases = LEAD_STATUSES.flatMap((from) =>
    LEAD_STATUSES.map((to) => [from, to, EXPECTED[from][to]] as const),
  );

  it("covers all 25 combinations", () => {
    expect(cases).toHaveLength(25);
  });

  it.each(cases)("%s → %s is %s", (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });
});

describe("allowedTransitions", () => {
  it.each([
    ["NEW", ["CONTACTED", "QUOTED", "ISSUED", "LOST"]],
    ["CONTACTED", ["NEW", "QUOTED", "ISSUED", "LOST"]],
    ["QUOTED", ["CONTACTED", "ISSUED", "LOST"]],
    ["ISSUED", ["QUOTED"]],
    ["LOST", ["CONTACTED"]],
  ] as const)("from %s returns %j", (from, expected) => {
    expect(allowedTransitions(from)).toEqual(expected);
  });

  it("never includes the current status", () => {
    for (const status of LEAD_STATUSES) {
      expect(allowedTransitions(status)).not.toContain(status);
    }
  });
});

describe("shouldSetFirstContactedAt", () => {
  it.each(["CONTACTED", "QUOTED", "ISSUED"] as const)(
    "sets the first contact date when moving to %s",
    (to) => {
      expect(shouldSetFirstContactedAt({ firstContactedAt: null }, to)).toBe(true);
    },
  );

  it.each(["NEW", "LOST"] as const)("does not set it when moving to %s", (to) => {
    expect(shouldSetFirstContactedAt({ firstContactedAt: null }, to)).toBe(false);
  });

  it("does not overwrite an existing first contact date", () => {
    const lead = { firstContactedAt: new Date("2026-01-01T12:00:00Z") };
    for (const to of LEAD_STATUSES) {
      expect(shouldSetFirstContactedAt(lead, to)).toBe(false);
    }
  });
});

describe("status display metadata", () => {
  it("has a label and a badge variant for every status", () => {
    for (const status of LEAD_STATUSES) {
      expect(LEAD_STATUS_LABELS[status]).toBeTruthy();
      expect(LEAD_STATUS_BADGE_VARIANTS[status]).toBeTruthy();
    }
  });
});
