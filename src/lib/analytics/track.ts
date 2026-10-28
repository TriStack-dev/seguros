import { USAGE_TYPES, VEHICLE_TYPES, type UsageType, type VehicleType } from "@/lib/constants";

type Events = {
  form_view: { vehicle_type?: VehicleType };
  form_start: { vehicle_type: VehicleType };
  generate_lead: { vehicle_type: VehicleType; usage: UsageType; request_number: string };
  whatsapp_click: { vehicle_type: VehicleType; request_number: string };
};

declare global {
  interface Window {
    dataLayer?: { push: (value: Record<string, unknown>) => unknown };
  }
}

/** Never spread caller data: TypeScript alone cannot strip runtime properties. */
export function track<E extends keyof Events>(event: E, params: Events[E]): void {
  if (
    typeof window === "undefined" ||
    !window.dataLayer ||
    window.location.pathname.startsWith("/admin")
  )
    return;
  const payload: Record<string, unknown> = { event };
  if (params.vehicle_type && VEHICLE_TYPES.includes(params.vehicle_type))
    payload.vehicle_type = params.vehicle_type;
  if (event === "generate_lead" && "usage" in params && USAGE_TYPES.includes(params.usage))
    payload.usage = params.usage;
  if (
    (event === "generate_lead" || event === "whatsapp_click") &&
    "request_number" in params &&
    /^MS-\d+$/.test(params.request_number)
  )
    payload.request_number = params.request_number;
  try {
    window.dataLayer.push(payload);
  } catch {
    // Analytics is best-effort and must never interrupt a quote or navigation.
  }
}
