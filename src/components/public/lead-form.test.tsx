import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";
const { submitLead } = vi.hoisted(() => ({ submitLead: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/server/actions/submit-lead", () => ({ submitLead }));
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
  { id: "auto-brand", name: "Fiat", vehicleType: "AUTO" as const },
  { id: "moto-brand", name: "Honda", vehicleType: "MOTO" as const },
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

describe("LeadForm", () => {
  it("preselects moto and exposes only moto usage and mobile input attributes", () => {
    render(<LeadForm brands={brands} initialVehicleType="MOTO" />);
    expect(screen.getByRole("button", { name: "Moto" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByLabelText("¿Tiene GNC?", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Delivery / mensajería" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Uber/ })).not.toBeInTheDocument();
    for (const label of ["DNI", "Año del vehículo"])
      expect(screen.getByLabelText(label, { exact: true })).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("Email", { exact: true })).toHaveAttribute("type", "email");
  });
  it("validates on blur, associates errors and focuses the first error on submit", async () => {
    const user = userEvent.setup();
    render(<LeadForm brands={brands} />);
    const name = screen.getByLabelText("Nombre y apellido", { exact: true });
    await user.click(name);
    await user.type(name, "A");
    await user.tab();
    expect(await screen.findByText(/Ingresá nombre y apellido válidos/)).toBeInTheDocument();
    expect(name).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
    await waitFor(() => expect(name).toHaveFocus());
  });
  it("shows only the requested fields in order and preserves type and consent", () => {
    const { container } = render(<LeadForm brands={brands} />);
    const labels = [...container.querySelectorAll("label[for]")].map((label) => label.textContent);
    expect(labels.slice(0, 12)).toEqual([
      "Nombre y apellido",
      "Teléfono",
      "Email",
      "Es 0 km",
      "Patente",
      "Marca",
      "Modelo",
      "Año del vehículo",
      "¿Tiene GNC?",
      "Código postal",
      "Tipo de uso",
      "DNI",
    ]);
    expect(screen.getByRole("checkbox", { name: "Es 0 km" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Versión (opcional)")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono", { exact: true })).toHaveAttribute("type", "tel");
    expect(screen.getByRole("checkbox", { name: /Acepto la política/ })).toBeInTheDocument();
  });
  it("resets vehicle-dependent values", async () => {
    const user = userEvent.setup();
    render(<LeadForm brands={brands} />);
    await user.type(screen.getByLabelText("Patente", { exact: true }), "AA123BB");
    await user.selectOptions(screen.getByLabelText("Tipo de uso", { exact: true }), "RIDE_HAILING");
    await user.click(screen.getByRole("button", { name: "Moto" }));
    expect(screen.getByLabelText("Tipo de uso", { exact: true })).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Auto" }));
    expect(screen.getByLabelText("¿Tiene GNC?", { exact: true })).toBeInTheDocument();
  });
  it("submits validated data through the server action", async () => {
    const user = userEvent.setup();
    submitLead.mockResolvedValue({
      ok: true,
      leadId: "lead-id",
      requestNumber: "MS-000123",
      whatsappUrl: "https://wa.me/5493794057190",
    });
    render(<LeadForm brands={[]} initialVehicleType="MOTO" />);
    for (const [label, value] of Object.entries({
      "Nombre y apellido": "Ana Pérez",
      Teléfono: "3414123456",
      Patente: "A123BCD",
      Email: "ANA@EXAMPLE.COM",
      DNI: "12.345.678",
      "Año del vehículo": "2020",
      "Código postal": "s2000abc",
    }))
      await user.type(screen.getByLabelText(label, { exact: true }), value);
    await user.click(screen.getByRole("combobox", { name: "Marca" }));
    await user.click(screen.getByRole("option", { name: "Otro" }));
    await user.type(screen.getByLabelText("Otra marca", { exact: true }), "Zanella");
    await user.type(screen.getByLabelText("Modelo", { exact: true }), "ZB 110");
    await user.selectOptions(screen.getByLabelText("Tipo de uso", { exact: true }), "DELIVERY");
    await user.click(screen.getByRole("checkbox", { name: /Acepto la política/ }));
    await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
    await waitFor(() => expect(submitLead).toHaveBeenCalledOnce());
    expect(submitLead.mock.calls[0]?.[0]).toMatchObject({
      phone: "5493414123456",
      email: "ana@example.com",
      dni: "12345678",
      postalCode: "S2000ABC",
      year: 2020,
      vehicleType: "MOTO",
      hasGnc: null,
      brandOther: "Zanella",
      modelOther: "ZB 110",
    });
    expect(submitLead.mock.calls[0]?.[1]).toBe("test-turnstile-token");
    expect(
      await screen.findByRole("heading", { name: "¡Listo! Recibimos tu solicitud" }),
    ).toHaveFocus();
    expect(screen.getByText("MS-000123")).toBeInTheDocument();
  });
});

it("keeps the plate visible and preserves its value when toggling zero km", async () => {
  const user = userEvent.setup();
  render(<LeadForm brands={[]} />);
  await user.type(screen.getByLabelText("Patente", { exact: true }), "AA123BB");
  await user.click(screen.getByRole("checkbox", { name: "Es 0 km" }));
  expect(screen.getByLabelText("Patente (opcional)", { exact: true })).toHaveValue("AA123BB");
  await user.click(screen.getByRole("checkbox", { name: "Es 0 km" }));
  expect(screen.getByLabelText("Patente", { exact: true })).toHaveValue("AA123BB");
});

it("allows an empty plate only while zero km is checked", async () => {
  const user = userEvent.setup();
  render(<LeadForm brands={[]} />);
  await user.click(screen.getByRole("checkbox", { name: "Es 0 km" }));
  await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  expect(await screen.findByText(/Ingresá nombre y apellido válidos/)).toBeInTheDocument();
  expect(screen.queryByText("Ingresá la patente")).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Es 0 km" }));
  await user.click(screen.getByRole("button", { name: "Iniciar cotización" }));
  expect(await screen.findByText("Ingresá la patente")).toBeInTheDocument();
});
