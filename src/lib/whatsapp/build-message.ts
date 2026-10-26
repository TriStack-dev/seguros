import { USAGE_LABELS } from "@/lib/constants";
import type { LeadFormData } from "@/lib/validation/lead-form";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";
import { renderWhatsappTemplate } from "@/lib/whatsapp/message-template";

/** Datos normalizados del lead (step 06) más los campos que resuelve quien crea el lead. */
export type WhatsappLeadData = LeadFormData & {
  /** Teléfono normalizado `549...`; el formulario lo calcula al validar. */
  phone: string;
  /** Número autoincremental de la base. */
  requestNumber: number;
  /** Nombre de la marca resuelto (del catálogo o el texto libre de "Otro"). */
  brandName: string;
  /** Nombre del modelo resuelto (del catálogo o el texto libre de "Otro"). */
  modelName: string;
};

/** `123` → `MS-000123`; con más de 6 dígitos se muestra completo (`MS-1234567`). */
export function formatRequestNumber(requestNumber: number): string {
  return `MS-${String(requestNumber).padStart(6, "0")}`;
}

export function buildWhatsappMessage(data: WhatsappLeadData): string {
  const vehicle = [data.brandName, data.modelName, data.version, String(data.year)]
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "")
    .join(" ");

  const plate = data.isZeroKm ? "0 km" : (data.plateNormalized ?? data.plate ?? "").trim();

  return renderWhatsappTemplate({
    vehicleKind: data.vehicleType === "AUTO" ? "auto" : "moto",
    requestNumber: formatRequestNumber(data.requestNumber),
    fullName: data.fullName,
    dni: data.dni,
    phone: formatPhoneForDisplay(data.phone),
    email: data.email,
    vehicle,
    plate,
    // En motos no hay GNC: el marcador vacío omite la línea.
    gnc: data.vehicleType === "AUTO" ? (data.hasGnc === true ? "Sí" : "No") : "",
    usage: USAGE_LABELS[data.usage],
    postalCode: data.postalCode,
  });
}
