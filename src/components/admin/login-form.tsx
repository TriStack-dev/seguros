"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/auth/schemas";
import { signIn } from "@/server/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});

  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FieldGroup>
        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={state.error ? true : undefined}
          />
        </Field>
        <Field data-invalid={state.error ? true : undefined}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={state.error ? true : undefined}
          />
        </Field>
        <FieldError>{state.error}</FieldError>
        <Button type="submit" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </Button>
        <Link
          href="/admin/recuperar"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Olvidé mi contraseña
        </Link>
      </FieldGroup>
    </form>
  );
}
