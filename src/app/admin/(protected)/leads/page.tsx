import type { Metadata } from "next";
import { listLeads } from "@/server/queries/leads";
import { LeadsTable } from "@/components/admin/leads/leads-table";
import { LeadsFilters } from "@/components/admin/leads/leads-filters";
import { LeadsExportButton } from "@/components/admin/leads/leads-export-button";
import { LeadsPagination } from "@/components/admin/leads/pagination";
import { buildLeadListBackQuery } from "@/lib/leads/list-query";
import { parseLeadListFilters } from "@/lib/leads/filters";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseLeadListFilters(params);
  const pageParam = typeof params.page === "string" ? params.page : undefined;
  const page = pageParam ? Number(pageParam) : 1;

  const result = await listLeads({
    ...filters,
    page: Number.isNaN(page) ? 1 : page,
  });

  const backQuery = buildLeadListBackQuery({
    ...filters,
    page: result.page,
  });

  return (
    <>
      <header className="admin-page-heading">
        <div>
          <h1>Leads</h1>
          <p>Solicitudes de cotización recibidas</p>
        </div>
        <LeadsExportButton />
      </header>
      <section className="admin-leads-toolbar" aria-label="Listado de solicitudes">
        <LeadsFilters />
        <LeadsTable items={result.items} backQuery={backQuery} />
        <LeadsPagination page={result.page} totalPages={result.totalPages} />
      </section>
    </>
  );
}
