import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";
const { submitLead } = vi.hoisted(() => ({ submitLead: vi.fn() }));
vi.mock("@/server/actions/submit-lead", () => ({ submitLead }));
vi.mock("server-only", () => ({}));
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
for (const type of ["AUTO", "MOTO"] as const) {
  it(`submits ${type} through the server action only after consent`, async () => {
    const u = userEvent.setup();
    let resolveSubmit!: (result: {
      ok: true;
      leadId: string;
      requestNumber: string;
      whatsappUrl: string;
    }) => void;
    submitLead.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    render(<LeadForm brands={[]} initialVehicleType={type} />);
    for (const [label, val] of Object.entries({
      "Nombre y apellido": "Ana Pérez",
      Teléfono: "+54 9 341 4123456",
      Email: "ANA@EXAMPLE.COM",
      Patente: type === "AUTO" ? "AA123BB" : "A123BCD",
      "Año del vehículo": "2020",
      "Código postal": "s2000abc",
      DNI: "12.345.678",
    })) {
      await u.type(screen.getByLabelText(label, { exact: true }), val);
    }
    await u.click(screen.getByRole("combobox", { name: "Marca" }));
    await u.click(screen.getByRole("option", { name: "Otro" }));
    await u.type(screen.getByLabelText("Otra marca", { exact: true }), "Marca");
    await u.type(screen.getByLabelText("Modelo", { exact: true }), "Modelo");
    await u.selectOptions(
      screen.getByLabelText("Tipo de uso", { exact: true }),
      type === "AUTO" ? "RIDE_HAILING" : "DELIVERY",
    );
    await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: /Acepto la política/ })).toHaveFocus(),
    );
    expect(submitLead).not.toHaveBeenCalled();
    await u.click(screen.getByRole("checkbox", { name: /Acepto la política/ }));
    await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
    await waitFor(() => expect(submitLead).toHaveBeenCalledOnce());
    const submitButton = screen.getByRole("button", { name: "Validando…" });
    expect(submitButton).toBeDisabled();
    await u.click(submitButton);
    fireEvent.submit(screen.getByRole("form", { name: "Formulario de cotización" }));
    expect(submitLead).toHaveBeenCalledOnce();
    expect(submitLead.mock.calls[0]?.[0]).toMatchObject({
      vehicleType: type,
      phone: "5493414123456",
      hasGnc: null,
      email: "ana@example.com",
      dni: "12345678",
      postalCode: "S2000ABC",
    });
    expect(submitLead.mock.calls[0]?.[1]).toBe("test-turnstile-token");
    resolveSubmit({
      ok: true,
      leadId: "lead-id",
      requestNumber: "MS-000123",
      whatsappUrl: "https://wa.me/5493794057190",
    });
    expect(
      await screen.findByRole("heading", { name: "¡Listo! Recibimos tu solicitud" }),
    ).toBeInTheDocument();
    expect(screen.getByText("MS-000123")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "Cargar otra cotización" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Nombre y apellido", { exact: true })).toHaveFocus(),
    );
    expect(screen.getByLabelText("Nombre y apellido", { exact: true })).toHaveValue("");
  });
}

it("shows server field errors and does not log submitted data", async () => {
  const u = userEvent.setup();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  submitLead.mockResolvedValue({
    ok: false,
    fieldErrors: { email: ["Email no válido desde el servidor"] },
    message: "Revisá los datos ingresados.",
  });
  render(<LeadForm brands={[]} />);
  await u.type(screen.getByLabelText("Nombre y apellido", { exact: true }), "Ana Pérez");
  await u.type(screen.getByLabelText("Email", { exact: true }), "ana@example.com");
  await u.click(screen.getByRole("combobox", { name: "Marca" }));
  await u.click(screen.getByRole("option", { name: "Otro" }));
  await u.type(screen.getByLabelText("Otra marca", { exact: true }), "Marca");
  await u.type(screen.getByLabelText("Modelo", { exact: true }), "Modelo");
  await u.type(screen.getByLabelText("Teléfono", { exact: true }), "3414123456");
  await u.type(screen.getByLabelText("Patente", { exact: true }), "AA123BB");
  await u.type(screen.getByLabelText("Año del vehículo", { exact: true }), "2020");
  await u.type(screen.getByLabelText("Código postal", { exact: true }), "2000");
  await u.selectOptions(screen.getByLabelText("Tipo de uso", { exact: true }), "PARTICULAR");
  await u.type(screen.getByLabelText("DNI", { exact: true }), "12345678");
  await u.click(screen.getByRole("checkbox", { name: /Acepto la política/ }));
  await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  expect(await screen.findByText("Email no válido desde el servidor")).toBeInTheDocument();
  expect(log).not.toHaveBeenCalled();
});
it("invalid phone comes before plate and DNI focus", async () => {
  const u = userEvent.setup();
  render(<LeadForm brands={[]} />);
  await u.type(screen.getByLabelText("Nombre y apellido", { exact: true }), "Ana Pérez");
  await u.type(screen.getByLabelText("Teléfono", { exact: true }), "123");
  await u.type(screen.getByLabelText("Email", { exact: true }), "ana@example.com");
  await u.type(screen.getByLabelText("Patente", { exact: true }), "bad");
  await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  await waitFor(() => expect(screen.getByLabelText("Teléfono", { exact: true })).toHaveFocus());
  await u.clear(screen.getByLabelText("Teléfono", { exact: true }));
  await u.type(screen.getByLabelText("Teléfono", { exact: true }), "3414123456");
  await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  await waitFor(() => expect(screen.getByLabelText("Patente", { exact: true })).toHaveFocus());
});
