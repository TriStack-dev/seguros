import Link from "next/link";
import { landingContent } from "@/content/landing";

/** Identidad [PROVISORIO]: reemplazar este componente al confirmar la marca. */
export function Logo() {
  return (
    <Link className="brand-logo" href="/" aria-label={`${landingContent.brand} — inicio`}>
      {landingContent.brandSegments[0]}
      <span>{landingContent.brandSegments[1]}</span>
    </Link>
  );
}
