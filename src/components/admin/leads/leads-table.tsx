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
import { formatRequestNumber } from "@/lib/leads/request-number";
import type { LeadListItem } from "@/server/queries/leads";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUOTED: "Cotizado",
  ISSUED: "Emitido",
  LOST: "Perdido",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUOTED: "outline",
  ISSUED: "default",
  LOST: "destructive",
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPhone(phone: string) {
  // phone is stored as 549 + digits
  if (phone.startsWith("549") && phone.length >= 12) {
    const rest = phone.slice(3);
    if (rest.length >= 10) {
      const area = rest.slice(0, 3);
      const number = rest.slice(3);
      return `+54 9 ${area} ${number.slice(0, 3)}-${number.slice(3)}`;
    }
  }
  return phone;
}

export function LeadsTable({ items }: { items: LeadListItem[] }) {
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
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap">{formatDateTime(item.createdAt)}</TableCell>
              <TableCell>
                <Link href={`/admin/leads/${item.id}`} className="font-medium hover:underline">
                  {formatRequestNumber(item.requestNumber)}
                </Link>
                {item.isPossibleDuplicate ? (
                  <Badge variant="outline" className="ml-2">
                    Posible duplicado
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell>
                <Link href={`/admin/leads/${item.id}`} className="hover:underline">
                  {item.fullName}
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{formatPhone(item.phone)}</TableCell>
              <TableCell className="hidden md:table-cell">{item.vehicleType === "AUTO" ? "Auto" : "Moto"}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.brandName} {item.modelName}
                {item.isZeroKm ? " · 0 km" : item.plate ? ` · ${item.plate}` : ""}
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.postalCode}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[item.status] ?? "secondary"}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
