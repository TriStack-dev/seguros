import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import {
  ATTRIBUTION_COOKIE,
  getAttributionCookieOptions,
  hasAttributionParams,
  parseAttributionFromUrl,
  serializeAttribution,
  type Attribution,
} from "@/lib/attribution";

/** Rutas de /admin accesibles sin sesión. Todo lo demás de /admin la exige. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/recuperar", "/admin/auth/callback"];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function getExternalReferrer(request: NextRequest): string | null {
  const referrer = request.headers.get("referer") || request.headers.get("referrer");
  if (!referrer) return null;
  try {
    const refUrl = new URL(referrer);
    if (refUrl.hostname === request.nextUrl.hostname) return null;
    return referrer;
  } catch {
    return null;
  }
}

function handleAttribution(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const existingCookie = request.cookies.get(ATTRIBUTION_COOKIE)?.value;
  const hasParams = hasAttributionParams(request.nextUrl);
  const externalReferrer = getExternalReferrer(request);

  let attributionToSet: Attribution | null = null;

  if (hasParams) {
    attributionToSet = parseAttributionFromUrl(request.nextUrl, externalReferrer);
  } else if (!existingCookie) {
    const landingPage = request.nextUrl.pathname + (request.nextUrl.search || "");
    const attr: Attribution = {
      landingPage: landingPage.length > 255 ? landingPage.slice(0, 255) : landingPage,
    };
    if (externalReferrer) {
      attr.referrer = externalReferrer.length > 255 ? externalReferrer.slice(0, 255) : externalReferrer;
    }
    if (attr.landingPage || attr.referrer) {
      attributionToSet = attr;
    }
  }

  if (!attributionToSet) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const isSecure = request.nextUrl.protocol === "https:";
  response.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attributionToSet), getAttributionCookieOptions(isSecure));
  return response;
}

async function handleAdminProtection(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  let result = response;
  if (!user && !isPublicAdminPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    result = NextResponse.redirect(loginUrl);
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
  }

  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  result.headers.set("Cache-Control", "no-store");
  return result;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    return handleAdminProtection(request);
  }
  return handleAttribution(request);
}

export const config = {
  matcher: [
    "/",
    "/cotizar/:path*",
    "/privacidad",
    "/admin",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
