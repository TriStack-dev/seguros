"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeAr } from "@/lib/format";
import { buildLeadDetailHref } from "@/lib/leads/list-query";
import { formatRequestNumber } from "@/lib/leads/request-number";
import { LEAD_STATUS_BADGE_VARIANTS, LEAD_STATUS_LABELS } from "@/lib/leads/status";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";
import type { LeadListItem } from "@/server/queries/leads";

export function LeadsTable({ items, backQuery }: { items: LeadListItem[]; backQuery: string }) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="admin-leads-empty" role="status">
        <div>
          <strong>No encontramos solicitudes</strong>
          <p>Probá cambiar o limpiar los filtros para ampliar la búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-leads-table"
      role="region"
      aria-label="Resultados de solicitudes"
      tabIndex={0}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha y hora</TableHead>
            <TableHead>N° de solicitud</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Marca y modelo</TableHead>
            <TableHead className="hidden md:table-cell">Código postal</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="admin-leads-action-heading">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const href = buildLeadDetailHref(item.id, backQuery);
            const requestNumber = formatRequestNumber(item.requestNumber);

            function navigateFromRow(event: ReactMouseEvent<HTMLTableRowElement>) {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                (event.target instanceof Element &&
                  event.target.closest("a, button, input, select, textarea, [role='button']"))
              ) {
                return;
              }

              const selection = window.getSelection();
              if (
                selection &&
                !selection.isCollapsed &&
                ((selection.anchorNode && event.currentTarget.contains(selection.anchorNode)) ||
                  (selection.focusNode && event.currentTarget.contains(selection.focusNode)))
              ) {
                return;
              }
              router.push(href);
            }

            return (
              <TableRow key={item.id} className="admin-leads-row" onClick={navigateFromRow}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTimeAr(item.createdAt)}
                </TableCell>
                <TableCell>
                  <Link href={href} className="font-medium hover:underline">
                    {requestNumber}
                  </Link>
                  <Link
                    href={href}
                    className="admin-leads-detail-mobile"
                    aria-label={`Ver detalle de ${item.fullName} (${requestNumber})`}
                  >
                    Ver detalle <ArrowRight aria-hidden="true" />
                  </Link>
                  {item.isPossibleDuplicate ? (
                    <Badge variant="outline" className="ml-2">
                      Posible duplicado
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Link href={href} className="hover:underline">
                    {item.fullName}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatPhoneForDisplay(item.phone)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.vehicleType === "AUTO" ? "Auto" : "Moto"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {item.brandName} {item.modelName}
                  {item.isZeroKm ? " · 0 km" : item.plate ? ` · ${item.plate}` : ""}
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.postalCode}</TableCell>
                <TableCell>
                  <Badge variant={LEAD_STATUS_BADGE_VARIANTS[item.status]}>
                    {LEAD_STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="admin-leads-action-cell">
                  <Link
                    href={href}
                    className="admin-leads-detail-desktop"
                    aria-label={`Ver detalle de ${item.fullName} (${requestNumber})`}
                  >
                    Ver detalle <ArrowRight aria-hidden="true" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
