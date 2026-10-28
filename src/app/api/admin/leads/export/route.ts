import { LEAD_EXPORT_HEADERS, buildLeadExportRow } from "@/lib/csv/leads-export";
import { serializeCsvHeader, serializeCsvRows } from "@/lib/csv/serialize";
import { formatDateArCompact } from "@/lib/format";
import { buildLeadWhere, parseLeadListFilters } from "@/lib/leads/filters";
import { requireAdmin } from "@/server/auth";
import { iterateLeadsForExport } from "@/server/queries/lead-export";

export const dynamic = "force-dynamic";

/**
 * Descarga los leads que coinciden con los filtros del listado (step 19).
 * Los filtros se normalizan con la misma función que usa la página, así el archivo y la
 * pantalla nunca muestran cosas distintas. El cuerpo se escribe por lotes a medida que
 * Prisma los devuelve.
 */
export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const where = buildLeadWhere(parseLeadListFilters(Object.fromEntries(searchParams)));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(serializeCsvHeader(LEAD_EXPORT_HEADERS)));

        for await (const batch of iterateLeadsForExport(where)) {
          controller.enqueue(encoder.encode(serializeCsvRows(batch.map(buildLeadExportRow))));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${formatDateArCompact(new Date())}.csv"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
