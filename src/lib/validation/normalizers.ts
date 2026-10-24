export class ValidationError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

export function normalizeName(value: string): string {
  if (!value) return "";
  // trim and collapse multiple spaces
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed;
}

export function normalizeDni(value: string): string {
  if (!value) return "";
  // remove dots and spaces
  return value.replace(/[.\s]/g, "");
}

export function normalizePlate(value: string): string {
  if (!value) return "";
  return value.toUpperCase().replace(/[\s-]/g, "");
}

export function normalizePostalCode(value: string): string {
  if (!value) return "";
  return value.toUpperCase().replace(/\s/g, "");
}

export function normalizePhone(area: string, number: string): string {
  if (!area && !number) throw new ValidationError("Ingresá el código de área sin el 0", "phone_area_required");
  // remove non-digits
  let a = (area || "").replace(/\D/g, "");
  let n = (number || "").replace(/\D/g, "");

  if (!a) throw new ValidationError("Ingresá el código de área sin el 0", "phone_area_required");
  if (!n) throw new ValidationError("Ingresá el número sin el 15", "phone_number_required");

  // remove leading 0 from area if present
  if (a.startsWith("0")) {
    a = a.slice(1);
  }

  // remove leading 15 from number if present (tolerance)
  if (n.startsWith("15") && n.length === 10) {
    // sometimes people put 15 + 8 digits = 10? or total becomes 12? rule says "si el número empieza con 15 y con eso la suma da 12 dígitos, se quita el 15"
    // area+number sum: if we remove 15, sum becomes 10
    n = n.slice(2);
  } else if (n.startsWith("15") && a.length + n.length === 12) {
    n = n.slice(2);
  }

  if (a.length < 2 || a.length > 4) throw new ValidationError("Ingresá el código de área sin el 0", "phone_area_invalid");
  if (n.length < 6 || n.length > 8) throw new ValidationError("Ingresá el número sin el 15", "phone_number_invalid");
  if (a.length + n.length !== 10) {
    // try to be strict per rules
    throw new ValidationError("El teléfono debe tener 10 dígitos entre área y número", "phone_length_invalid");
  }

  return `549${a}${n}`;
}

export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return "";
  // expect 549 + area + number
  if (phone.startsWith("549") && phone.length >= 12) {
    const rest = phone.slice(3);
    // try to split: area 2-4, number 6-8
    // common: 341 + 4123456 = 10
    if (rest.length === 10) {
      const area = rest.slice(0, 3);
      const number = rest.slice(3);
      return `+54 9 ${area} ${number.slice(0, 3)}-${number.slice(3)}`;
    }
    // fallback
    return `+54 9 ${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6)}`;
  }
  return phone;
}
