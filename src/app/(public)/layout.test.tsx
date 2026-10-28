import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import PublicLayout from "./layout";
import AdminLayout from "../admin/layout";
vi.mock("@next/third-parties/google", () => ({
  GoogleTagManager: ({ gtmId }: { gtmId: string }) => <script data-testid="gtm" data-id={gtmId} />,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
it("does not load GTM without configuration", () => {
  vi.stubEnv("NEXT_PUBLIC_GTM_ID", "");
  render(<PublicLayout>Public</PublicLayout>);
  expect(screen.queryByTestId("gtm")).toBeNull();
});

it("emits valid InsuranceAgency JSON-LD in the public layout", () => {
  const html = renderToStaticMarkup(<PublicLayout>Public</PublicLayout>);
  const tags = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/g) ?? [];
  const nodes = tags.map((tag) => JSON.parse(tag.replace(/<[^>]+>/g, "")));

  expect(nodes).toHaveLength(1);
  expect(nodes[0]).toMatchObject({
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: "MiSeguro",
  });
});
it("loads GTM only in public layout", () => {
  vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
  render(<PublicLayout>Public</PublicLayout>);
  expect(screen.getByTestId("gtm").getAttribute("data-id")).toBe("GTM-TEST");
  cleanup();
  render(<AdminLayout>Admin</AdminLayout>);
  expect(screen.queryByTestId("gtm")).toBeNull();
  expect(readFileSync("src/app/layout.tsx", "utf8")).not.toMatch(
    /GoogleTagManager|googletagmanager/,
  );
});

it("initializes the queue before a child form mount event, even in Strict Mode", async () => {
  vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
  delete window.dataLayer;
  const { StrictMode, useEffect } = await import("react");
  const { track } = await import("@/lib/analytics/track");
  function MountEvent() {
    useEffect(() => {
      track("form_view", { vehicle_type: "AUTO" });
    }, []);
    return null;
  }
  render(
    <StrictMode>
      <PublicLayout>
        <MountEvent />
      </PublicLayout>
    </StrictMode>,
  );
  expect(window.dataLayer).toEqual([
    { event: "form_view", vehicle_type: "AUTO" },
    { event: "form_view", vehicle_type: "AUTO" },
  ]);
  delete window.dataLayer;
});
