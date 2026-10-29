import type { Metadata } from "next";
import { listLeads } from "@/server/queries/leads";
import { LeadsTable } from "@/components/admin/leads/leads-table";
import { LeadsFilters } from "@/components/admin/leads/leads-filters";
import { LeadsPagination } from "@/components/admin/leads/pagination";
import { buildLeadListBackQuery } from "@/lib/leads/list-query";
import type { LeadStatus, VehicleType } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const vehicleTypeParam = typeof params.vehicleType === "string" ? params.vehicleType : undefined;
  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const pageParam = typeof params.page === "string" ? params.page : undefined;

  const vehicleType =
    vehicleTypeParam === "AUTO" || vehicleTypeParam === "MOTO"
      ? (vehicleTypeParam as VehicleType)
      : undefined;
  const status =
    statusParam === "NEW" ||
    statusParam === "CONTACTED" ||
    statusParam === "QUOTED" ||
    statusParam === "ISSUED" ||
    statusParam === "LOST"
      ? (statusParam as LeadStatus)
      : undefined;
  const page = pageParam ? Number(pageParam) : 1;

  const result = await listLeads({
    search,
    from,
    to,
    vehicleType,
    status,
    page: Number.isNaN(page) ? 1 : page,
  });

  const backQuery = buildLeadListBackQuery({
    search,
    from,
    to,
    vehicleType,
    status,
    page: result.page,
  });

  return (
    <>
      <header className="admin-page-heading">
        <div>
          <h1>Leads</h1>
          <p>Solicitudes de cotización recibidas</p>
        </div>
      </header>
      <section className="admin-leads-toolbar" aria-label="Listado de solicitudes">
        <LeadsFilters />
        <LeadsTable items={result.items} backQuery={backQuery} />
        <LeadsPagination page={result.page} totalPages={result.totalPages} />
      </section>
    </>
  );
}
