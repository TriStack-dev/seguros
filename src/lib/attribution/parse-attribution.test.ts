import { describe, expect, it } from "vitest";
import { hasAttributionParams, parseAttributionFromUrl } from "./parse-attribution";

describe("parseAttributionFromUrl", () => {
  it("extracts utm params and gclid", () => {
    const url = new URL("https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=prueba&utm_term=seguro&utm_content=ad1&gclid=abc");
    const attr = parseAttributionFromUrl(url, "https://google.com/search?q=test");
    expect(attr.utmSource).toBe("google");
    expect(attr.utmMedium).toBe("cpc");
    expect(attr.utmCampaign).toBe("prueba");
    expect(attr.utmTerm).toBe("seguro");
    expect(attr.utmContent).toBe("ad1");
    expect(attr.gclid).toBe("abc");
    expect(attr.landingPage).toBe("/?utm_source=google&utm_medium=cpc&utm_campaign=prueba&utm_term=seguro&utm_content=ad1&gclid=abc");
  });

  it("truncates values longer than 255 chars", () => {
    const longValue = "a".repeat(300);
    const url = new URL(`https://example.com/?utm_source=${longValue}`);
    const attr = parseAttributionFromUrl(url);
    expect(attr.utmSource?.length).toBe(255);
  });

  it("only keeps external referrer when has params", () => {
    const url = new URL("https://example.com/?utm_source=google");
    const attr = parseAttributionFromUrl(url, "https://external.com/page");
    expect(attr.referrer).toBe("https://external.com/page");
  });

  it("does not keep same-host referrer", () => {
    const url = new URL("https://example.com/?utm_source=google");
    const attr = parseAttributionFromUrl(url, "https://example.com/other");
    expect(attr.referrer).toBeUndefined();
  });

  it("hasAttributionParams returns true for utm or gclid", () => {
    expect(hasAttributionParams(new URL("https://example.com/?utm_source=test"))).toBe(true);
    expect(hasAttributionParams(new URL("https://example.com/?gclid=abc"))).toBe(true);
    expect(hasAttributionParams(new URL("https://example.com/"))).toBe(false);
  });
});
