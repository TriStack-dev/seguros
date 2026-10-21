# Step 15 — Login del panel

**Etapa:** 4. Panel · **Depende de:** 02, 04 · **Leer:** `AGENTS.md` sección "Seguridad"

## Objetivo

Proteger el panel con Supabase Auth: solo los administradores creados por el equipo pueden entrar. Hay un solo rol.

## Tareas

- [ ] Instalar `@supabase/supabase-js` y `@supabase/ssr`. Variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` en `.env.example` (si el proyecto usa las claves legacy, `anon` y `service_role` cumplen el mismo rol; documentarlo).
- [ ] `src/lib/supabase/server.ts` y `client.ts` según la guía oficial vigente de Supabase para Next.js (App Router, cookies).
- [ ] Página `/admin/login` con email y contraseña (formulario con Zod). Mensaje de error genérico ("Email o contraseña incorrectos"). Sin registro ni "crear cuenta".
- [ ] Recuperación de contraseña por email con la función de Supabase (página para definir la nueva contraseña).
- [ ] Protección de rutas en `src/proxy.ts`: refresca la sesión y redirige a `/admin/login` toda ruta `/admin/*` sin sesión. Componer con la lógica de atribución del step 12 sin romperla.
- [ ] `src/server/auth.ts`: `requireAdmin()` que obtiene el usuario con `supabase.auth.getUser()` (no `getSession()`) y lanza o redirige si no hay usuario. Devuelve `{ id, email }` para registrar quién hizo cada cambio.
- [ ] Layout `src/app/admin/(protected)/layout.tsx`: llama a `requireAdmin()`, muestra navegación (Leads, Estadísticas), email del usuario y botón "Cerrar sesión".
- [ ] Todo `/admin` con `robots: { index: false, follow: false }` en los metadatos y encabezado `X-Robots-Tag: noindex`.
- [ ] Script `pnpm admin:create <email>` (`scripts/create-admin.ts`) que crea el usuario con la Admin API de Supabase usando `SUPABASE_SECRET_KEY` y le envía la invitación o genera una contraseña temporal. Documentarlo en el README.
- [ ] Página `/admin` que redirige a `/admin/leads` (por ahora un placeholder "Leads").

## Criterios de aceptación

- Entrar a `/admin/leads` sin sesión redirige al login; con sesión se ve el panel.
- Cerrar sesión impide volver con el botón "atrás".
- No existe forma de crear una cuenta desde la web.
- `SUPABASE_SECRET_KEY` no aparece en el bundle del navegador (buscarla en `.next/static`).

## Fuera de alcance

- Roles y permisos distintos. Login con Google o enlace mágico.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
