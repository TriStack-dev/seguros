import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadForm } from "./lead-form";
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
  it(`submits ${type} validated unknown-GNC payload only after consent`, async () => {
    const u = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
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
    await waitFor(() => expect(screen.getByRole("checkbox")).toHaveFocus());
    expect(log).not.toHaveBeenCalled();
    await u.click(screen.getByRole("checkbox"));
    await u.click(screen.getByRole("button", { name: "Iniciar cotización" }));
    await waitFor(() => expect(log).toHaveBeenCalledOnce());
    expect(log.mock.calls[0]?.[0]).toMatchObject({
      vehicleType: type,
      phone: "5493414123456",
      hasGnc: null,
      email: "ana@example.com",
      dni: "12345678",
      postalCode: "S2000ABC",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
}
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
