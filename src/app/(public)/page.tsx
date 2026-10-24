import Image from "next/image";
import {
  ArrowRight,
  CarFront,
  MessageCircle,
  ShieldCheck,
  Bike,
  Building2,
  ClipboardList,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landingContent as content } from "@/content/landing";

const benefitIcons = [MessagesSquare, Building2, CarFront];

export default function LandingPage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <Image
          className="hero-image"
          src="/images/landing-vehicles.webp"
          alt=""
          fill
          sizes="100vw"
          preload
          quality={80}
        />
        <div className="hero-shade" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">
              {content.hero.title} <span>{content.hero.emphasis}</span>
            </h1>
            <p>{content.hero.description}</p>
            <div className="hero-actions">
              <Button asChild className="quote-button">
                <a href="#cotizar">
                  {content.quoteCta}
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <a className="secondary-link" href="#como-funciona">
                {content.hero.secondaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </a>
            </div>
          </div>
          <section id="cotizar" className="quote-placeholder" aria-labelledby="quote-title">
            <h2 id="quote-title">{content.quote.title}</h2>
            <p>{content.quote.description}</p>
            <div className="vehicle-label">
              <CarFront aria-hidden="true" />
              <span>{content.quote.vehicleLabel}</span>
              <Bike aria-hidden="true" />
            </div>
            <div className="placeholder-space">
              <ClipboardList aria-hidden="true" size={36} strokeWidth={1.4} />
              <h3>{content.quote.placeholderTitle}</h3>
              <p>{content.quote.placeholderDescription}</p>
            </div>
            <p className="quote-note">
              <MessageCircle aria-hidden="true" size={20} />
              <span>{content.quote.note}</span>
            </p>
          </section>
          <ul className="hero-highlights">
            {content.hero.highlights.map((text) => (
              <li key={text}>
                <ShieldCheck aria-hidden="true" size={20} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="como-funciona" className="section-block" aria-labelledby="process-title">
        <div className="site-container">
          <div className="section-intro">
            <h2 id="process-title">{content.process.title}</h2>
            <p>{content.process.description}</p>
          </div>
          <ol className="process-grid">
            {content.process.steps.map((step, index) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="beneficios"
        className="section-block benefits-section"
        aria-labelledby="benefits-title"
      >
        <div className="site-container benefits-grid">
          <div className="section-intro">
            <h2 id="benefits-title">{content.benefits.title}</h2>
            <p>{content.benefits.description}</p>
          </div>
          <ul className="benefits-list">
            {content.benefits.items.map((item, index) => {
              const Icon = benefitIcons[index] ?? ShieldCheck;
              return (
                <li key={item.title}>
                  <Icon aria-hidden="true" size={26} strokeWidth={1.5} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section-block" aria-labelledby="trust-title">
        <div className="site-container trust-grid">
          <div className="section-intro">
            <h2 id="trust-title">{content.trust.title}</h2>
            <p>{content.trust.description}</p>
            <dl className="producer-details">
              <dt>{content.trust.producerLabel}</dt>
              <dd>{content.trust.producer}</dd>
              <dd>{content.trust.license}</dd>
            </dl>
          </div>
          <div className="reviews-placeholder">
            <MessagesSquare aria-hidden="true" size={32} strokeWidth={1.4} />
            <h3>{content.trust.reviewsTitle}</h3>
            <p>{content.trust.reviewsDescription}</p>
          </div>
        </div>
      </section>

      <section
        id="preguntas-frecuentes"
        className="section-block faq-section"
        aria-labelledby="faq-title"
      >
        <div className="site-container faq-grid">
          <div className="section-intro">
            <h2 id="faq-title">{content.faq.title}</h2>
            <p>{content.faq.description}</p>
          </div>
          <Accordion type="single" collapsible className="faq-accordion">
            {content.faq.items.map((item, index) => (
              <AccordionItem key={item.question} value={`question-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}
