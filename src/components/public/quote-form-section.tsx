import { LeadForm, type VehicleBrandOption } from "./lead-form";
import { getVehicleBrands } from "@/server/queries/vehicles";
import type { VehicleType } from "@/lib/constants";

export async function QuoteFormSection({
  initialVehicleType = "AUTO",
}: {
  initialVehicleType?: VehicleType;
}) {
  let brands: VehicleBrandOption[] = [];
  let catalogUnavailable = false;
  try {
    brands = await getVehicleBrands();
  } catch {
    catalogUnavailable = true;
  }
  return (
    <LeadForm
      brands={brands}
      initialVehicleType={initialVehicleType}
      catalogUnavailable={catalogUnavailable}
    />
  );
}
