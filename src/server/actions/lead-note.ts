"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  LEAD_NOTE_EMPTY_MESSAGE,
  LEAD_NOTE_MAX_LENGTH,
  LEAD_NOTE_TOO_LONG_MESSAGE,
} from "@/lib/leads/note";
import { requireAdmin } from "@/server/auth";

const addLeadNoteSchema = z.object({
  leadId: z.uuid(),
  // .trim() corre antes que min/max: se valida el texto sin los espacios de los extremos.
  body: z
    .string()
    .trim()
    .min(1, LEAD_NOTE_EMPTY_MESSAGE)
    .max(LEAD_NOTE_MAX_LENGTH, LEAD_NOTE_TOO_LONG_MESSAGE),
});

export type AddLeadNoteInput = z.input<typeof addLeadNoteSchema>;

export type AddLeadNoteResult =
  | { ok: true; noteId: string }
  | { ok: false; code: "invalid" | "not_found" | "error"; message: string };

const INVALID_INPUT_MESSAGE = "Escribí una nota de 1 a 2000 caracteres.";
const NOT_FOUND_MESSAGE = "El lead ya no existe.";
const DATABASE_ERROR_MESSAGE = "No se pudo guardar la nota. Intentá de nuevo.";

/**
 * Agrega una nota al lead con el autor y la fecha del momento.
 *
 * Las notas no se editan ni se borran: este es el único punto de escritura del registro.
 * `revalidatePath` alcanza para que la nota aparezca al instante: Next.js re-renderiza la ruta
 * en la misma respuesta de la acción, sin que el cliente tenga que pedir la página de nuevo.
 */
export async function addLeadNote(input: AddLeadNoteInput): Promise<AddLeadNoteResult> {
  const admin = await requireAdmin();

  const parsed = addLeadNoteSchema.safeParse(input);
  if (!parsed.success) {
    // El único campo que puede fallar por datos del usuario es el texto: se muestra su mensaje.
    const bodyError = parsed.error.issues.find((issue) => issue.path[0] === "body");
    return { ok: false, code: "invalid", message: bodyError?.message ?? INVALID_INPUT_MESSAGE };
  }

  const { leadId, body } = parsed.data;

  try {
    const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!lead) return { ok: false, code: "not_found", message: NOT_FOUND_MESSAGE };

    const note = await db.leadNote.create({
      data: {
        leadId,
        body,
        authorId: admin.id,
        authorEmail: admin.email,
        createdAt: new Date(),
      },
      select: { id: true },
    });

    revalidatePath(`/admin/leads/${leadId}`);

    return { ok: true, noteId: note.id };
  } catch {
    return { ok: false, code: "error", message: DATABASE_ERROR_MESSAGE };
  }
}
