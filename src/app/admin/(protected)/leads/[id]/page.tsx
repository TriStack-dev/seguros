import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Detalle del lead" };

export default function LeadDetailPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Detalle del lead</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/leads">Volver al listado</Link>
        </Button>
      </div>
      <p className="text-muted-foreground">Detalle próximamente (step 17).</p>
    </>
  );
}
