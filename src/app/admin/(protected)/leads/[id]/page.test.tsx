import { cleanup, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import LeadDetailPage from "./page";

const { lead, useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn(), push: vi.fn() })),
  lead: {
    id: "lead-fixture-1",
    requestNumber: 4812,
    createdAt: new Date("2026-10-28T15:24:00.000Z"),
    fullName: "Ana Pérez",
    phone: "5493415550134",
    vehicleType: "AUTO",
    brandName: "Fiat",
    modelName: "Cronos Precision",
    postalCode: "2000",
    status: "CONTACTED",
    plate: "AB123CD",
    isZeroKm: false,
    dni: "30123456",
    email: "ana.perez@example.test",
    year: 2022,
    hasGnc: false,
    usage: "PARTICULAR",
    consentAt: new Date("2026-10-28T15:24:00.000Z"),
    lostReason: null,
    whatsappClickedAt: new Date("2026-10-28T17:15:00.000Z"),
    utmSource: "busqueda",
    utmMedium: "organico",
    utmCampaign: "cobertura-auto",
    utmTerm: "seguro auto",
    utmContent: "resultado-1",
    gclid: "gclid-fixture-123",
    landingPage: "/cotizar/auto",
    referrer: "https://example.test/",
    notes: [
      {
        id: "note-fixture-1",
        body: "Nota de prueba preservada",
        authorEmail: "admin@example.test",
        createdAt: new Date("2026-10-29T12:00:00Z"),
      },
    ],
    statusChanges: [
      {
        id: "change-fixture-1",
        fromStatus: null,
        toStatus: "NEW",
        changedByEmail: null,
        createdAt: new Date("2026-10-28T15:24:00.000Z"),
      },
      {
        id: "change-fixture-2",
        fromStatus: "NEW",
        toStatus: "CONTACTED",
        changedByEmail: "admin@example.test",
        createdAt: new Date("2026-10-28T16:00:00.000Z"),
      },
    ],
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  useRouter,
}));
vi.mock("@/server/queries/leads", () => ({ getLeadDetail: async () => lead }));
vi.mock("@/server/actions/lead-status", () => ({ changeLeadStatus: vi.fn() }));
vi.mock("@/server/actions/lead-note", () => ({ addLeadNote: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeEach(() => {
  useRouter.mockReturnValue({ refresh: vi.fn(), push: vi.fn() });
});
afterEach(() => cleanup());

async function renderDetail() {
  const page = await LeadDetailPage({
    params: Promise.resolve({ id: lead.id }),
    searchParams: Promise.resolve({ back: "search=ana&status=NEW&page=2" }),
  });
  render(page);
}

it("leads with the person's name and request status remains clear", async () => {
  await renderDetail();

  expect(screen.getByRole("heading", { level: 1, name: "Ana Pérez" })).toBeInTheDocument();
  expect(screen.getByText(/Solicitud MS-004812/)).toBeInTheDocument();
  expect(within(screen.getByRole("banner")).getByText("Contactado")).toBeInTheDocument();
});

it("keeps contact, vehicle, consent, attribution, management, and return actions", async () => {
  await renderDetail();

  expect(screen.getByText("ana.perez@example.test")).toBeInTheDocument();
  expect(screen.getByText("30123456")).toBeInTheDocument();
  expect(screen.getByText("Cronos Precision")).toBeInTheDocument();
  expect(screen.getByText("AB123CD")).toBeInTheDocument();
  expect(screen.getByText("No", { selector: "dd" })).toBeInTheDocument();
  expect(screen.getByText("Particular")).toBeInTheDocument();
  expect(screen.getByText("2000", { selector: "dd" })).toBeInTheDocument();
  expect(screen.getByText(/Aceptó la política de privacidad el/)).toBeInTheDocument();
  expect(screen.getByText("/cotizar/auto")).toBeInTheDocument();
  expect(screen.getByText("gclid-fixture-123")).toBeInTheDocument();
  expect(screen.getByText("busqueda")).toBeInTheDocument();
  expect(screen.getByText("organico")).toBeInTheDocument();
  expect(screen.getByText("cobertura-auto")).toBeInTheDocument();
  expect(screen.getByText("seguro auto")).toBeInTheDocument();
  expect(screen.getByText("resultado-1")).toBeInTheDocument();
  expect(screen.getByText("https://example.test/")).toBeInTheDocument();
  const timeline = screen.getByRole("region", { name: "Historial de estados" });
  expect(within(timeline).getByText("Alta del lead")).toBeInTheDocument();
  expect(within(timeline).getByText("Contactado")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Guardar cambio" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Copiar datos" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Escribir por WhatsApp/ })).toHaveAttribute(
    "href",
    "https://wa.me/5493415550134",
  );
  expect(screen.getByRole("link", { name: "Llamar al lead" })).toHaveAttribute(
    "href",
    "tel:+5493415550134",
  );
  expect(screen.getByRole("link", { name: "Volver al listado" })).toHaveAttribute(
    "href",
    "/admin/leads?search=ana&status=NEW&page=2",
  );
});

it("keeps attribution available in a native disclosure without losing its fields", async () => {
  await renderDetail();

  const attribution = document.querySelector("details.admin-attribution");
  expect(attribution).not.toBeNull();
  const disclosure = within(attribution as HTMLElement);
  expect(disclosure.getByText("busqueda")).toBeInTheDocument();
  expect(disclosure.getByText("organico")).toBeInTheDocument();
  expect(disclosure.getByText("cobertura-auto")).toBeInTheDocument();
});

it("preserves lead notes alongside the refined detail sections", async () => {
  await renderDetail();
  expect(screen.getByRole("heading", { name: "Notas", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("Nota de prueba preservada")).toBeInTheDocument();
});
