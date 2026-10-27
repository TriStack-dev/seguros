import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/components/public/quote-form-section", () => ({
  QuoteFormSection: ({ initialVehicleType }: { initialVehicleType: string }) => (
    <div data-vehicle={initialVehicleType} />
  ),
}));
import QuotePage from "./page";

describe("quote routes", () => {
  it.each([
    ["auto", "AUTO"],
    ["moto", "MOTO"],
  ])("preselects %s", async (tipo, expected) => {
    const html = renderToStaticMarkup(
      await QuotePage({ params: Promise.resolve({ tipo: tipo! }) }),
    );
    expect(html).toContain(`data-vehicle="${expected}"`);
    expect(html).toContain('id="cotizar"');
  });
  it.each(["camion", "AUTO", "invalid"])("rejects unsupported route %s", async (tipo) => {
    await expect(QuotePage({ params: Promise.resolve({ tipo }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
