import { describe, expect, it } from "vitest";
import { classifySource } from "./classify-source";
import type { Attribution } from "./types";

describe("classifySource", () => {
  it("returns Campaña when gclid is present", () => {
    const attr: Attribution = { gclid: "abc123", landingPage: "/" };
    expect(classifySource(attr)).toBe("Campaña");
  });

  it("returns Campaña when utm_medium is cpc", () => {
    const attr: Attribution = { utmMedium: "cpc", landingPage: "/" };
    expect(classifySource(attr)).toBe("Campaña");
  });

  it("returns Campaña when utm_medium is ppc", () => {
    const attr: Attribution = { utmMedium: "ppc", landingPage: "/" };
    expect(classifySource(attr)).toBe("Campaña");
  });

  it("returns Campaña when utm_medium is paid", () => {
    const attr: Attribution = { utmMedium: "paid", landingPage: "/" };
    expect(classifySource(attr)).toBe("Campaña");
  });

  it("returns Campaña (otra) when utm params exist with other medium", () => {
    const attr: Attribution = { utmSource: "newsletter", utmMedium: "email", landingPage: "/" };
    expect(classifySource(attr)).toBe("Campaña (otra)");
  });

  it("returns Orgánico for google referrer", () => {
    const attr: Attribution = { referrer: "https://www.google.com/search?q=test", landingPage: "/" };
    expect(classifySource(attr)).toBe("Orgánico");
  });

  it("returns Orgánico for bing referrer", () => {
    const attr: Attribution = { referrer: "https://www.bing.com/search?q=test", landingPage: "/" };
    expect(classifySource(attr)).toBe("Orgánico");
  });

  it("returns Orgánico for yahoo referrer", () => {
    const attr: Attribution = { referrer: "https://search.yahoo.com/search?p=test", landingPage: "/" };
    expect(classifySource(attr)).toBe("Orgánico");
  });

  it("returns Orgánico for duckduckgo referrer", () => {
    const attr: Attribution = { referrer: "https://duckduckgo.com/?q=test", landingPage: "/" };
    expect(classifySource(attr)).toBe("Orgánico");
  });

  it("returns Referido for other external referrer", () => {
    const attr: Attribution = { referrer: "https://example.com/page", landingPage: "/" };
    expect(classifySource(attr)).toBe("Referido");
  });

  it("returns Directo when no data", () => {
    expect(classifySource(null)).toBe("Directo");
    expect(classifySource(undefined)).toBe("Directo");
    expect(classifySource({ landingPage: "/" })).toBe("Directo");
  });
});
