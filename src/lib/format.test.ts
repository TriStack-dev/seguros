import { describe, expect, it } from "vitest";
import { formatDateTimeAr } from "./format";

describe("formatDateTimeAr", () => {
  it("formats UTC dates in Argentina time", () => {
    // 2026-10-28T01:30:00Z is still 2026-10-27 22:30 in Argentina (UTC-3).
    expect(formatDateTimeAr(new Date("2026-10-28T01:30:00Z"))).toBe("27/10/2026, 22:30");
  });
});
