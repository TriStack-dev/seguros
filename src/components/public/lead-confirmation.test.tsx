import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { LeadConfirmation } from "./lead-confirmation";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("confirms the request, links directly to WhatsApp, and tracks without blocking navigation", async () => {
  const user = userEvent.setup();
  const sendBeacon = vi.fn(() => true);
  vi.stubGlobal("navigator", { ...navigator, sendBeacon });
  const focus = vi.spyOn(HTMLElement.prototype, "focus");
  const scroll = vi.fn();
  Element.prototype.scrollIntoView = scroll;
  render(
    <LeadConfirmation
      leadId="8a10bedd-6d48-4e4a-8560-01f9c2d56f7d"
      requestNumber="MS-000123"
      whatsappUrl="https://wa.me/5493794057190?text=Hi"
      onNewQuote={() => {}}
    />,
  );
  expect(screen.getByRole("heading", { name: "¡Listo! Recibimos tu solicitud" })).toHaveFocus();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  expect(screen.getByText("MS-000123")).toBeInTheDocument();
  expect(screen.getByText(/\+54 9 3794 05-7190/)).toBeInTheDocument();
  const link = screen.getByRole("link", { name: "Abrir WhatsApp" });
  expect(link).toHaveAttribute("href", "https://wa.me/5493794057190?text=Hi");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  const click = fireEvent.click(link);
  expect(click).toBe(true);
  expect(sendBeacon).toHaveBeenCalledWith(
    "/api/leads/8a10bedd-6d48-4e4a-8560-01f9c2d56f7d/whatsapp",
  );
  await user.click(screen.getByRole("button", { name: "Cargar otra cotización" }));
});

it("formats an Argentine WhatsApp number from the link pathname", () => {
  render(
    <LeadConfirmation
      leadId="lead"
      requestNumber="MS-1"
      whatsappUrl="https://wa.me/5493794057190"
      onNewQuote={() => {}}
    />,
  );
  expect(screen.getByText(/\+54 9 3794 05-7190/)).toBeInTheDocument();
});
