import { z } from "zod";
import { db } from "@/lib/db";

const leadIdSchema = z.string().uuid();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  let allowed = fetchSite === "same-origin" || origin !== null;
  if (fetchSite === "cross-site") allowed = false;
  if (origin) {
    try {
      allowed = allowed && new URL(origin).origin === new URL(request.url).origin;
    } catch {
      allowed = false;
    }
  }

  if (allowed) {
    try {
      const { id } = await context.params;
      const parsedId = leadIdSchema.safeParse(id);
      if (parsedId.success) {
        await db.lead.updateMany({
          where: { id: parsedId.data, whatsappClickedAt: null },
          data: { whatsappClickedAt: new Date() },
        });
      }
    } catch {
      // The beacon is intentionally non-observable, including on database errors.
    }
  }

  return new Response(null, { status: 204 });
}
