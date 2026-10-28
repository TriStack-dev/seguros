import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/json-ld";
import { QuoteFormSection } from "@/components/public/quote-form-section";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type QuotePageProps = { params: Promise<{ tipo: string }> };

function seoKey(tipo: string) {
  return tipo === "moto" ? "moto" : tipo === "auto" ? "auto" : null;
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { tipo } = await params;
  const key = seoKey(tipo);
  // El 404 lo resuelve la página; acá alcanza con no declarar metadatos propios.
  return key ? buildPageMetadata(key) : {};
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { tipo } = await params;
  const key = seoKey(tipo);
  if (!key) notFound();
  return (
    <main id="contenido" tabIndex={-1} className="site-container quote-page">
      <JsonLd data={buildBreadcrumbJsonLd(key)} />
      <section id="cotizar" className="quote-placeholder" aria-labelledby="quote-title">
        <h1 id="quote-title">Cotizá el seguro de tu {tipo}</h1>
        <QuoteFormSection initialVehicleType={tipo === "moto" ? "MOTO" : "AUTO"} />
      </section>
    </main>
  );
}
