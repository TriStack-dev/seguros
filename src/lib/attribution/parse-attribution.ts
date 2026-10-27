import type { Attribution } from "./types";

const MAX_ATTR_LENGTH = 255;

function truncate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  if (trimmed.length <= MAX_ATTR_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_ATTR_LENGTH);
}

function isExternalReferrer(referrer: string | null | undefined, currentHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const refUrl = new URL(referrer);
    if (refUrl.hostname === currentHost) return undefined;
    return truncate(referrer);
  } catch {
    return undefined;
  }
}

export function parseAttributionFromUrl(url: URL, referrerHeader?: string | null): Attribution {
  const params = url.searchParams;
  const hasUtmOrGclid =
    params.has("utm_source") ||
    params.has("utm_medium") ||
    params.has("utm_campaign") ||
    params.has("utm_term") ||
    params.has("utm_content") ||
    params.has("gclid");

  const attribution: Attribution = {
    utmSource: truncate(params.get("utm_source")),
    utmMedium: truncate(params.get("utm_medium")),
    utmCampaign: truncate(params.get("utm_campaign")),
    utmTerm: truncate(params.get("utm_term")),
    utmContent: truncate(params.get("utm_content")),
    gclid: truncate(params.get("gclid")),
    landingPage: truncate(url.pathname + (url.search || "")),
  };

  if (hasUtmOrGclid) {
    attribution.referrer = isExternalReferrer(referrerHeader, url.hostname);
  } else {
    attribution.referrer = isExternalReferrer(referrerHeader, url.hostname);
  }

  return attribution;
}

export function hasAttributionParams(url: URL): boolean {
  const params = url.searchParams;
  return (
    params.has("utm_source") ||
    params.has("utm_medium") ||
    params.has("utm_campaign") ||
    params.has("utm_term") ||
    params.has("utm_content") ||
    params.has("gclid")
  );
}
