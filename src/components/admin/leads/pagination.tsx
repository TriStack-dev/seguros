"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LeadsPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="admin-pagination mt-4 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="admin-pagination__controls flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={buildHref(page - 1)} aria-disabled={page <= 1}>
            Anterior
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
          <Link href={buildHref(page + 1)} aria-disabled={page >= totalPages}>
            Siguiente
          </Link>
        </Button>
      </div>
    </div>
  );
}
