import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/public/quote-form-section", () => ({
  QuoteFormSection: ({ compact }: { compact?: boolean }) => (
    <form aria-label="Formulario de cotización" data-compact={String(compact)} />
  ),
}));

import LandingPage from "./page";

describe("public landing structure", () => {
  it("places the compact progressive form beside the hero copy", () => {
    const html = renderToStaticMarkup(<LandingPage />);
    const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];

    expect(hero).toBeDefined();
    expect(hero).toContain('aria-label="Formulario de cotización"');
    expect(hero).toContain('data-compact="true"');
  });
});
