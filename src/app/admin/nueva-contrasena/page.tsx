import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { NewPasswordForm } from "@/components/admin/new-password-form";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function NewPasswordPage() {
  await requireAdmin();

  return (
    <AuthCard title="Definí tu nueva contraseña">
      <NewPasswordForm />
    </AuthCard>
  );
}
