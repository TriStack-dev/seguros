import { z } from "zod";
import { VEHICLE_TYPES, USAGE_TYPES, USAGE_BY_VEHICLE, MIN_YEAR } from "@/lib/constants";
import { isValidPlate } from "@/lib/validation/plate";
import {
  normalizeName,
  normalizeDni,
  normalizePlate,
  normalizePostalCode,
  normalizePhone,
} from "@/lib/validation/normalizers";

const nameSchema = z
  .string()
  .transform((v) => normalizeName(v))
  .refine(
    (v) => {
      if (!v) return false;
      if (v.length > 100) return false;
      // at least 2 words of 2 or more letters
      const words = v.split(/\s+/).filter(Boolean);
      if (words.length < 2) return false;
      return words.every((w) => {
        // allow letters with accents, ñ, apostrophe, hyphen
        const cleaned = w.replace(/['-]/g, "");
        return /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}$/.test(cleaned);
      });
    },
    { message: "Ingresá nombre y apellido válidos (mínimo 2 palabras de 2 letras)" },
  );

const emailSchema = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .refine((v) => z.string().email().safeParse(v).success, { message: "Ingresá un email válido" });

const dniSchema = z
  .string()
  .transform((v) => normalizeDni(v))
  .refine(
    (v) => {
      if (!/^\d+$/.test(v)) return false;
      return v.length === 7 || v.length === 8;
    },
    { message: "Ingresá un DNI válido (7 u 8 dígitos)" },
  );

const postalCodeSchema = z
  .string()
  .transform((v) => normalizePostalCode(v))
  .refine(
    (v) => {
      // 4 digits or CPA like S2000ABC (1 letter + 4 digits + 3 letters)
      if (/^\d{4}$/.test(v)) return true;
      if (/^[A-Z]\d{4}[A-Z]{3}$/.test(v)) return true;
      return false;
    },
    { message: "Ingresá un código postal válido" },
  );

const versionSchema = z
  .string()
  .max(60, { message: "La versión puede tener hasta 60 caracteres" })
  .optional()
  .or(z.literal(""));

export const leadFormSchema = z
  .object({
    vehicleType: z.enum(VEHICLE_TYPES, { message: "Seleccioná el tipo de vehículo" }),
    fullName: nameSchema,
    phoneArea: z.string(),
    phoneNumber: z.string(),
    email: emailSchema,
    dni: dniSchema,
    isZeroKm: z.boolean().optional().default(false),
    plate: z.string().optional().or(z.literal("")),
    brandId: z.string().optional().or(z.literal("")),
    brandOther: z
      .string()
      .max(40, { message: "La marca puede tener hasta 40 caracteres" })
      .optional()
      .or(z.literal("")),
    modelId: z.string().optional().or(z.literal("")),
    modelOther: z
      .string()
      .max(60, { message: "El modelo puede tener hasta 60 caracteres" })
      .optional()
      .or(z.literal("")),
    version: versionSchema,
    year: z.coerce.number({
      message: "Ingresá el año del vehículo",
    }),
    hasGnc: z.boolean().nullable().optional(),
    postalCode: postalCodeSchema,
    usage: z.enum(USAGE_TYPES, { message: "Seleccioná el tipo de uso" }),
    consent: z
      .boolean()
      .refine((v) => v === true, { message: "Tenés que aceptar la política de privacidad" }),
    website: z.string().optional().default(""), // honeypot
  })
  .superRefine((data, ctx) => {
    // honeypot
    if (data.website && data.website.trim() !== "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Envío inválido",
        path: ["website"],
      });
      return;
    }

    // phone normalization/validation
    try {
      const phone = normalizePhone(data.phoneArea, data.phoneNumber);
      (data as Record<string, unknown>).phone = phone;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Teléfono inválido";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ["phoneNumber"],
      });
    }

    // plate
    if (data.isZeroKm) {
      // patente no obligatoria, pero si viene debe ser válida
      if (data.plate && data.plate.trim() !== "") {
        const normalizedPlate = normalizePlate(data.plate);
        if (!isValidPlate(normalizedPlate, data.vehicleType)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingresá una patente válida",
            path: ["plate"],
          });
        } else {
          (data as Record<string, unknown>).plateNormalized = normalizedPlate;
        }
      }
      // if zero km and no plate, that's ok per rules
    } else {
      if (!data.plate || data.plate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá la patente",
          path: ["plate"],
        });
      } else {
        const normalizedPlate = normalizePlate(data.plate);
        if (!isValidPlate(normalizedPlate, data.vehicleType)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ingresá una patente válida",
            path: ["plate"],
          });
        } else {
          (data as Record<string, unknown>).plateNormalized = normalizedPlate;
        }
      }
    }

    // brand/model
    const hasBrandId = data.brandId && data.brandId.trim() !== "";
    const hasBrandOther = data.brandOther && data.brandOther.trim() !== "";
    if (!hasBrandId && !hasBrandOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccioná o ingresá la marca",
        path: ["brandId"],
      });
    }
    if (
      hasBrandOther &&
      (!data.brandOther || data.brandOther.trim().length < 2 || data.brandOther.trim().length > 40)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La marca debe tener entre 2 y 40 caracteres",
        path: ["brandOther"],
      });
    }

    const hasModelId = data.modelId && data.modelId.trim() !== "";
    const hasModelOther = data.modelOther && data.modelOther.trim() !== "";
    if (hasBrandOther) {
      // if brand is other, model must be free text
      if (!hasModelOther || data.modelOther!.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá el modelo",
          path: ["modelOther"],
        });
      }
      if (
        hasModelOther &&
        (data.modelOther!.trim().length < 1 || data.modelOther!.trim().length > 60)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El modelo debe tener entre 1 y 60 caracteres",
          path: ["modelOther"],
        });
      }
    } else {
      if (!hasModelId && !hasModelOther) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccioná o ingresá el modelo",
          path: ["modelId"],
        });
      }
      if (
        hasModelOther &&
        (data.modelOther!.trim().length < 1 || data.modelOther!.trim().length > 60)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El modelo debe tener entre 1 y 60 caracteres",
          path: ["modelOther"],
        });
      }
    }

    // usage valid for vehicle type
    const allowedUsages = USAGE_BY_VEHICLE[data.vehicleType];
    if (!allowedUsages.includes(data.usage)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El tipo de uso no es válido para este vehículo",
        path: ["usage"],
      });
    }

    // year
    const currentYear = new Date().getFullYear();
    if (data.year < MIN_YEAR || data.year > currentYear + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El año debe estar entre ${MIN_YEAR} y ${currentYear + 1}`,
        path: ["year"],
      });
    }

    // hasGnc
    if (data.vehicleType === "AUTO") {
      if (data.hasGnc !== true && data.hasGnc !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indicá si tiene GNC",
          path: ["hasGnc"],
        });
      }
    } else if (data.vehicleType === "MOTO") {
      // must be absent/null
      if (data.hasGnc !== null && data.hasGnc !== undefined) {
        // we'll normalize to null, but better to be strict
      }
      (data as Record<string, unknown>).hasGnc = null;
    }
  });

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormData = z.output<typeof leadFormSchema> & {
  phone?: string;
  plateNormalized?: string;
};
