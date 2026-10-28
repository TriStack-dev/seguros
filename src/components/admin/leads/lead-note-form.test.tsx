import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

const { addLeadNote, toastError, toastSuccess } = vi.hoisted(() => ({
  addLeadNote: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/server/actions/lead-note", () => ({ addLeadNote }));
vi.mock("sonner", () => ({ toast: { error: toastError, success: toastSuccess } }));

import { LEAD_NOTE_EMPTY_MESSAGE, LEAD_NOTE_MAX_LENGTH } from "@/lib/leads/note";
import { LeadNoteForm } from "./lead-note-form";

const LEAD_ID = "3f7c1a52-9b0e-4a43-9c62-0d5f2f4c8a11";

afterEach(cleanup);

describe("LeadNoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addLeadNote.mockResolvedValue({ ok: true, noteId: "note-1" });
  });

  it("guarda la nota con el lead actual y limpia el textarea", async () => {
    const user = userEvent.setup();
    render(<LeadNoteForm leadId={LEAD_ID} />);

    const textarea = screen.getByLabelText("Nueva nota");
    await user.type(textarea, "Cotizó todo riesgo");
    await user.click(screen.getByRole("button", { name: "Agregar nota" }));

    await waitFor(() =>
      expect(addLeadNote).toHaveBeenCalledWith({ leadId: LEAD_ID, body: "Cotizó todo riesgo" }),
    );
    await waitFor(() => expect(textarea).toHaveValue(""));
    expect(toastSuccess).toHaveBeenCalledWith("Nota agregada.");
  });

  it("no llama a la acción y muestra el error cuando la nota está vacía", async () => {
    const user = userEvent.setup();
    render(<LeadNoteForm leadId={LEAD_ID} />);

    const textarea = screen.getByLabelText("Nueva nota");
    await user.type(textarea, "   ");
    await user.click(screen.getByRole("button", { name: "Agregar nota" }));

    expect(addLeadNote).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(LEAD_NOTE_EMPTY_MESSAGE);
  });

  it("bloquea el envío y muestra el error cuando supera el máximo", async () => {
    const user = userEvent.setup();
    render(<LeadNoteForm leadId={LEAD_ID} />);

    const textarea = screen.getByLabelText("Nueva nota");
    await user.click(textarea);
    await user.paste("a".repeat(LEAD_NOTE_MAX_LENGTH + 1));
    await user.click(screen.getByRole("button", { name: "Agregar nota" }));

    expect(addLeadNote).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      `La nota no puede superar los ${LEAD_NOTE_MAX_LENGTH} caracteres.`,
    );
  });

  it("muestra el error que devuelve la acción y conserva el texto", async () => {
    addLeadNote.mockResolvedValue({
      ok: false,
      code: "not_found",
      message: "El lead ya no existe.",
    });
    const user = userEvent.setup();
    render(<LeadNoteForm leadId={LEAD_ID} />);

    const textarea = screen.getByLabelText("Nueva nota");
    await user.type(textarea, "Llamar el lunes");
    await user.click(screen.getByRole("button", { name: "Agregar nota" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("El lead ya no existe."),
    );
    expect(textarea).toHaveValue("Llamar el lunes");
    expect(toastError).toHaveBeenCalledWith("El lead ya no existe.");
  });

  it("muestra el estado de carga y deshabilita el envío mientras guarda", async () => {
    let resolveAction: (value: { ok: true; noteId: string }) => void = () => {};
    addLeadNote.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<LeadNoteForm leadId={LEAD_ID} />);

    await user.type(screen.getByLabelText("Nueva nota"), "Nota lenta");
    await user.click(screen.getByRole("button", { name: "Agregar nota" }));

    const pendingButton = await screen.findByRole("button", { name: "Guardando…" });
    expect(pendingButton).toBeDisabled();

    resolveAction({ ok: true, noteId: "note-1" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Agregar nota" })).toBeEnabled());
  });
});
