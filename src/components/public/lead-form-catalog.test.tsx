import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";
vi.mock("server-only", () => ({}));
vi.mock("@/server/actions/submit-lead", () => ({ submitLead: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("./turnstile-widget", async () => {
  const React = await import("react");
  return {
    TurnstileWidget: ({ onTokenChange }: { onTokenChange: (token: string | null) => void }) => {
      const delivered = React.useRef(false);
      React.useEffect(() => {
        if (delivered.current) return;
        delivered.current = true;
        onTokenChange("test-turnstile-token");
      }, [onTokenChange]);
      return null;
    },
  };
});
const brands = [
  { id: "one", name: "Fiat", vehicleType: "AUTO" as const },
  { id: "two", name: "Ford", vehicleType: "AUTO" as const },
];
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
const response = (name: string) => ({ ok: true, json: async () => [{ id: name, name }] });
it("ignores late old response after brand change and resets model", async () => {
  const user = userEvent.setup();
  let resolveOld: (v: unknown) => void = () => {};
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveOld = r;
        }),
    )
    .mockResolvedValueOnce(response("Focus"));
  vi.stubGlobal("fetch", fetch);
  render(<LeadForm brands={brands} />);
  await user.click(screen.getByRole("combobox", { name: "Marca" }));
  await user.click(screen.getByRole("option", { name: "Fiat" }));
  await user.click(screen.getByRole("combobox", { name: "Marca" }));
  await user.click(screen.getByRole("option", { name: "Ford" }));
  await waitFor(() => expect(screen.getByRole("combobox", { name: "Modelo" })).not.toBeDisabled());
  resolveOld(response("Obsolete"));
  await Promise.resolve();
  await Promise.resolve();
  await user.click(screen.getByRole("combobox", { name: "Modelo" }));
  expect(await screen.findByRole("option", { name: "Focus" })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "Obsolete" })).not.toBeInTheDocument();
  expect(fetch.mock.calls[0]?.[1]?.signal.aborted).toBe(true);
});
it("retries a failed model request and restores catalog", async () => {
  const user = userEvent.setup();
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(Error("offline"))
    .mockResolvedValueOnce(response("Punto"));
  vi.stubGlobal("fetch", fetch);
  render(<LeadForm brands={brands} />);
  await user.click(screen.getByRole("combobox", { name: "Marca" }));
  await user.click(screen.getByRole("option", { name: "Fiat" }));
  await user.click(await screen.findByRole("button", { name: "Reintentar modelos" }));
  await waitFor(() => expect(screen.getByRole("combobox", { name: "Modelo" })).not.toBeDisabled());
  await user.click(screen.getByRole("combobox", { name: "Modelo" }));
  expect(await screen.findByRole("option", { name: "Punto" })).toBeInTheDocument();
});
it("selects searched brand using keyboard", async () => {
  const user = userEvent.setup();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response("Punto")));
  render(<LeadForm brands={brands} />);
  screen.getByRole("combobox", { name: "Marca" }).focus();
  await user.keyboard("{ArrowDown}");
  await user.type(await screen.findByPlaceholderText("Buscá marca…"), "Fiat");
  await user.keyboard("{ArrowDown}{Enter}");
  await waitFor(() =>
    expect(screen.getByRole("combobox", { name: "Marca" })).toHaveTextContent("Fiat"),
  );
});
