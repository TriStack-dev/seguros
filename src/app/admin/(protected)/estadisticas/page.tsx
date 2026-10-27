import type { Metadata } from "next";

export const metadata: Metadata = { title: "Estadísticas" };

// Placeholder: las estadísticas llegan en un step posterior.
export default function StatsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Estadísticas</h1>
      <p className="mt-2 text-muted-foreground">Próximamente.</p>
    </>
  );
}
