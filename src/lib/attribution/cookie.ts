import type { Attribution } from "./types";

export const ATTRIBUTION_COOKIE = "ms_attr";

const MAX_ATTR_LENGTH = 255;

function truncate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (value.length <= MAX_ATTR_LENGTH) return value;
  return value.slice(0, MAX_ATTR_LENGTH);
}

export function serializeAttribution(attr: Attribution): string {
  const clean: Attribution = {
    utmSource: truncate(attr.utmSource),
    utmMedium: truncate(attr.utmMedium),
    utmCampaign: truncate(attr.utmCampaign),
    utmTerm: truncate(attr.utmTerm),
    utmContent: truncate(attr.utmContent),
    gclid: truncate(attr.gclid),
    landingPage: truncate(attr.landingPage),
    referrer: truncate(attr.referrer),
  };
  return JSON.stringify(clean);
}

export function parseAttributionCookie(raw?: string | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Attribution;
    if (typeof parsed !== "object" || parsed === null) return null;
    const clean: Attribution = {
      utmSource: truncate(parsed.utmSource),
      utmMedium: truncate(parsed.utmMedium),
      utmCampaign: truncate(parsed.utmCampaign),
      utmTerm: truncate(parsed.utmTerm),
      utmContent: truncate(parsed.utmContent),
      gclid: truncate(parsed.gclid),
      landingPage: truncate(parsed.landingPage),
      referrer: truncate(parsed.referrer),
    };
    if (
      !clean.utmSource &&
      !clean.utmMedium &&
      !clean.utmCampaign &&
      !clean.utmTerm &&
      !clean.utmContent &&
      !clean.gclid &&
      !clean.landingPage &&
      !clean.referrer
    ) {
      return null;
    }
    return clean;
  } catch {
    return null;
  }
}

export function getAttributionCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: isSecure,
  };
}
