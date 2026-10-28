import type { LeadStatus } from "@/generated/prisma/client";
import { LEAD_STATUSES } from "@/lib/constants";

/** Etiqueta visible de cada estado (sección 5 de docs/reglas-negocio.md). */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUOTED: "Cotizado",
  ISSUED: "Emitido",
  LOST: "Perdido",
};

export type LeadStatusBadgeVariant = "default" | "secondary" | "outline" | "destructive";

/** Color del badge de cada estado, alineado con el listado del panel. */
export const LEAD_STATUS_BADGE_VARIANTS: Record<LeadStatus, LeadStatusBadgeVariant> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUOTED: "outline",
  ISSUED: "default",
  LOST: "destructive",
};

/** Orden de avance: NEW → CONTACTED → QUOTED → ISSUED. */
const ADVANCE_ORDER: readonly LeadStatus[] = ["NEW", "CONTACTED", "QUOTED", "ISSUED"];

const FIRST_CONTACT_STATUSES: readonly LeadStatus[] = ["CONTACTED", "QUOTED", "ISSUED"];

/**
 * Transiciones permitidas (sección 5.1):
 * - avanzar a cualquier estado posterior;
 * - retroceder un solo estado;
 * - pasar a LOST desde NEW, CONTACTED o QUOTED;
 * - reabrir LOST solo hacia CONTACTED.
 */
export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return false;

  if (to === "LOST") {
    return from === "NEW" || from === "CONTACTED" || from === "QUOTED";
  }

  if (from === "LOST") {
    return to === "CONTACTED";
  }

  const fromIndex = ADVANCE_ORDER.indexOf(from);
  const toIndex = ADVANCE_ORDER.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return false;

  return toIndex > fromIndex || toIndex === fromIndex - 1;
}

/** Estados a los que se puede pasar desde `from`, en el orden de avance. */
export function allowedTransitions(from: LeadStatus): LeadStatus[] {
  return LEAD_STATUSES.filter((to) => canTransition(from, to));
}

/**
 * `firstContactedAt` se completa la primera vez que el lead pasa a CONTACTED, QUOTED o ISSUED.
 * Una vez seteado no se vuelve a tocar.
 */
export function shouldSetFirstContactedAt(
  lead: { firstContactedAt: Date | null },
  to: LeadStatus,
): boolean {
  return lead.firstContactedAt === null && FIRST_CONTACT_STATUSES.includes(to);
}
