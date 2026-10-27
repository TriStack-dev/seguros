import type { Attribution } from "./types";

export type AttributionSource =
  | "Campaña"
  | "Campaña (otra)"
  | "Orgánico"
  | "Referido"
  | "Directo";

const PAID_MEDIUMS = ["cpc", "ppc", "paid"];

const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo."];

export function classifySource(attribution: Attribution | null | undefined): AttributionSource {
  if (!attribution) return "Directo";

  if (attribution.gclid) return "Campaña";
  if (attribution.utmMedium && PAID_MEDIUMS.includes(attribution.utmMedium.toLowerCase())) {
    return "Campaña";
  }
  if (attribution.utmSource || attribution.utmMedium || attribution.utmCampaign) {
    return "Campaña (otra)";
  }

  if (attribution.referrer) {
    const refLower = attribution.referrer.toLowerCase();
    if (SEARCH_ENGINES.some((engine) => refLower.includes(engine))) {
      return "Orgánico";
    }
    return "Referido";
  }

  return "Directo";
}
