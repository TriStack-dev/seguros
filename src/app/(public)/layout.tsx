import { PublicTagManager } from "@/components/public/public-tag-manager";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { JsonLd } from "@/components/public/json-ld";
import { Button } from "@/components/ui/button";
import { business } from "@/content/business";
import { landingContent as content } from "@/content/landing";
import { buildOrganizationJsonLd } from "@/lib/seo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <JsonLd data={buildOrganizationJsonLd()} />
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <PublicTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <a className="skip-link" href="#contenido">
        {content.skipLink}
      </a>
      <header className="site-header">
        <div className="site-container header-inner">
          <Logo />
          <nav aria-label="Principal" className="desktop-navigation">
            {content.navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="quote-button">
            <Link href="/#cotizar">
              {content.quoteCta}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-container">
          <div className="footer-grid">
            <div>
              <Logo />
              <p>{content.footer.description}</p>
            </div>
            <div>
              <h2>{content.footer.contactLabel}</h2>
              <p>{business.producerName}</p>
              <p>{business.license}</p>
              <p>{business.phone}</p>
              <p>{business.email}</p>
              <p>{business.hours}</p>
            </div>
            <div>
              <h2>{content.footer.addressLabel}</h2>
              <p>{business.legalName}</p>
              <p>{business.address}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} {content.brand}
            </p>
            <p>{business.provisionalNote}</p>
            <Link href="/privacidad">{content.footer.privacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
