# 0008 — Auth del panel con Supabase: proveedor de email, contraseña temporal y redirects

- **Fecha:** 2026-10-26
- **Step:** 15
- **Estado:** Aceptada

## Contexto
El panel solo admite administradores creados por el equipo. En Supabase local, `[auth.email]
enable_signup = false` deshabilita el proveedor de email completo: `signInWithPassword` falla con
`email_provider_disabled`. Además, la recuperación necesita un destino permitido en las Redirect URLs.

## Decisión
- `[auth.email] enable_signup = true` y `[auth] enable_signup = false`: el proveedor de email queda
  activo pero el registro público sigue bloqueado (verificado: `/auth/v1/signup` responde `signup_disabled`).
- `additional_redirect_urls` incluye `http://127.0.0.1:3000/**` y `http://localhost:3000/**`.
- `pnpm admin:create` crea el usuario con contraseña temporal aleatoria mostrada una sola vez, en lugar
  de invitación por mail (la invitación depende de SMTP y del flujo implícito, que no encaja con PKCE de `@supabase/ssr`).
- Cualquier usuario de Auth es administrador (un solo rol): es seguro porque no hay registro público.
- El destino de la recuperación usa `NEXT_PUBLIC_SITE_URL` si existe, o el host del request.

## Alternativas descartadas
- Invitación por mail: requiere SMTP real y manejar tokens en el fragmento de la URL.
- Tabla propia de admins: innecesaria con un solo rol.

## Consecuencias
- Hay que correr `pnpm db:restart` para tomar el cambio de `config.toml`.
- En staging/producción hay que repetir estos ajustes en el dashboard (registro deshabilitado, proveedor de
  email activo, Site URL y Redirect URLs del dominio real) en los steps 25 y 26.
