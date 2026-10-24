import { VehicleType } from "@/lib/constants";

export type PlateFormat = "old" | "mercosur";

export function isValidPlate(plate: string, vehicleType: VehicleType): boolean {
  if (!plate) return false;
  const p = plate.toUpperCase().replace(/[\s-]/g, "");

  if (vehicleType === "AUTO") {
    // old: AAA999 (3 letters + 3 numbers)
    // mercosur: AA999AA (2 letters + 3 numbers + 2 letters)
    const oldFormat = /^[A-Z]{3}[0-9]{3}$/;
    const mercosurFormat = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
    return oldFormat.test(p) || mercosurFormat.test(p);
  }

  if (vehicleType === "MOTO") {
    // old: 999AAA (3 numbers + 3 letters)
    // mercosur: A999AAA (1 letter + 3 numbers + 3 letters)
    const oldFormat = /^[0-9]{3}[A-Z]{3}$/;
    const mercosurFormat = /^[A-Z][0-9]{3}[A-Z]{3}$/;
    return oldFormat.test(p) || mercosurFormat.test(p);
  }

  return false;
}
