import { z } from "zod";

import { getVehicleModels } from "@/server/queries/vehicles";

const querySchema = z.object({
  brandIds: z.tuple([z.uuid()]),
});

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({ brandIds: searchParams.getAll("brandId") });

  if (!parsed.success) {
    return Response.json(
      { error: "Seleccioná una marca válida" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const models = await getVehicleModels(parsed.data.brandIds[0]);
    return Response.json(models, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return Response.json(
      { error: "No pudimos cargar los modelos. Probá de nuevo." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
