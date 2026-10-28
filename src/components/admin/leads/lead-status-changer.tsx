"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOST_REASONS, LOST_REASON_LABELS, type LostReason } from "@/lib/constants";
import { LEAD_STATUS_LABELS, allowedTransitions } from "@/lib/leads/status";
import type { LeadStatus } from "@/generated/prisma/client";
import { changeLeadStatus } from "@/server/actions/lead-status";

export function LeadStatusChanger({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const transitions = allowedTransitions(currentStatus);
  const [toStatus, setToStatus] = useState<LeadStatus | "">(transitions[0] ?? "");
  const [lostReason, setLostReason] = useState<LostReason | "none">("none");

  function submit() {
    if (!toStatus) return;

    startTransition(async () => {
      const result = await changeLeadStatus({
        leadId,
        fromStatus: currentStatus,
        toStatus,
        lostReason: toStatus === "LOST" && lostReason !== "none" ? lostReason : null,
      });

      if (!result.ok) {
        toast.error(result.message);
        if (result.code === "conflict") router.refresh();
        return;
      }

      toast.success(`Estado actualizado a ${LEAD_STATUS_LABELS[toStatus]}.`);
      setToStatus("");
      setLostReason("none");
      router.refresh();
    });
  }

  if (transitions.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay cambios de estado disponibles.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="target-status">Nuevo estado</Label>
        <Select
          value={toStatus}
          onValueChange={(value) => setToStatus(value as LeadStatus)}
          disabled={isPending}
        >
          <SelectTrigger id="target-status" className="w-full">
            <SelectValue placeholder="Elegí un estado" />
          </SelectTrigger>
          <SelectContent>
            {transitions.map((status) => (
              <SelectItem key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {toStatus === "LOST" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="lost-reason">Motivo (opcional)</Label>
          <Select
            value={lostReason}
            onValueChange={(value) => setLostReason(value as LostReason | "none")}
            disabled={isPending}
          >
            <SelectTrigger id="lost-reason" className="w-full">
              <SelectValue placeholder="Sin motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin motivo</SelectItem>
              {LOST_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {LOST_REASON_LABELS[reason]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="button" onClick={submit} disabled={isPending || !toStatus}>
        {isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {isPending ? "Guardando…" : "Guardar cambio"}
      </Button>
    </div>
  );
}
