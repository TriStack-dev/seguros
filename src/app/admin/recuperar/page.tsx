import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { ResetRequestForm } from "@/components/admin/reset-request-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default async function RecoverPage({ searchParams }: PageProps<"/admin/recuperar">) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Recuperá tu contraseña"
      description="Ingresá tu email y te enviamos un enlace para definir una nueva."
    >
      {error ? (
        <p role="alert" className="mb-4 text-sm text-destructive">
          El enlace no es válido o venció. Pedí uno nuevo.
        </p>
      ) : null}
      <ResetRequestForm />
    </AuthCard>
  );
}
