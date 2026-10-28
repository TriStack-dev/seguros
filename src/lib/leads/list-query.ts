import { LEAD_STATUSES, VEHICLE_TYPES } from "@/lib/constants";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PAGE_PATTERN = /^\d+$/;
const SEARCH_MAX_LENGTH = 200;

export const LEADS_PATH = "/admin/leads";

type LeadListFilters = {
  search?: string;
  from?: string;
  to?: string;
  vehicleType?: string;
  status?: string;
  page?: number;
};

function isLeadStatus(value: string): value is (typeof LEAD_STATUSES)[number] {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function isVehicleType(value: string): value is (typeof VEHICLE_TYPES)[number] {
  return (VEHICLE_TYPES as readonly string[]).includes(value);
}

/** Serializa los filtros del listado para poder volver a ellos desde el detalle. */
export function buildLeadListBackQuery(filters: LeadListFilters): string {
  const query = new URLSearchParams();

  const search = filters.search?.trim();
  if (search) query.set("search", search.slice(0, SEARCH_MAX_LENGTH));
  if (filters.from && DATE_PATTERN.test(filters.from)) query.set("from", filters.from);
  if (filters.to && DATE_PATTERN.test(filters.to)) query.set("to", filters.to);
  if (filters.vehicleType && isVehicleType(filters.vehicleType)) {
    query.set("vehicleType", filters.vehicleType);
  }
  if (filters.status && isLeadStatus(filters.status)) query.set("status", filters.status);
  if (filters.page && filters.page > 1) query.set("page", String(filters.page));

  return query.toString();
}

/** Link al detalle del lead llevando los filtros del listado. */
export function buildLeadDetailHref(leadId: string, backQuery: string): string {
  const path = `${LEADS_PATH}/${encodeURIComponent(leadId)}`;
  if (!backQuery) return path;
  return `${path}?${new URLSearchParams({ back: backQuery }).toString()}`;
}

/**
 * Convierte el parámetro `back` del detalle en un link al listado. Solo acepta los filtros
 * conocidos, así que un valor manipulado no puede redirigir a otro sitio.
 */
export function buildLeadsBackHref(back: string | string[] | undefined): string {
  const value = Array.isArray(back) ? back[0] : back;
  if (!value) return LEADS_PATH;

  const source = new URLSearchParams(value.startsWith("?") ? value.slice(1) : value);
  const query = new URLSearchParams();

  const search = source.get("search")?.trim();
  if (search) query.set("search", search.slice(0, SEARCH_MAX_LENGTH));

  const from = source.get("from");
  if (from && DATE_PATTERN.test(from)) query.set("from", from);

  const to = source.get("to");
  if (to && DATE_PATTERN.test(to)) query.set("to", to);

  const vehicleType = source.get("vehicleType");
  if (vehicleType && isVehicleType(vehicleType)) query.set("vehicleType", vehicleType);

  const status = source.get("status");
  if (status && isLeadStatus(status)) query.set("status", status);

  const page = source.get("page");
  if (page && PAGE_PATTERN.test(page) && Number(page) > 1) query.set("page", page);

  const qs = query.toString();
  return qs ? `${LEADS_PATH}?${qs}` : LEADS_PATH;
}
