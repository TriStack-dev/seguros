import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classifySource } from "@/lib/attribution/classify-source";
import { LOST_REASON_LABELS, USAGE_LABELS } from "@/lib/constants";
import { formatDateTimeAr } from "@/lib/format";
import { buildLeadsBackHref } from "@/lib/leads/list-query";
import { formatRequestNumber } from "@/lib/leads/request-number";
import { LEAD_STATUS_BADGE_VARIANTS, LEAD_STATUS_LABELS } from "@/lib/leads/status";
import { buildLeadSummary } from "@/lib/leads/summary";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";
import { LeadQuickActions } from "@/components/admin/leads/lead-quick-actions";
import { LeadStatusChanger } from "@/components/admin/leads/lead-status-changer";
import { getLeadDetail } from "@/server/queries/leads";

export const metadata: Metadata = { title: "Detalle del lead" };
export const dynamic = "force-dynamic";

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-detail-fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="admin-detail-empty">—</span>;
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const lead = await getLeadDetail(id);
  if (!lead) notFound();

  const backHref = buildLeadsBackHref(query.back);
  const summary = buildLeadSummary(lead);
  const source = classifySource({
    utmSource: lead.utmSource ?? undefined,
    utmMedium: lead.utmMedium ?? undefined,
    utmCampaign: lead.utmCampaign ?? undefined,
    utmTerm: lead.utmTerm ?? undefined,
    utmContent: lead.utmContent ?? undefined,
    gclid: lead.gclid ?? undefined,
    landingPage: lead.landingPage ?? undefined,
    referrer: lead.referrer ?? undefined,
  });
  const hasAttribution = Boolean(
    lead.utmSource ||
    lead.utmMedium ||
    lead.utmCampaign ||
    lead.utmTerm ||
    lead.utmContent ||
    lead.gclid ||
    lead.landingPage ||
    lead.referrer,
  );

  return (
    <>
      <header className="admin-page-heading admin-detail-heading">
        <div className="admin-detail-heading__content">
          <div className="admin-detail-heading__request">
            <span>Solicitud {formatRequestNumber(lead.requestNumber)}</span>
            <Badge variant={LEAD_STATUS_BADGE_VARIANTS[lead.status]}>
              {LEAD_STATUS_LABELS[lead.status]}
            </Badge>
          </div>
          <h1>{lead.fullName}</h1>
          <p className="admin-detail-heading__meta">
            Recibida el {formatDateTimeAr(lead.createdAt)}
          </p>
          {lead.status === "LOST" && lead.lostReason ? (
            <p className="admin-detail-heading__meta">
              Motivo de pérdida: {LOST_REASON_LABELS[lead.lostReason]}
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" />
            Volver al listado
          </Link>
        </Button>
      </header>

      <section className="admin-quick-contact" aria-labelledby="quick-contact-title">
        <h2 id="quick-contact-title">Contacto rápido</h2>
        <LeadQuickActions phone={lead.phone} summary={summary} />
      </section>

      <div className="admin-detail-grid">
        <section
          className="admin-detail-panel admin-detail-management"
          aria-labelledby="management-title"
        >
          <h2 id="management-title">Gestión</h2>
          <div className="admin-detail-management__status">
            <h3>Cambiar estado</h3>
            <LeadStatusChanger key={lead.status} leadId={lead.id} currentStatus={lead.status} />
          </div>
          <div className="admin-detail-management__whatsapp">
            <h3>Derivado a WhatsApp</h3>
            {lead.whatsappClickedAt ? (
              <p>Sí, el {formatDateTimeAr(lead.whatsappClickedAt)}</p>
            ) : (
              <p className="admin-detail-muted">Todavía no abrió el chat.</p>
            )}
          </div>
        </section>

        <div className="admin-detail-primary">
          <section className="admin-detail-panel" aria-labelledby="contact-title">
            <h2 id="contact-title">Contacto</h2>
            <dl className="admin-detail-facts">
              <DetailItem label="Nombre y apellido">{lead.fullName}</DetailItem>
              <DetailItem label="Teléfono">{formatPhoneForDisplay(lead.phone)}</DetailItem>
              <DetailItem label="Email">{lead.email}</DetailItem>
              <DetailItem label="DNI">{lead.dni}</DetailItem>
            </dl>
          </section>

          <section className="admin-detail-panel" aria-labelledby="vehicle-title">
            <h2 id="vehicle-title">Vehículo</h2>
            <dl className="admin-detail-facts">
              <DetailItem label="Tipo">{lead.vehicleType === "AUTO" ? "Auto" : "Moto"}</DetailItem>
              <DetailItem label="Marca">{lead.brandName}</DetailItem>
              <DetailItem label="Modelo">{lead.modelName}</DetailItem>
              <DetailItem label="Año">{lead.year}</DetailItem>
              <DetailItem label="Patente">
                {lead.isZeroKm ? "0 km" : (lead.plate ?? <EmptyValue />)}
              </DetailItem>
              <DetailItem label="GNC">
                {lead.vehicleType === "MOTO" ? <EmptyValue /> : lead.hasGnc ? "Sí" : "No"}
              </DetailItem>
              <DetailItem label="Tipo de uso">{USAGE_LABELS[lead.usage]}</DetailItem>
              <DetailItem label="Código postal">{lead.postalCode}</DetailItem>
            </dl>
          </section>

          <section className="admin-detail-consent" aria-labelledby="consent-title">
            <h2 id="consent-title">Consentimiento</h2>
            <p>Aceptó la política de privacidad el {formatDateTimeAr(lead.consentAt)}.</p>
          </section>
        </div>

        <section
          className="admin-detail-panel admin-detail-timeline"
          aria-labelledby="timeline-title"
        >
          <h2 id="timeline-title">Historial de estados</h2>
          <ol className="admin-timeline">
            {lead.statusChanges.map((change) => (
              <li key={change.id} className="admin-timeline__item">
                <p className="admin-timeline__transition">
                  <span>
                    {change.fromStatus ? LEAD_STATUS_LABELS[change.fromStatus] : "Alta del lead"}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span>{LEAD_STATUS_LABELS[change.toStatus]}</span>
                </p>
                <p className="admin-timeline__meta">
                  {change.changedByEmail ?? "Sistema"} · {formatDateTimeAr(change.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <details className="admin-attribution">
        <summary>
          <span>
            <strong>Origen de la consulta</strong>
            <small>Origen clasificado: {source}</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="admin-attribution__content">
          <dl className="admin-detail-facts">
            <DetailItem label="Página de entrada">{lead.landingPage ?? <EmptyValue />}</DetailItem>
            <DetailItem label="Referrer">{lead.referrer ?? <EmptyValue />}</DetailItem>
            <DetailItem label="gclid">{lead.gclid ?? <EmptyValue />}</DetailItem>
            <DetailItem label="utm_source">{lead.utmSource ?? <EmptyValue />}</DetailItem>
            <DetailItem label="utm_medium">{lead.utmMedium ?? <EmptyValue />}</DetailItem>
            <DetailItem label="utm_campaign">{lead.utmCampaign ?? <EmptyValue />}</DetailItem>
            <DetailItem label="utm_term">{lead.utmTerm ?? <EmptyValue />}</DetailItem>
            <DetailItem label="utm_content">{lead.utmContent ?? <EmptyValue />}</DetailItem>
          </dl>
          {hasAttribution ? null : (
            <p className="admin-detail-muted">Sin datos de atribución: el lead llegó directo.</p>
          )}
        </div>
      </details>
    </>
  );
}
