import { NextResponse, type NextRequest } from "next/server";
import { safeAdminRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/** Canjea el código del enlace de recuperación por una sesión y sigue a `next`. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeAdminRedirect(searchParams.get("next"), "/admin/nueva-contrasena");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/admin/recuperar?error=link", origin));
}
