import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { AdminNavigation } from "./admin-navigation";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

afterEach(() => cleanup());

it("marks the current admin section and exposes the new-lead count accessibly", () => {
  usePathname.mockReturnValue("/admin/leads/lead-123");
  render(<AdminNavigation newLeadsCount={4} />);

  expect(screen.getByRole("link", { name: "Leads, 4 nuevos" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Estadísticas" })).not.toHaveAttribute("aria-current");
});
