import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { LeadExportData } from "@/lib/csv/leads-export";
import { db } from "@/lib/db";

/**
 * Cantidad de leads por consulta. El archivo se arma por lotes para que una exportación
 * grande no cargue todos los registros en memoria.
 */
export const LEAD_EXPORT_BATCH_SIZE = 1000;

const LEAD_EXPORT_SELECT = {
  id: true,
  requestNumber: true,
  createdAt: true,
  status: true,
  lostReason: true,
  vehicleType: true,
  fullName: true,
  dni: true,
  phone: true,
  email: true,
  brandName: true,
  modelName: true,
  year: true,
  hasGnc: true,
  plate: true,
  isZeroKm: true,
  postalCode: true,
  usage: true,
  whatsappClickedAt: true,
  firstContactedAt: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  gclid: true,
  referrer: true,
} satisfies Prisma.LeadSelect;

type LeadExportRecord = Prisma.LeadGetPayload<{ select: typeof LEAD_EXPORT_SELECT }>;

/**
 * Recorre los leads que cumplen el `where`, de a un lote por vez y en el mismo orden que el
 * listado (más nuevos primero). Usa cursor por `id` porque es único y no se saltea filas
 * aunque entren leads nuevos durante la exportación.
 *
 * No valida sesión: el route handler llama a `requireAdmin()` antes de abrir el stream, así
 * que un usuario sin sesión nunca llega a esta consulta.
 */
export async function* iterateLeadsForExport(
  where: Prisma.LeadWhereInput,
): AsyncGenerator<LeadExportData[]> {
  let cursor: string | undefined;

  for (;;) {
    const batch: LeadExportRecord[] = await db.lead.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: LEAD_EXPORT_BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: LEAD_EXPORT_SELECT,
    });

    if (batch.length === 0) return;

    yield batch;

    if (batch.length < LEAD_EXPORT_BATCH_SIZE) return;
    const last = batch[batch.length - 1];
    if (!last) return;
    cursor = last.id;
  }
}
