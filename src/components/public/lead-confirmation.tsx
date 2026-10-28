"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

import { track } from "@/lib/analytics/track";
import type { VehicleType } from "@/lib/constants";

type Props = {
  vehicleType: VehicleType;
  leadId: string;
  requestNumber: string;
  whatsappUrl: string;
  onNewQuote: () => void;
};

function formatBrokerPhone(whatsappUrl: string) {
  const digits = new URL(whatsappUrl).pathname.replace(/\D/g, "");
  if (digits.startsWith("549") && digits.length === 13) {
    const nationalNumber = digits.slice(3);
    return `+54 9 ${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4, 6)}-${nationalNumber.slice(6)}`;
  }
  return `+${digits}`;
}

export function LeadConfirmation({
  vehicleType,
  leadId,
  requestNumber,
  whatsappUrl,
  onNewQuote,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const phone = formatBrokerPhone(whatsappUrl);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, []);

  const trackClick = () => {
    track("whatsapp_click", { vehicle_type: vehicleType, request_number: requestNumber });
    try {
      navigator.sendBeacon(`/api/leads/${encodeURIComponent(leadId)}/whatsapp`);
    } catch {
      // Tracking is best-effort; the WhatsApp link must remain a direct navigation.
    }
  };

  return (
    <section className="lead-form lead-confirmation" aria-labelledby="lead-confirmation-heading">
      <h2 id="lead-confirmation-heading" ref={headingRef} tabIndex={-1}>
        ¡Listo! Recibimos tu solicitud
      </h2>
      <p>
        Tu número de solicitud es <strong>{requestNumber}</strong>.
      </p>
      <a
        className="quote-button inline-flex w-full items-center justify-center"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClick}
      >
        Abrir WhatsApp
      </a>
      <p>Si WhatsApp no se abre, escribinos al {phone} e indicá tu número de solicitud.</p>
      <Button type="button" variant="outline" onClick={onNewQuote}>
        Cargar otra cotización
      </Button>
    </section>
  );
}
