import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/auth-card";
import { LoginForm } from "@/components/admin/login-form";
import { safeAdminRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? safeAdminRedirect(next) : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(nextPath ?? "/admin/leads");

  return (
    <AuthCard title="Ingresá al panel" description="Acceso solo para administradores.">
      <LoginForm next={nextPath} />
    </AuthCard>
  );
}
