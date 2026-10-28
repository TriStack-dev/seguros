"use client";

import Link from "next/link";
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
  if (items.length === 0) {
    return <p className="text-muted-foreground">No hay leads con estos filtros</p>;
  }

  return (
    <div className="rounded-md border">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const href = buildLeadDetailHref(item.id, backQuery);
            return (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTimeAr(item.createdAt)}
                </TableCell>
                <TableCell>
                  <Link href={href} className="font-medium hover:underline">
                    {formatRequestNumber(item.requestNumber)}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
