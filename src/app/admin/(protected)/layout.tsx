import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/auth";
import { signOut } from "@/server/actions/auth";

const NAV = [
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
];

// Siempre dinámico y sin caché: tras cerrar sesión, "atrás" no tiene que mostrar contenido.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-semibold">MiSeguro · Panel</span>
          <nav aria-label="Panel" className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{admin.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
