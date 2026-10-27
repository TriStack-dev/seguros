import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Rutas de /admin accesibles sin sesión. Todo lo demás de /admin la exige. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/recuperar", "/admin/auth/callback"];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Proxy del panel (step 15): refresca la sesión de Supabase, redirige a /admin/login toda
 * ruta /admin/* sin sesión, y marca /admin como noindex y sin caché (para que "atrás" no
 * muestre contenido tras cerrar sesión).
 *
 * TODO step 12 (atribución): este archivo exporta UN solo `proxy`. Cuando exista la lógica de
 * atribución, sumarla como otra rama de esta función (por ejemplo `if (!pathname.startsWith("/admin"))
 * return handleAttribution(request)`) y ampliar `config.matcher` para que cubra las rutas públicas.
 * No crear un segundo archivo: Next solo carga uno.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const { response, user } = await updateSession(request);

  let result = response;
  if (!user && !isPublicAdminPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    result = NextResponse.redirect(loginUrl);
    // Conservar las cookies de sesión que haya actualizado Supabase.
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
  }

  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  result.headers.set("Cache-Control", "no-store");
  return result;
}

// Hoy solo /admin. Con la atribución (step 12) se amplía a las rutas públicas.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
