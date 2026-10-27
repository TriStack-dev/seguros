# Step 15 — Login del panel

**Etapa:** 4. Panel · **Depende de:** 02, 04 · **Leer:** `AGENTS.md` sección "Seguridad"

## Objetivo

Proteger el panel con Supabase Auth: solo los administradores creados por el equipo pueden entrar. Hay un solo rol.

Este step se hace completo contra el Auth local del step 02. Las cuentas reales de los brokers se crean en el step 26 (staging) y en el step 25 (producción).

## Tareas

- [x] Instalar `@supabase/supabase-js` y `@supabase/ssr`. Las variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` ya están en `.env.example` con los valores locales (step 02); verificá que alcancen y, si el proyecto usa las claves legacy, documentá que `anon` y `service_role` cumplen el mismo rol.
- [x] `src/lib/supabase/server.ts` y `client.ts` según la guía oficial vigente de Supabase para Next.js (App Router, cookies).
- [x] Página `/admin/login` con email y contraseña (formulario con Zod). Mensaje de error genérico ("Email o contraseña incorrectos"). Sin registro ni "crear cuenta".
- [x] Recuperación de contraseña por email con la función de Supabase (página para definir la nueva contraseña). En local, los mails se ven en el buzón de prueba que levanta la CLI de Supabase (no fijar su nombre: cambia entre versiones). La configuración de Site URL y Redirect URLs del dominio real se hace en el step 25.
- [x] Protección de rutas en `src/proxy.ts`: refresca la sesión y redirige a `/admin/login` toda ruta `/admin/*` sin sesión. Componer con la lógica de atribución del step 12 sin romperla.
- [x] `src/server/auth.ts`: `requireAdmin()` que obtiene el usuario con `supabase.auth.getUser()` (no `getSession()`) y lanza o redirige si no hay usuario. Devuelve `{ id, email }` para registrar quién hizo cada cambio.
- [x] Layout `src/app/admin/(protected)/layout.tsx`: llama a `requireAdmin()`, muestra navegación (Leads, Estadísticas), email del usuario y botón "Cerrar sesión".
- [x] Todo `/admin` con `robots: { index: false, follow: false }` en los metadatos y encabezado `X-Robots-Tag: noindex`.
- [x] Script `pnpm admin:create <email>` (`scripts/create-admin.ts`) que crea el usuario con la Admin API de Supabase usando `SUPABASE_SECRET_KEY` y le envía la invitación o genera una contraseña temporal. Documentarlo en el README.
- [x] Página `/admin` que redirige a `/admin/leads` (por ahora un placeholder "Leads").

## Criterios de aceptación

- Entrar a `/admin/leads` sin sesión redirige al login; con sesión se ve el panel.
- Cerrar sesión impide volver con el botón "atrás".
- No existe forma de crear una cuenta desde la web.
- `SUPABASE_SECRET_KEY` no aparece en el bundle del navegador (buscarla en `.next/static`).

## Fuera de alcance

- Roles y permisos distintos. Login con Google o enlace mágico.

## Notas de implementación

**Qué se hizo:** login del panel con Supabase Auth (email y contraseña) vía Server Actions con Zod y mensaje genérico; recuperación de contraseña por email (solicitar, callback que canjea el código PKCE y página para definir la nueva); `src/proxy.ts` que refresca la sesión, redirige `/admin/*` sin sesión a `/admin/login?next=...`, y agrega `X-Robots-Tag: noindex` y `Cache-Control: no-store`; `requireAdmin()` con `getUser()`; layout protegido con nav, email y "Cerrar sesión"; placeholders de Leads y Estadísticas; script `pnpm admin:create`.

**Archivos clave:** `src/proxy.ts`, `src/lib/supabase/{server,client,proxy,env}.ts`, `src/server/auth.ts`, `src/server/actions/auth.ts`, `src/lib/auth/{schemas,safe-redirect}.ts` (+ tests), `src/app/admin/**`, `src/components/admin/*`, `scripts/create-admin.ts`, `supabase/config.toml`.

**Decisiones:** [0008](../decisiones/0008-auth-del-panel-con-supabase.md) (provider de email en local, contraseña temporal, redirect URLs).

**Desvíos del spec:** formulario con Server Action + `useActionState` y Zod en el servidor, sin React Hook Form (no está instalado y no aporta acá). `src/proxy.ts` no incluye la atribución (step 12 sin hacer): quedó anotado con un TODO cómo componerla. Se cambió `supabase/config.toml` (`[auth.email] enable_signup = true` y redirect URLs), ver decisión 0008.

**Cómo probarlo:** `pnpm db:restart` (para tomar el config), `pnpm admin:create tu@mail.com`, `pnpm dev`, entrar a http://localhost:3000/admin/leads (redirige al login), ingresar con la contraseña temporal, cerrar sesión y probar "atrás". Recuperación: "Olvidé mi contraseña" y abrir el mail en http://127.0.0.1:54324. Verificado end-to-end con curl contra Supabase local (login correcto e incorrecto, redirección, logout, recuperación, signup bloqueado) y sin `sb_secret_`/`SUPABASE_SECRET_KEY` en `.next/static`.

**Pendientes:** probar el flujo en un navegador real (botón "atrás" y UI); configurar Site URL y Redirect URLs del dominio real y SMTP en staging/producción (steps 25 y 26); componer la atribución en `src/proxy.ts` (step 12); crear las cuentas reales de los brokers.
