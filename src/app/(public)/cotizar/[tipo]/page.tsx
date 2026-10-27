import { notFound } from "next/navigation";
import { QuoteFormSection } from "@/components/public/quote-form-section";

export default async function QuotePage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  if (tipo !== "auto" && tipo !== "moto") notFound();
  return (
    <main id="contenido" tabIndex={-1} className="site-container quote-page">
      <section id="cotizar" className="quote-placeholder" aria-labelledby="quote-title">
        <h1 id="quote-title">Cotizá el seguro de tu {tipo}</h1>
        <QuoteFormSection initialVehicleType={tipo === "moto" ? "MOTO" : "AUTO"} />
      </section>
    </main>
  );
}
