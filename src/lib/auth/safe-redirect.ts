/**
 * Devuelve `next` solo si es una ruta interna del panel (`/admin/...`). Evita open redirects
 * (`//evil.com`, `https://...`, `/\evil.com`). Si no es válido, devuelve `fallback`.
 */
export const DEFAULT_ADMIN_REDIRECT = "/admin/leads";

export function safeAdminRedirect(
  next: string | null | undefined,
  fallback: string = DEFAULT_ADMIN_REDIRECT,
): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/admin")) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;
  // Después de "/admin" tiene que venir el fin, otra barra, "?" o "#": no "/administrador".
  if (!/^\/admin($|[/?#])/.test(next)) return fallback;
  // Caracteres de control o espacios que algunos navegadores normalizan.
  if (/[\u0000-\u001f\u007f\s]/.test(next)) return fallback;
  return next;
}
