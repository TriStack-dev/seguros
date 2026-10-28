import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classifySource } from "@/lib/attribution/classify-source";
import { LOST_REASON_LABELS, USAGE_LABELS } from "@/lib/constants";
import { formatDateTimeAr } from "@/lib/format";
import { buildLeadsBackHref } from "@/lib/leads/list-query";
import { formatRequestNumber } from "@/lib/leads/request-number";
import { LEAD_STATUS_BADGE_VARIANTS, LEAD_STATUS_LABELS } from "@/lib/leads/status";
import { buildLeadSummary } from "@/lib/leads/summary";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";
import { LeadNoteForm } from "@/components/admin/leads/lead-note-form";
import { LeadNoteList } from "@/components/admin/leads/lead-note-list";
import { LeadQuickActions } from "@/components/admin/leads/lead-quick-actions";
import { LeadStatusChanger } from "@/components/admin/leads/lead-status-changer";
import { getLeadDetail } from "@/server/queries/leads";

export const metadata: Metadata = { title: "Detalle del lead" };
export const dynamic = "force-dynamic";

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="text-muted-foreground">—</span>;
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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{formatRequestNumber(lead.requestNumber)}</h1>
            <Badge variant={LEAD_STATUS_BADGE_VARIANTS[lead.status]}>
              {LEAD_STATUS_LABELS[lead.status]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{lead.fullName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Recibido el {formatDateTimeAr(lead.createdAt)}
          </p>
          {lead.status === "LOST" && lead.lostReason ? (
            <p className="mt-1 text-sm text-muted-foreground">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacto rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadQuickActions phone={lead.phone} summary={summary} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del lead</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <section>
                <h3 className="mb-3 text-sm font-medium">Contacto</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Nombre y apellido">{lead.fullName}</DetailItem>
                  <DetailItem label="Teléfono">{formatPhoneForDisplay(lead.phone)}</DetailItem>
                  <DetailItem label="Email">{lead.email}</DetailItem>
                  <DetailItem label="DNI">{lead.dni}</DetailItem>
                </dl>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-medium">Vehículo</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Tipo">
                    {lead.vehicleType === "AUTO" ? "Auto" : "Moto"}
                  </DetailItem>
                  <DetailItem label="Marca">{lead.brandName}</DetailItem>
                  <DetailItem label="Modelo">{lead.modelName}</DetailItem>
                  <DetailItem label="Año">{lead.year}</DetailItem>
                  <DetailItem label="Patente">
                    {lead.isZeroKm ? "0 km" : (lead.plate ?? <EmptyValue />)}
                  </DetailItem>
                  <DetailItem label="GNC">
                    {lead.vehicleType === "MOTO" ? <EmptyValue /> : lead.hasGnc ? "Sí" : "No"}
                  </DetailItem>
                </dl>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-medium">Uso y código postal</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Tipo de uso">{USAGE_LABELS[lead.usage]}</DetailItem>
                  <DetailItem label="Código postal">{lead.postalCode}</DetailItem>
                </dl>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-medium">Consentimiento</h3>
                <p className="text-sm">
                  Aceptó la política de privacidad el {formatDateTimeAr(lead.consentAt)}.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <LeadNoteForm leadId={lead.id} />
              <LeadNoteList notes={lead.notes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origen</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Origen clasificado">
                  <Badge variant="outline">{source}</Badge>
                </DetailItem>
                <DetailItem label="Página de entrada">
                  {lead.landingPage ?? <EmptyValue />}
                </DetailItem>
                <DetailItem label="Referrer">{lead.referrer ?? <EmptyValue />}</DetailItem>
                <DetailItem label="gclid">{lead.gclid ?? <EmptyValue />}</DetailItem>
                <DetailItem label="utm_source">{lead.utmSource ?? <EmptyValue />}</DetailItem>
                <DetailItem label="utm_medium">{lead.utmMedium ?? <EmptyValue />}</DetailItem>
                <DetailItem label="utm_campaign">{lead.utmCampaign ?? <EmptyValue />}</DetailItem>
                <DetailItem label="utm_term">{lead.utmTerm ?? <EmptyValue />}</DetailItem>
                <DetailItem label="utm_content">{lead.utmContent ?? <EmptyValue />}</DetailItem>
              </dl>
              {hasAttribution ? null : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Sin datos de atribución: el lead llegó directo.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar estado</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStatusChanger key={lead.status} leadId={lead.id} currentStatus={lead.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Derivado a WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.whatsappClickedAt ? (
                <p className="text-sm">Sí, el {formatDateTimeAr(lead.whatsappClickedAt)}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Todavía no abrió el chat.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de estados</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-4">
                {lead.statusChanges.map((change) => (
                  <li key={change.id} className="border-l-2 border-border pl-3">
                    <p className="text-sm font-medium">
                      {change.fromStatus ? LEAD_STATUS_LABELS[change.fromStatus] : "Alta del lead"}{" "}
                      → {LEAD_STATUS_LABELS[change.toStatus]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {change.changedByEmail ?? "Sistema"} · {formatDateTimeAr(change.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
