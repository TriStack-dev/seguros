import { formatDateTimeAr } from "@/lib/format";

export type LeadNoteItem = {
  id: string;
  body: string;
  authorEmail: string;
  createdAt: Date;
};

/**
 * Notas del lead, de la más vieja a la más nueva.
 *
 * El cuerpo se renderiza siempre como texto de React: una nota con `<script>` o `<b>` se ve
 * literal y nunca se interpreta como HTML.
 */
export function LeadNoteList({ notes }: { notes: LeadNoteItem[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay notas en este lead.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {notes.map((note) => (
        <li key={note.id} className="border-l-2 border-border pl-3">
          <p className="text-xs text-muted-foreground">
            {note.authorEmail} · {formatDateTimeAr(note.createdAt)}
          </p>
          <p className="mt-1 text-sm break-words whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ol>
  );
}
