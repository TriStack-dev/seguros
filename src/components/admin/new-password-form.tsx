"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PASSWORD_MIN_LENGTH, type FormState } from "@/lib/auth/schemas";
import { updatePassword } from "@/server/actions/auth";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={errors.password ? true : undefined}
          />
          <FieldDescription>Al menos {PASSWORD_MIN_LENGTH} caracteres.</FieldDescription>
          <FieldError>{errors.password}</FieldError>
        </Field>
        <Field data-invalid={errors.confirmPassword ? true : undefined}>
          <FieldLabel htmlFor="confirmPassword">Repetí la contraseña</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={errors.confirmPassword ? true : undefined}
          />
          <FieldError>{errors.confirmPassword}</FieldError>
        </Field>
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </FieldGroup>
    </form>
  );
}
