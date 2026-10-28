"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { LEAD_STATUSES, LOST_REASONS } from "@/lib/constants";
import { canTransition, shouldSetFirstContactedAt } from "@/lib/leads/status";
import { requireAdmin } from "@/server/auth";

const changeLeadStatusSchema = z.object({
  leadId: z.uuid(),
  /** Estado que el usuario vio en pantalla; evita pisar un cambio concurrente. */
  fromStatus: z.enum(LEAD_STATUSES),
  toStatus: z.enum(LEAD_STATUSES),
  lostReason: z.enum(LOST_REASONS).nullish(),
});

export type ChangeLeadStatusInput = z.input<typeof changeLeadStatusSchema>;

export type ChangeLeadStatusResult =
  | { ok: true }
  | {
      ok: false;
      code: "invalid" | "transition" | "conflict" | "not_found" | "error";
      message: string;
    };

const LEAD_STATUS_CONFLICT_MESSAGE = "El lead cambió mientras lo veías; recargá la página.";

const INVALID_INPUT_MESSAGE = "Los datos del cambio de estado no son válidos.";
const TRANSITION_ERROR_MESSAGE = "Ese cambio de estado no está permitido.";
const NOT_FOUND_MESSAGE = "El lead ya no existe.";
const DATABASE_ERROR_MESSAGE = "No se pudo cambiar el estado. Intentá de nuevo.";

/**
 * Cambia el estado de un lead aplicando las transiciones de la sección 5.1.
 *
 * Además de validar `canTransition`, actualiza solo si el estado en la base sigue siendo
 * el que vio el usuario (`where: { id, status: fromStatus }`). Así dos pestañas abiertas no
 * pueden saltearse transiciones ni duplicar historial.
 */
export async function changeLeadStatus(
  input: ChangeLeadStatusInput,
): Promise<ChangeLeadStatusResult> {
  const admin = await requireAdmin();

  const parsed = changeLeadStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: INVALID_INPUT_MESSAGE };
  }

  const { leadId, fromStatus, toStatus } = parsed.data;
  const lostReason = parsed.data.lostReason ?? null;

  if (!canTransition(fromStatus, toStatus)) {
    return { ok: false, code: "transition", message: TRANSITION_ERROR_MESSAGE };
  }

  const changedAt = new Date();

  try {
    const result = await db.$transaction(async (transaction) => {
      const lead = await transaction.lead.findUnique({
        where: { id: leadId },
        select: { firstContactedAt: true },
      });
      if (!lead) return "not_found" as const;

      const { count } = await transaction.lead.updateMany({
        where: { id: leadId, status: fromStatus },
        data: {
          status: toStatus,
          // Al reabrir (LOST → CONTACTED) el motivo se borra; fuera de LOST no aplica.
          lostReason: toStatus === "LOST" ? lostReason : null,
        },
      });
      if (count === 0) return "conflict" as const;

      // Se completa una sola vez, aunque el lead pase por CONTACTED, QUOTED e ISSUED.
      if (shouldSetFirstContactedAt(lead, toStatus)) {
        await transaction.lead.updateMany({
          where: { id: leadId, firstContactedAt: null },
          data: { firstContactedAt: changedAt },
        });
      }

      await transaction.leadStatusChange.create({
        data: {
          leadId,
          fromStatus,
          toStatus,
          changedById: admin.id,
          changedByEmail: admin.email,
          createdAt: changedAt,
        },
      });

      return "ok" as const;
    });

    if (result === "not_found") {
      return { ok: false, code: "not_found", message: NOT_FOUND_MESSAGE };
    }
    if (result === "conflict") {
      return { ok: false, code: "conflict", message: LEAD_STATUS_CONFLICT_MESSAGE };
    }

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return { ok: true };
  } catch {
    return { ok: false, code: "error", message: DATABASE_ERROR_MESSAGE };
  }
}
