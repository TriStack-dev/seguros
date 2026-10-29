import { buildWhatsappLink } from "@/lib/whatsapp/build-link";
import { LeadForm, type VehicleBrandOption } from "./lead-form";
import { getVehicleBrands } from "@/server/queries/vehicles";
import type { VehicleType } from "@/lib/constants";

export async function QuoteFormSection({
  compact = false,
  initialVehicleType = "AUTO",
}: {
  compact?: boolean;
  initialVehicleType?: VehicleType;
}) {
  let brands: VehicleBrandOption[] = [];
  let catalogUnavailable = false;
  try {
    brands = await getVehicleBrands();
  } catch {
    catalogUnavailable = true;
  }
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  const whatsappUrl =
    whatsappNumber && /^\d+$/.test(whatsappNumber)
      ? buildWhatsappLink(whatsappNumber, "Hola, necesito ayuda para cotizar mi seguro.")
      : undefined;
  return (
    <LeadForm
      brands={brands}
      compact={compact}
      whatsappUrl={whatsappUrl}
      initialVehicleType={initialVehicleType}
      catalogUnavailable={catalogUnavailable}
    />
  );
}
