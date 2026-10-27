import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador. Solo usa la clave publicable.
 * Hoy el panel hace todo por Server Actions; queda listo para quien lo necesite.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
