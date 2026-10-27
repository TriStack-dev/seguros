import { describe, expect, it } from "vitest";
import { parseAttributionCookie, serializeAttribution } from "./cookie";

describe("attribution cookie", () => {
  it("serializes and deserializes attribution", () => {
    const attr = {
      utmSource: "google",
      utmMedium: "cpc",
      landingPage: "/?utm_source=google",
      referrer: "https://google.com",
    };
    const serialized = serializeAttribution(attr);
    const parsed = parseAttributionCookie(serialized);
    expect(parsed).toEqual(attr);
  });

  it("truncates values on serialize and parse", () => {
    const longValue = "b".repeat(300);
    const attr = { utmSource: longValue };
    const serialized = serializeAttribution(attr);
    const parsed = parseAttributionCookie(serialized);
    expect(parsed?.utmSource?.length).toBe(255);
  });

  it("returns null for empty cookie", () => {
    expect(parseAttributionCookie(null)).toBe(null);
    expect(parseAttributionCookie(undefined)).toBe(null);
    expect(parseAttributionCookie("")).toBe(null);
  });

  it("returns null for invalid JSON", () => {
    expect(parseAttributionCookie("not-json")).toBe(null);
  });
});
