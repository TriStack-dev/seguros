import "server-only";

import { db } from "@/lib/db";
import { buildLeadWhere, type LeadListFilters } from "@/lib/leads/filters";
import { requireAdmin } from "@/server/auth";
import type {
  Lead,
  LeadNote,
  LeadStatus,
  LeadStatusChange,
  VehicleType,
} from "@/generated/prisma/client";

const PAGE_SIZE = 25;

export type LeadListItem = {
  id: string;
  requestNumber: number;
  createdAt: Date;
  fullName: string;
  phone: string;
  vehicleType: VehicleType;
  brandName: string;
  modelName: string;
  postalCode: string;
  status: LeadStatus;
  plate: string | null;
  isZeroKm: boolean;
  dni: string;
  isPossibleDuplicate: boolean;
};

export type LeadListResult = {
  items: LeadListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listLeads(
  params: LeadListFilters & { page?: number },
): Promise<LeadListResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const where = buildLeadWhere(params);

  const [total, items] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        requestNumber: true,
        createdAt: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        brandName: true,
        modelName: true,
        postalCode: true,
        status: true,
        plate: true,
        isZeroKm: true,
        dni: true,
      },
    }),
  ]);

  // Mark possible duplicates: same phone or same DNI created in the 30 days prior
  const itemsWithDuplicates = await Promise.all(
    items.map(async (item) => {
      const thirtyDaysAgo = new Date(item.createdAt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const duplicateCount = await db.lead.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
            lt: item.createdAt,
          },
          OR: [{ phone: item.phone }, { dni: item.dni }],
        },
      });
      return {
        ...item,
        isPossibleDuplicate: duplicateCount > 0,
      };
    }),
  );

  return {
    items: itemsWithDuplicates,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function countNewLeads(): Promise<number> {
  await requireAdmin();
  return db.lead.count({ where: { status: "NEW" } });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LeadDetail = Lead & {
  statusChanges: LeadStatusChange[];
  notes: LeadNote[];
};

/** Lead con su historial de estados y sus notas, o null si el id no existe. */
export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  await requireAdmin();

  if (!UUID_PATTERN.test(id)) return null;

  return db.lead.findUnique({
    where: { id },
    include: {
      statusChanges: { orderBy: { createdAt: "asc" } },
      // La más vieja arriba: las notas se leen como un registro cronológico.
      notes: { orderBy: { createdAt: "asc" } },
    },
  });
}
