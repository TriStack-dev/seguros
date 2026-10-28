"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export const LEADS_EXPORT_PATH = "/api/admin/leads/export";

/**
 * Descarga los leads con los filtros que están aplicados en el listado. Es un link y no un
 * botón de formulario para que el navegador maneje la descarga y no se pierdan los filtros.
 */
export function LeadsExportButton() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  params.delete("page"); // la exportación no pagina

  const query = params.toString();

  return (
    <Button asChild variant="outline">
      <a href={query ? `${LEADS_EXPORT_PATH}?${query}` : LEADS_EXPORT_PATH}>Exportar CSV</a>
    </Button>
  );
}
