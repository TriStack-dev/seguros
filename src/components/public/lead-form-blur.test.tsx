import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";
vi.mock("server-only", () => ({}));
vi.mock("@/server/actions/submit-lead", () => ({ submitLead: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("shows required plate validation on initial blur before usage selected", async () => {
  const user = userEvent.setup();
  render(<LeadForm brands={[]} />);
  const plate = screen.getByLabelText("Patente", { exact: true });
  await user.click(plate);
  await user.tab();
  await waitFor(() => expect(plate).toHaveAttribute("aria-invalid", "true"));
  expect(screen.getByText("Ingresá la patente")).toBeInTheDocument();
});
it("shows invalid phone validation before usage selected", async () => {
  const user = userEvent.setup();
  render(<LeadForm brands={[]} />);
  const phone = screen.getByLabelText("Teléfono", { exact: true });
  await user.type(phone, "1");
  await user.tab();
  await waitFor(() => expect(phone).toHaveAttribute("aria-invalid", "true"));
});
