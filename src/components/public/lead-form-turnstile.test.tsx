import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";

const state = vi.hoisted(() => ({
  submitLead: vi.fn(),
  onTokenChange: null as ((token: string | null) => void) | null,
  resetKey: 0,
}));

vi.mock("server-only", () => ({}));
vi.mock("@/server/actions/submit-lead", () => ({ submitLead: state.submitLead }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("./turnstile-widget", async () => {
  const React = await import("react");
  return {
    TurnstileWidget: ({
      onTokenChange,
      resetKey,
    }: {
      onTokenChange: (token: string | null) => void;
      resetKey: number;
    }) => {
      const initialResetKey = React.useRef(resetKey);
      state.onTokenChange = onTokenChange;
      state.resetKey = resetKey;
      React.useEffect(() => {
        if (initialResetKey.current === resetKey) return;
        initialResetKey.current = resetKey;
        onTokenChange(null);
      }, [onTokenChange, resetKey]);
      return (
        <button type="button" onClick={() => onTokenChange("test-turnstile-token")}>
          Completar verificación de prueba
        </button>
      );
    },
  };
});

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
  state.submitLead.mockReset();
  state.onTokenChange = null;
  state.resetKey = 0;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function fillValidLead(user: ReturnType<typeof userEvent.setup>) {
  for (const [label, value] of Object.entries({
    "Nombre y apellido": "Ana Pérez",
    Teléfono: "3414123456",
    Email: "ana@example.com",
    Patente: "AA123BB",
    "Año del vehículo": "2020",
    "Código postal": "2000",
    DNI: "12345678",
  })) {
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  }
  await user.click(screen.getByRole("combobox", { name: "Marca" }));
  await user.click(screen.getByRole("option", { name: "Otro" }));
  await user.type(screen.getByLabelText("Otra marca", { exact: true }), "Marca");
  await user.type(screen.getByLabelText("Modelo", { exact: true }), "Modelo");
  await user.selectOptions(screen.getByLabelText("Tipo de uso", { exact: true }), "PARTICULAR");
  await user.click(screen.getByRole("checkbox", { name: /Acepto la política/ }));
}

it("requires an explicitly solved challenge and sends its one-time token separately", async () => {
  const user = userEvent.setup();
  state.submitLead.mockResolvedValue({ ok: false, message: "Revisá los datos ingresados." });
  render(<LeadForm brands={[]} />);
  await fillValidLead(user);

  await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  expect(
    await screen.findByText("Completá la verificación de seguridad antes de enviar."),
  ).toBeInTheDocument();
  expect(state.submitLead).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Completar verificación de prueba" }));
  await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  await waitFor(() => expect(state.submitLead).toHaveBeenCalledOnce());
  expect(state.submitLead.mock.calls[0]?.[1]).toBe("test-turnstile-token");
  await waitFor(() => expect(state.resetKey).toBe(1));

  await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  expect(
    await screen.findByText("Completá la verificación de seguridad antes de enviar."),
  ).toBeInTheDocument();
  expect(state.submitLead).toHaveBeenCalledOnce();
});
