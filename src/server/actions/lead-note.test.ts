import { beforeEach, describe, expect, it, vi } from "vitest";

const { leadFindUnique, noteCreate, revalidatePath, requireAdmin } = vi.hoisted(() => ({
  leadFindUnique: vi.fn(),
  noteCreate: vi.fn(),
  revalidatePath: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  db: { lead: { findUnique: leadFindUnique }, leadNote: { create: noteCreate } },
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/auth", () => ({ requireAdmin }));

import {
  LEAD_NOTE_EMPTY_MESSAGE,
  LEAD_NOTE_MAX_LENGTH,
  LEAD_NOTE_TOO_LONG_MESSAGE,
} from "@/lib/leads/note";
import { addLeadNote } from "./lead-note";

const LEAD_ID = "3f7c1a52-9b0e-4a43-9c62-0d5f2f4c8a11";
const ADMIN = { id: "9a1d2c33-5e6f-4a7b-8c9d-0e1f2a3b4c5d", email: "asesor@miseguro.test" };

describe("addLeadNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue(ADMIN);
    leadFindUnique.mockResolvedValue({ id: LEAD_ID });
    noteCreate.mockResolvedValue({ id: "note-1" });
  });

  it("guarda el texto recortado con el autor y la fecha", async () => {
    const result = await addLeadNote({ leadId: LEAD_ID, body: "  Cotizó todo riesgo  \n" });

    expect(result).toEqual({ ok: true, noteId: "note-1" });
    expect(leadFindUnique).toHaveBeenCalledWith({ where: { id: LEAD_ID }, select: { id: true } });
    expect(noteCreate).toHaveBeenCalledTimes(1);

    const { data } = noteCreate.mock.calls[0]?.[0] ?? {};
    expect(data).toMatchObject({
      leadId: LEAD_ID,
      body: "Cotizó todo riesgo",
      authorId: ADMIN.id,
      authorEmail: ADMIN.email,
    });
    expect(data.createdAt).toBeInstanceOf(Date);
  });

  it("refresca solo la vista del lead que cambió", async () => {
    await addLeadNote({ leadId: LEAD_ID, body: "Llamar el lunes" });

    expect(revalidatePath).toHaveBeenCalledWith(`/admin/leads/${LEAD_ID}`);
    expect(revalidatePath).toHaveBeenCalledTimes(1);
  });

  it("no guarda nada cuando no hay sesión de administrador", async () => {
    requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(addLeadNote({ leadId: LEAD_ID, body: "Nota" })).rejects.toThrow("NEXT_REDIRECT");
    expect(noteCreate).not.toHaveBeenCalled();
  });

  it("rechaza una nota vacía", async () => {
    const result = await addLeadNote({ leadId: LEAD_ID, body: "" });

    expect(result).toEqual({ ok: false, code: "invalid", message: LEAD_NOTE_EMPTY_MESSAGE });
    expect(noteCreate).not.toHaveBeenCalled();
  });

  it("rechaza una nota compuesta solo por espacios y saltos de línea", async () => {
    const result = await addLeadNote({ leadId: LEAD_ID, body: "  \n\t \n  " });

    expect(result).toEqual({ ok: false, code: "invalid", message: LEAD_NOTE_EMPTY_MESSAGE });
    expect(noteCreate).not.toHaveBeenCalled();
  });

  it("rechaza una nota de más de 2000 caracteres", async () => {
    const result = await addLeadNote({
      leadId: LEAD_ID,
      body: "a".repeat(LEAD_NOTE_MAX_LENGTH + 1),
    });

    expect(result).toEqual({ ok: false, code: "invalid", message: LEAD_NOTE_TOO_LONG_MESSAGE });
    expect(noteCreate).not.toHaveBeenCalled();
  });

  it("acepta una nota de exactamente 2000 caracteres", async () => {
    const body = "a".repeat(LEAD_NOTE_MAX_LENGTH);

    const result = await addLeadNote({ leadId: LEAD_ID, body });

    expect(result.ok).toBe(true);
    expect(noteCreate.mock.calls[0]?.[0]?.data.body).toBe(body);
  });

  it("rechaza un leadId que no es un uuid", async () => {
    const result = await addLeadNote({ leadId: "no-es-uuid", body: "Nota" });

    expect(result).toEqual({ ok: false, code: "invalid", message: expect.any(String) });
    expect(leadFindUnique).not.toHaveBeenCalled();
    expect(noteCreate).not.toHaveBeenCalled();
  });

  it("devuelve not_found cuando el lead no existe", async () => {
    leadFindUnique.mockResolvedValue(null);

    const result = await addLeadNote({ leadId: LEAD_ID, body: "Nota" });

    expect(result).toEqual({ ok: false, code: "not_found", message: "El lead ya no existe." });
    expect(noteCreate).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("devuelve error cuando falla la base", async () => {
    noteCreate.mockRejectedValue(new Error("connection lost"));

    const result = await addLeadNote({ leadId: LEAD_ID, body: "Nota" });

    expect(result).toEqual({
      ok: false,
      code: "error",
      message: "No se pudo guardar la nota. Intentá de nuevo.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
