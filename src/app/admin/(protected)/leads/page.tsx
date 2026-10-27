import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads" };

// Placeholder: el listado real llega en el step 16.
export default function LeadsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Leads</h1>
      <p className="mt-2 text-muted-foreground">Acá vas a ver las solicitudes de cotización.</p>
    </>
  );
}
