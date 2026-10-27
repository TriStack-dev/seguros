"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  flattenFieldErrors,
  loginSchema,
  newPasswordSchema,
  passwordResetRequestSchema,
  type FormState,
} from "@/lib/auth/schemas";
import { safeAdminRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/auth";

const GENERIC_LOGIN_ERROR = "Email o contraseña incorrectos.";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    // Cualquier dato inválido se informa igual que una credencial incorrecta.
    return { error: GENERIC_LOGIN_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: GENERIC_LOGIN_ERROR };

  const next = formData.get("next");
  redirect(safeAdminRedirect(typeof next === "string" ? next : null));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

const RESET_SUCCESS =
  "Si el email corresponde a un administrador, te enviamos un enlace para definir una nueva contraseña.";

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = passwordResetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const supabase = await createClient();
  const origin = await siteOrigin();
  // El resultado no se informa: no revelamos qué emails existen.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/admin/auth/callback?next=/admin/nueva-contrasena`,
  });
  return { success: RESET_SUCCESS };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "No pudimos cambiar la contraseña. Pedí un enlace nuevo e intentá de nuevo." };
  }
  redirect("/admin/leads");
}
