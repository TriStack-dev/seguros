import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const { useSearchParams } = vi.hoisted(() => ({ useSearchParams: vi.fn() }));

vi.mock("next/navigation", () => ({ useSearchParams }));

import { LeadsExportButton } from "./leads-export-button";

function hrefFor(query: string) {
  useSearchParams.mockReturnValue(new URLSearchParams(query));
  render(<LeadsExportButton />);
  const href = screen.getByRole("link", { name: "Exportar CSV" }).getAttribute("href");
  cleanup();
  return href;
}

describe("LeadsExportButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exporta sin filtros cuando el listado no tiene ninguno", () => {
    expect(hrefFor("")).toBe("/api/admin/leads/export");
  });

  it("conserva los filtros aplicados en el listado", () => {
    expect(hrefFor("status=LOST&vehicleType=MOTO&search=Ana")).toBe(
      "/api/admin/leads/export?status=LOST&vehicleType=MOTO&search=Ana",
    );
  });

  it("no arrastra la página actual", () => {
    expect(hrefFor("status=NEW&page=3")).toBe("/api/admin/leads/export?status=NEW");
  });
});
