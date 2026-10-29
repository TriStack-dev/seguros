import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/auth";
import { signOut } from "@/server/actions/auth";
import { countNewLeads } from "@/server/queries/leads";
import "../admin.css";
import { AdminNavigation } from "@/components/admin/admin-navigation";

// Siempre dinámico y sin caché: tras cerrar sesión, "atrás" no tiene que mostrar contenido.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const newLeadsCount = await countNewLeads();

  return (
    <div className="admin-shell">
      <a className="admin-skip-link" href="#admin-main">
        Saltar al contenido
      </a>
      <header className="admin-header">
        <div className="admin-header__inner">
          <Link
            href="/admin/leads"
            className="admin-brand"
            aria-label="MiSeguro, panel de administración"
          >
            <span className="admin-brand__mark" aria-hidden="true">
              M
            </span>
            <span>
              <strong>MiSeguro</strong>
              <small>Panel de gestión</small>
            </span>
          </Link>
          <AdminNavigation newLeadsCount={newLeadsCount} />
          <div className="admin-account">
            <span className="admin-account__email" title={admin.email}>
              {admin.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="admin-signout">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main id="admin-main" tabIndex={-1} className="admin-main">
        {children}
      </main>
    </div>
  );
}
