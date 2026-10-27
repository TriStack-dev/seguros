"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { formatRequestNumber } from "@/lib/leads/request-number";
import { DATABASE_ERROR_MESSAGE, type SubmitLeadResult } from "@/lib/leads/submit-result";
import { leadFormSchema, type LeadFormData, type LeadFormInput } from "@/lib/validation/lead-form";
import { parseAttributionCookie } from "@/lib/attribution";

const fakeSuccess: SubmitLeadResult = {
  ok: true,
  leadId: "discarded",
  requestNumber: "MS-000000",
};

export async function submitLead(input: LeadFormInput): Promise<SubmitLeadResult> {
  // Keep spam submissions indistinguishable from successful ones and never persist them.
  if (typeof input?.website === "string" && input.website.trim() !== "") return fakeSuccess;

  const parsed = leadFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisá los datos ingresados.",
    };
  }

  const data = parsed.data as LeadFormData;
  const brandId = data.brandId?.trim() || null;
  const modelId = brandId ? data.modelId?.trim() || null : null;
  let brandName = data.brandOther?.trim() ?? "";
  let modelName = data.modelOther?.trim() ?? "";

  let attribution = null;
  try {
    const cookieStore = await cookies();
    attribution = parseAttributionCookie(cookieStore.get("ms_attr")?.value);
  } catch {
    attribution = null;
  }

  try {
    if (brandId) {
      const brand = await db.vehicleBrand.findUnique({
        where: { id: brandId },
        select: { id: true, name: true, vehicleType: true },
      });
      if (!brand || brand.vehicleType !== data.vehicleType) {
        return {
          ok: false,
          fieldErrors: { brandId: ["La marca no corresponde al tipo de vehículo seleccionado."] },
          message: "Revisá la marca del vehículo.",
        };
      }
      brandName = brand.name;

      if (modelId) {
        const model = await db.vehicleModel.findUnique({
          where: { id: modelId },
          select: { id: true, name: true, brandId: true },
        });
        if (!model || model.brandId !== brandId) {
          return {
            ok: false,
            fieldErrors: { modelId: ["El modelo no corresponde a la marca seleccionada."] },
            message: "Revisá el modelo del vehículo.",
          };
        }
        modelName = model.name;
      }
    }

    const lead = await db.$transaction(async (transaction) => {
      const createdLead = await transaction.lead.create({
        data: {
          vehicleType: data.vehicleType,
          fullName: data.fullName,
          phone: data.phone ?? "",
          email: data.email,
          dni: data.dni,
          isZeroKm: data.isZeroKm,
          plate: data.isZeroKm && !data.plateNormalized ? null : (data.plateNormalized ?? null),
          brandId,
          brandName,
          modelId,
          modelName,
          year: data.year,
          hasGnc: data.hasGnc ?? null,
          postalCode: data.postalCode,
          usage: data.usage,
          consentAt: new Date(),
          status: "NEW",
          utmSource: attribution?.utmSource ?? null,
          utmMedium: attribution?.utmMedium ?? null,
          utmCampaign: attribution?.utmCampaign ?? null,
          utmTerm: attribution?.utmTerm ?? null,
          utmContent: attribution?.utmContent ?? null,
          gclid: attribution?.gclid ?? null,
          landingPage: attribution?.landingPage ?? null,
          referrer: attribution?.referrer ?? null,
        },
      });
      await transaction.leadStatusChange.create({
        data: { leadId: createdLead.id, fromStatus: null, toStatus: "NEW" },
      });
      return createdLead;
    });

    return {
      ok: true,
      leadId: lead.id,
      requestNumber: formatRequestNumber(lead.requestNumber),
    };
  } catch {
    return { ok: false, message: DATABASE_ERROR_MESSAGE };
  }
}
