import { describe, expect, it } from "vitest";
import {
  flattenFieldErrors,
  loginSchema,
  newPasswordSchema,
  passwordResetRequestSchema,
} from "./schemas";

describe("loginSchema", () => {
  it("normaliza el email y acepta credenciales completas", () => {
    const r = loginSchema.safeParse({ email: "  a@b.com ", password: "x" });
    expect(r.success && r.data.email).toBe("a@b.com");
  });

  it("rechaza email inválido o contraseña vacía", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("passwordResetRequestSchema", () => {
  it("exige un email válido", () => {
    expect(passwordResetRequestSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(passwordResetRequestSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("exige largo mínimo y confirmación igual", () => {
    expect(
      newPasswordSchema.safeParse({ password: "corta", confirmPassword: "corta" }).success,
    ).toBe(false);
    const mismatch = newPasswordSchema.safeParse({
      password: "una-clave-larga",
      confirmPassword: "otra-clave-larga",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(flattenFieldErrors(mismatch.error).confirmPassword).toBe(
        "Las contraseñas no coinciden.",
      );
    }
    expect(
      newPasswordSchema.safeParse({
        password: "una-clave-larga",
        confirmPassword: "una-clave-larga",
      }).success,
    ).toBe(true);
  });
});
