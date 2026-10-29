import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { LeadsTable } from "./leads-table";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
const { push, useRouter } = vi.hoisted(() => ({ push: vi.fn(), useRouter: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter }));

afterEach(() => {
  cleanup();
  push.mockReset();
});

function renderLeadsTable() {
  useRouter.mockReturnValue({ push });
  window.getSelection()?.removeAllRanges();
  const view = render(
    <LeadsTable
      backQuery="search=ana&status=NEW"
      items={[
        {
          id: "lead-1",
          requestNumber: 123,
          createdAt: new Date("2026-10-29T12:00:00.000Z"),
          fullName: "Ana Pérez",
          phone: "5493415550000",
          vehicleType: "AUTO",
          brandName: "Fiat",
          modelName: "Cronos",
          postalCode: "2000",
          status: "NEW",
          plate: "AA123BB",
          isZeroKm: false,
          dni: "12345678",
          isPossibleDuplicate: false,
        },
      ]}
    />,
  );
  const row = screen.getByRole("row", { name: /Ana Pérez/ });
  return { ...view, row };
}

it("exposes horizontally scrollable lead results as a labeled keyboard region", () => {
  renderLeadsTable();

  const results = screen.getByRole("region", { name: "Resultados de solicitudes" });
  expect(results).toHaveAttribute("tabindex", "0");
  expect(results).toContainElement(screen.getByRole("table"));
  results.focus();
  expect(results).toHaveFocus();
});

it("offers a lead-specific detail action and preserves the list query", () => {
  const { row } = renderLeadsTable();
  const actions = within(row).getAllByRole("link", {
    name: "Ver detalle de Ana Pérez (MS-000123)",
  });

  expect(actions).toHaveLength(2);
  expect(actions[0]).toHaveAttribute(
    "href",
    "/admin/leads/lead-1?back=search%3Dana%26status%3DNEW",
  );
  expect(actions[1]).toHaveAttribute(
    "href",
    "/admin/leads/lead-1?back=search%3Dana%26status%3DNEW",
  );
});

it("opens a row from non-link space while leaving nested links and modified clicks native", () => {
  useRouter.mockReturnValue({ push });
  const { row } = renderLeadsTable();
  const phoneCell = within(row).getByRole("cell", { name: /\+54/ });
  fireEvent.click(phoneCell, { button: 0 });
  expect(push).toHaveBeenCalledWith("/admin/leads/lead-1?back=search%3Dana%26status%3DNEW");

  push.mockClear();
  fireEvent.click(within(row).getByRole("link", { name: "Ana Pérez" }));
  expect(push).not.toHaveBeenCalled();

  fireEvent.click(phoneCell, { ctrlKey: true });
  fireEvent.click(phoneCell, { button: 1 });
  expect(push).not.toHaveBeenCalled();
});

it("does not hijack a row click while text is selected", () => {
  useRouter.mockReturnValue({ push });
  const { row } = renderLeadsTable();
  const cell = within(row).getByRole("cell", { name: /2000/ });
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(row);
  selection?.removeAllRanges();
  selection?.addRange(range);

  fireEvent.click(cell);
  expect(push).not.toHaveBeenCalled();
});

it("does not let an unrelated text selection suppress row navigation", () => {
  const { row } = renderLeadsTable();
  const outsideText = document.createElement("p");
  outsideText.textContent = "Unrelated selected page copy";
  document.body.append(outsideText);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(outsideText);
  selection?.removeAllRanges();
  selection?.addRange(range);

  fireEvent.click(within(row).getByRole("cell", { name: /\+54/ }));
  expect(push).toHaveBeenCalledWith("/admin/leads/lead-1?back=search%3Dana%26status%3DNEW");
  selection?.removeAllRanges();
  outsideText.remove();
});
