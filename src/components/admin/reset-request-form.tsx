"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/auth/schemas";
import { requestPasswordReset } from "@/server/actions/auth";

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});
  const emailError = state.fieldErrors?.email;

  return (
    <form action={action} noValidate>
      <FieldGroup>
        <Field data-invalid={emailError ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={emailError ? true : undefined}
          />
          <FieldError>{emailError}</FieldError>
        </Field>
        {state.success ? (
          <p role="status" className="text-sm text-muted-foreground">
            {state.success}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando…" : "Enviar enlace"}
        </Button>
        <Link
          href="/admin/login"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Volver al ingreso
        </Link>
      </FieldGroup>
    </form>
  );
}
