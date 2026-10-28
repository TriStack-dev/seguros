import { USAGE_LABELS, type LeadStatus, type UsageType, type VehicleType } from "@/lib/constants";
import { formatPhoneForDisplay } from "@/lib/validation/normalizers";
import { formatRequestNumber } from "./request-number";
import { LEAD_STATUS_LABELS } from "./status";

export type LeadSummaryInput = {
  requestNumber: number;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  brandName: string;
  modelName: string;
  year: number;
  isZeroKm: boolean;
  plate: string | null;
  hasGnc: boolean | null;
  usage: UsageType;
  postalCode: string;
  status: LeadStatus;
};

/** Resumen de texto que el asesor copia al portapapeles desde el detalle. */
export function buildLeadSummary(lead: LeadSummaryInput): string {
  const vehicleTypeLabel = lead.vehicleType === "AUTO" ? "Auto" : "Moto";
  const plate = lead.isZeroKm ? "0 km" : (lead.plate ?? "—");

  const lines = [
    `Solicitud ${formatRequestNumber(lead.requestNumber)}`,
    `Nombre: ${lead.fullName}`,
    `DNI: ${lead.dni}`,
    `Teléfono: ${formatPhoneForDisplay(lead.phone)}`,
    `Email: ${lead.email}`,
    `Vehículo: ${vehicleTypeLabel} ${lead.brandName} ${lead.modelName} ${lead.year}`,
    `Patente: ${plate}`,
  ];

  if (lead.vehicleType === "AUTO") {
    lines.push(`GNC: ${lead.hasGnc ? "Sí" : "No"}`);
  }

  lines.push(
    `Uso: ${USAGE_LABELS[lead.usage]}`,
    `Código postal: ${lead.postalCode}`,
    `Estado: ${LEAD_STATUS_LABELS[lead.status]}`,
  );

  return lines.join("\n");
}
