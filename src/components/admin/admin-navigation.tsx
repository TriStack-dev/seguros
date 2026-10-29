"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
];

export function AdminNavigation({ newLeadsCount }: { newLeadsCount: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel" className="admin-navigation">
      {NAV.map((item) => {
        const active =
          item.href === "/admin/leads"
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="admin-navigation__link"
            aria-current={active ? "page" : undefined}
            aria-label={
              item.href === "/admin/leads" && newLeadsCount > 0
                ? `${item.label}, ${newLeadsCount} nuevos`
                : undefined
            }
          >
            <span>{item.label}</span>
            {item.href === "/admin/leads" && newLeadsCount > 0 ? (
              <span className="admin-navigation__count" aria-label={`${newLeadsCount} nuevos`}>
                {newLeadsCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
