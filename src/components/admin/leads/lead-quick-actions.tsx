"use client";

import { Copy, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LeadQuickActions({ phone, summary }: { phone: string; summary: string }) {
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Datos del lead copiados.");
    } catch {
      toast.error("No se pudieron copiar los datos. Probá de nuevo.");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp al lead"
        >
          <MessageCircle aria-hidden="true" />
          Escribir por WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={`tel:+${phone}`} aria-label="Llamar al lead">
          <Phone aria-hidden="true" />
          Llamar
        </a>
      </Button>
      <Button type="button" variant="outline" onClick={copySummary}>
        <Copy aria-hidden="true" />
        Copiar datos
      </Button>
    </div>
  );
}
