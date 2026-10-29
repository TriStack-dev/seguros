import Link from "next/link";
import "@/app/admin/admin.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Contenedor común de las pantallas de acceso del panel. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-auth">
      <main className="flex min-h-svh items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">
              <Link href="/" className="underline-offset-4 hover:underline">
                MiSeguro
              </Link>{" "}
              · Panel
            </p>
            <CardTitle className="text-2xl">
              <h1>{title}</h1>
            </CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
