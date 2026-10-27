export type SubmitLeadResult =
  | { ok: true; leadId: string; requestNumber: string }
  | { ok: false; fieldErrors?: Partial<Record<string, string[]>>; message: string };

export const DATABASE_ERROR_MESSAGE =
  "No pudimos enviar tu solicitud. Probá de nuevo o escribinos por WhatsApp.";
