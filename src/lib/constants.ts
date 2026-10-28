export const VEHICLE_TYPES = ["AUTO", "MOTO"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const USAGE_TYPES = ["PARTICULAR", "COMMERCIAL", "RIDE_HAILING", "DELIVERY"] as const;
export type UsageType = (typeof USAGE_TYPES)[number];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  AUTO: "Auto",
  MOTO: "Moto",
};

export const USAGE_LABELS: Record<UsageType, string> = {
  PARTICULAR: "Particular",
  COMMERCIAL: "Comercial",
  RIDE_HAILING: "Aplicaciones de transporte (Uber, Cabify, DiDi)",
  DELIVERY: "Delivery / mensajería",
};

export const USAGE_BY_VEHICLE: Record<VehicleType, UsageType[]> = {
  AUTO: ["PARTICULAR", "COMMERCIAL", "RIDE_HAILING"],
  MOTO: ["PARTICULAR", "COMMERCIAL", "DELIVERY"],
};

export const MIN_YEAR = 1990;
export const CURRENT_YEAR_PLUS_ONE = new Date().getFullYear() + 1;

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUOTED", "ISSUED", "LOST"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LOST_REASONS = [
  "PRICE",
  "NO_RESPONSE",
  "WENT_ELSEWHERE",
  "JUST_ASKING",
  "INVALID_DATA",
  "OTHER",
] as const;
export type LostReason = (typeof LOST_REASONS)[number];

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  PRICE: "Le pareció caro",
  NO_RESPONSE: "No respondió",
  WENT_ELSEWHERE: "Contrató en otro lado",
  JUST_ASKING: "Solo estaba consultando",
  INVALID_DATA: "Datos inválidos o falsos",
  OTHER: "Otro",
};
