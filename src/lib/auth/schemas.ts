import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const email = z
  .string()
  .trim()
  .min(1, "Ingresá tu email.")
  .max(254, "El email es demasiado largo.")
  .pipe(z.email("Ingresá un email válido."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña.").max(256),
});

export const passwordResetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
      .max(72, "La contraseña es demasiado larga."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export type FormState = {
  /** Error general del formulario (no de un campo puntual). */
  error?: string;
  /** Mensaje de éxito. */
  success?: string;
  fieldErrors?: Record<string, string>;
};

/** Convierte un ZodError en `{ campo: primer mensaje }`. */
export function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
