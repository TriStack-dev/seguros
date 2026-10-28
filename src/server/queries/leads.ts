import "server-only";

import { db } from "@/lib/db";
import { parseRequestNumber } from "@/lib/leads/request-number";
import { requireAdmin } from "@/server/auth";
import type { LeadStatus, Prisma, VehicleType } from "@/generated/prisma/client";

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



export async function listLeads(params: {
  search?: string;
  from?: string;
  to?: string;
  vehicleType?: VehicleType | "";
  status?: LeadStatus | "";
  page?: number;
}): Promise<LeadListResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const search = params.search?.trim() ?? "";
  const vehicleType = params.vehicleType || undefined;
  const status = params.status || undefined;

  const where: Prisma.LeadWhereInput = {};

  if (vehicleType) {
    where.vehicleType = vehicleType;
  }
  if (status) {
    where.status = status;
  }

  // Date range in Argentina context - filter by UTC boundaries from local dates
  // The requirement says "rango de fechas (en hora de Argentina)"; we interpret as local calendar dates
  // For simplicity and correctness in filtering, we convert Argentina start/end of day to UTC
  // Argentina is UTC-3 (no DST in general) - use fixed offset for filtering
  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) {
      // start of day in America/Argentina/Buenos_Aires (UTC-3)
      const fromDate = new Date(`${params.from}T00:00:00-03:00`);
      if (!Number.isNaN(fromDate.getTime())) {
        where.createdAt.gte = fromDate;
      }
    }
    if (params.to) {
      // end of day
      const toDate = new Date(`${params.to}T23:59:59.999-03:00`);
      if (!Number.isNaN(toDate.getTime())) {
        where.createdAt.lte = toDate;
      }
    }
  }

  // Build search conditions
  if (search) {
    const conditions: Prisma.LeadWhereInput[] = [];

    // Try request number
    const reqNum = parseRequestNumber(search);
    if (reqNum) {
      conditions.push({ requestNumber: reqNum });
    }

    // Text searches (case-insensitive via contains)
    conditions.push({ fullName: { contains: search, mode: "insensitive" } });
    conditions.push({ dni: { contains: search.replace(/[.\s]/g, ""), mode: "insensitive" } });
    conditions.push({ email: { contains: search, mode: "insensitive" } });

    // Phone normalized search - search for digits
    const phoneDigits = search.replace(/\D/g, "");
    if (phoneDigits) {
      conditions.push({ phone: { contains: phoneDigits } });
    }

    // Plate normalized search
    const plateNorm = search.toUpperCase().replace(/[\s\-]/g, "");
    if (plateNorm) {
      conditions.push({ plate: { contains: plateNorm, mode: "insensitive" } });
    }

    if (conditions.length > 0) {
      where.OR = conditions;
    }
  }

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
