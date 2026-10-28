import type { LeadStatus, Prisma, VehicleType } from "@/generated/prisma/client";
import { LEAD_STATUSES, VEHICLE_TYPES } from "@/lib/constants";
import { parseRequestNumber } from "@/lib/leads/request-number";

export type LeadListFilters = {
  search?: string;
  from?: string;
  to?: string;
  vehicleType?: VehicleType;
  status?: LeadStatus;
};

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Normaliza los parámetros de la URL del listado. Es la única puerta de entrada de filtros:
 * la usan tanto la página como la exportación, así el CSV trae exactamente lo que se ve.
 */
export function parseLeadListFilters(
  params: Record<string, string | string[] | undefined>,
): LeadListFilters {
  const vehicleType = single(params.vehicleType);
  const status = single(params.status);

  return {
    search: single(params.search),
    from: single(params.from),
    to: single(params.to),
    vehicleType: (VEHICLE_TYPES as readonly string[]).includes(vehicleType ?? "")
      ? (vehicleType as VehicleType)
      : undefined,
    status: (LEAD_STATUSES as readonly string[]).includes(status ?? "")
      ? (status as LeadStatus)
      : undefined,
  };
}

/**
 * Construye el `where` de Prisma para el listado y la exportación.
 * Las fechas se interpretan como días calendario de Argentina (UTC-3), igual que el panel.
 */
export function buildLeadWhere(filters: LeadListFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (filters.vehicleType) where.vehicleType = filters.vehicleType;
  if (filters.status) where.status = filters.status;

  if (filters.from || filters.to) {
    where.createdAt = {};

    if (filters.from) {
      const fromDate = new Date(`${filters.from}T00:00:00-03:00`);
      if (!Number.isNaN(fromDate.getTime())) where.createdAt.gte = fromDate;
    }

    if (filters.to) {
      const toDate = new Date(`${filters.to}T23:59:59.999-03:00`);
      if (!Number.isNaN(toDate.getTime())) where.createdAt.lte = toDate;
    }
  }

  const search = filters.search?.trim() ?? "";
  if (!search) return where;

  const conditions: Prisma.LeadWhereInput[] = [];

  const requestNumber = parseRequestNumber(search);
  if (requestNumber) conditions.push({ requestNumber });

  conditions.push({ fullName: { contains: search, mode: "insensitive" } });
  conditions.push({ dni: { contains: search.replace(/[.\s]/g, ""), mode: "insensitive" } });
  conditions.push({ email: { contains: search, mode: "insensitive" } });

  const phoneDigits = search.replace(/\D/g, "");
  if (phoneDigits) conditions.push({ phone: { contains: phoneDigits } });

  const plate = search.toUpperCase().replace(/[\s\-]/g, "");
  if (plate) conditions.push({ plate: { contains: plate, mode: "insensitive" } });

  where.OR = conditions;

  return where;
}
