import type { LeadStatus, LostReason, UsageType, VehicleType } from "@/generated/prisma/client";
import { classifySource } from "@/lib/attribution/classify-source";
import { LOST_REASON_LABELS, USAGE_LABELS, VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { formatDateTimeArCompact } from "@/lib/format";
import { LEAD_STATUS_LABELS } from "@/lib/leads/status";
import { formatRequestNumber } from "@/lib/leads/request-number";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";

/** Columnas del CSV, en el orden de la sección 10 de docs/reglas-negocio.md. */
export const LEAD_EXPORT_HEADERS = [
  "Número de solicitud",
  "Fecha",
  "Estado",
  "Motivo de pérdida",
  "Tipo de vehículo",
  "Nombre",
  "DNI",
  "Teléfono",
  "Email",
  "Marca",
  "Modelo",
  "Versión",
  "Año",
  "GNC",
  "Patente",
  "0 km",
  "Código postal",
  "Tipo de uso",
  "Derivado a WhatsApp",
  "Primera respuesta",
  "Origen",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "gclid",
] as const;

/** Datos del lead que necesita la exportación. */
export type LeadExportData = {
  requestNumber: number;
  createdAt: Date;
  status: LeadStatus;
  lostReason: LostReason | null;
  vehicleType: VehicleType;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  brandName: string;
  modelName: string;
  year: number;
  hasGnc: boolean | null;
  plate: string | null;
  isZeroKm: boolean;
  postalCode: string;
  usage: UsageType;
  whatsappClickedAt: Date | null;
  firstContactedAt: Date | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid: string | null;
  referrer: string | null;
};

function yesNo(value: boolean | null): string {
  if (value === null) return "";
  return value ? "Sí" : "No";
}

function optional(value: string | null): string {
  return value ?? "";
}

/** Convierte un lead en la fila del CSV, con las etiquetas en español y la fecha de Argentina. */
export function buildLeadExportRow(lead: LeadExportData): string[] {
  return [
    formatRequestNumber(lead.requestNumber),
    formatDateTimeArCompact(lead.createdAt),
    LEAD_STATUS_LABELS[lead.status],
    lead.lostReason ? LOST_REASON_LABELS[lead.lostReason] : "",
    VEHICLE_TYPE_LABELS[lead.vehicleType],
    lead.fullName,
    lead.dni,
    formatPhoneForDisplay(lead.phone),
    lead.email,
    lead.brandName,
    lead.modelName,
    "", // versión: el formulario no la pide desde el step 09 (decisión 0015)
    String(lead.year),
    yesNo(lead.hasGnc),
    optional(lead.plate),
    yesNo(lead.isZeroKm),
    lead.postalCode,
    USAGE_LABELS[lead.usage],
    yesNo(lead.whatsappClickedAt !== null),
    lead.firstContactedAt ? formatDateTimeArCompact(lead.firstContactedAt) : "",
    classifySource({
      utmSource: lead.utmSource ?? undefined,
      utmMedium: lead.utmMedium ?? undefined,
      utmCampaign: lead.utmCampaign ?? undefined,
      gclid: lead.gclid ?? undefined,
      referrer: lead.referrer ?? undefined,
    }),
    optional(lead.utmSource),
    optional(lead.utmMedium),
    optional(lead.utmCampaign),
    optional(lead.gclid),
  ];
}
