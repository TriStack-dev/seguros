import { ValidationError } from "@/lib/validation/normalizers";

/**
 * Link `wa.me` con el mensaje ya codificado.
 * El número debe venir solo con dígitos, como la variable `WHATSAPP_NUMBER` (ej. `5493794057190`).
 */
export function buildWhatsappLink(phoneNumber: string, message: string): string {
  if (!/^\d+$/.test(phoneNumber)) {
    throw new ValidationError(
      "El número de WhatsApp debe tener solo dígitos",
      "whatsapp_number_invalid",
    );
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
