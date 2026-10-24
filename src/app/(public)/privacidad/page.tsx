import Link from "next/link";
import { privacyContent as content } from "@/content/privacy";

export default function PrivacyPage() {
  return (
    <main id="contenido" tabIndex={-1} className="site-container privacy-page">
      <Link href="/" className="privacy-back">
        Volver al inicio
      </Link>
      <article aria-labelledby="privacy-title">
        <header className="privacy-intro">
          <h1 id="privacy-title">{content.title}</h1>
          <p>{content.introduction}</p>
        </header>
        {content.draft && (
          <aside className="privacy-draft" aria-labelledby="draft-title">
            <h2 id="draft-title">{content.draftTitle}</h2>
            <p>{content.draftDescription}</p>
          </aside>
        )}
        <nav className="privacy-contents" aria-label="Contenido de la política">
          <h2>En esta política</h2>
          <ul>
            {content.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="privacy-section"
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.id === "autoridad" && (
              <ul className="privacy-sources">
                {content.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href}>{source.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </main>
  );
}
