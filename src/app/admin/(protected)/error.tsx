"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="admin-error" role="alert">
      <h1>No pudimos cargar esta sección</h1>
      <p>Probá de nuevo. Si el problema continúa, volvé al listado más tarde.</p>
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
    </section>
  );
}
