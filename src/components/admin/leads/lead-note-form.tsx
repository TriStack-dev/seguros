"use client";

import { useRef, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_NOTE_MAX_LENGTH, normalizeNoteBody, validateNoteBody } from "@/lib/leads/note";
import { addLeadNote } from "@/server/actions/lead-note";

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const length = body.length;
  const remaining = LEAD_NOTE_MAX_LENGTH - length;

  function submit() {
    const validationError = validateNoteBody(body);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await addLeadNote({ leadId, body: normalizeNoteBody(body) });

      if (!result.ok) {
        setError(result.message);
        toast.error(result.message);
        return;
      }

      // La nota nueva ya viene en la respuesta de la acción (revalidatePath).
      setBody("");
      textareaRef.current?.focus();
      toast.success("Nota agregada.");
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-note">Nueva nota</Label>
        <Textarea
          id="lead-note"
          ref={textareaRef}
          name="body"
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Qué se le cotizó, cuándo volver a llamarlo…"
          rows={4}
          disabled={isPending}
          aria-invalid={error ? true : undefined}
          aria-describedby="lead-note-help"
        />
        <p
          id="lead-note-help"
          className={remaining < 0 ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
          aria-live="polite"
          data-testid="lead-note-counter"
        >
          {remaining >= 0
            ? `${length} de ${LEAD_NOTE_MAX_LENGTH} caracteres`
            : `${Math.abs(remaining)} caracteres de más`}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          {isPending ? "Guardando…" : "Agregar nota"}
        </Button>
      </div>
    </form>
  );
}
