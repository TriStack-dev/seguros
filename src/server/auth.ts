import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string };

/**
 * Exige un administrador autenticado. Usa getUser() (valida el token contra Supabase Auth),
 * nunca getSession(). Sin usuario redirige al login. Devuelve { id, email } para registrar
 * quién hizo cada cambio. Hay un solo rol: todo usuario de Auth es administrador, porque no
 * existe registro público (enable_signup = false) y las cuentas las crea el equipo.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/admin/login");

  return { id: user.id, email: user.email ?? "" };
}
