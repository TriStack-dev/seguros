# Step 02 — Entorno de desarrollo local

**Etapa:** 1. Base · **Depende de:** 01 · **Leer:** `SPEC.md` secciones 3 y 5

## Objetivo

Tener PostgreSQL y Supabase Auth corriendo en la máquina de cada integrante, para desarrollar todo el producto sin depender de ninguna cuenta en la nube.

## Contexto

Las cuentas productivas de Supabase y Vercel quedan a nombre del cliente y se crean en el step 26, después de confirmar con él a nombre de quién quedan (step 00). Esa conversación todavía no pasó, y el desarrollo no tiene por qué esperarla: con la CLI de Supabase se levanta en Docker un entorno que da PostgreSQL, Auth y Studio, y alcanza para hacer completos los steps 04, 05, 10 y 15 sin ninguna cuenta en la nube. Pasar a la nube después (step 26) es cambiar variables de entorno, no tocar código.

Para que sirva como entorno de desarrollo real, tiene que parecerse al de producción en lo que importa: misma versión mayor de PostgreSQL, RLS activado, y el registro público de usuarios desactivado en Auth (los administradores se crean a mano, step 15).

## Tareas

- [x] Instalar la CLI de Supabase como dependencia de desarrollo del proyecto (`pnpm add -D supabase`) y documentar en el README que hace falta Docker corriendo para levantar el entorno local.
- [x] **Importante:** la CLI de Supabase cambia entre versiones mayores (nombres de los comandos, puertos, forma del `config.toml`, nombres de las claves locales). Seguir la guía oficial **vigente** de desarrollo local de Supabase y registrar en `docs/decisiones/` la versión de la CLI y la configuración elegida. No copiar comandos de memoria (mismo criterio que el step 04 con Prisma).
- [x] Inicializar la configuración local y versionar `supabase/config.toml` en el repo, para que todos levanten el mismo entorno.
- [x] En `config.toml`: desactivar el registro público de usuarios en Auth, y fijar la versión mayor de PostgreSQL que después se va a usar en la nube (step 26).
- [x] Levantar el entorno y dejar anotadas en `.env.example` las variables locales **con sus valores**: `DATABASE_URL` y `DIRECT_URL` apuntando a la base local, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` locales. Las claves locales de Supabase son públicas y fijas (no son secretos), a diferencia del resto de las variables del proyecto; aclarar en un comentario que en staging y producción estos valores los da el step 26.
- [x] Scripts en `package.json` para levantar, bajar y reiniciar el entorno local (nombres a elección, por ejemplo `db:up`, `db:down`, `db:reset`), documentados en el README.
- [x] Agregar al `.gitignore` lo que la CLI genera y no se versiona.
- [x] Sección "Entorno local" en el README: requisitos (Docker), cómo levantarlo, cómo abrir Studio, cómo apagarlo, y qué hacer si un puerto está ocupado.

## Criterios de aceptación

- Con el repo recién clonado y Docker corriendo, el comando de levantada deja la base y Auth accesibles, y Studio abre en el navegador.
- `supabase/config.toml` está versionado y el registro público de usuarios está desactivado.
- `.env.example` alcanza para que un integrante nuevo arme su `.env.local` sin pedirle nada a nadie.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` siguen pasando.

## Fuera de alcance

- Crear las cuentas de Supabase y Vercel (step 26). Tablas y migraciones (step 04). Datos del catálogo (step 05).

## Notas de implementación

- **Qué se hizo:** se instaló la CLI de Supabase 2.122.0 como dependencia de desarrollo, se
  generó y versionó `supabase/config.toml` (sin registro público, PostgreSQL 17), se agregaron los
  scripts `db:up`, `db:down`, `db:restart` y `db:status`, se completó `.env.example` con los
  valores locales y se sumó la sección "Entorno local" al README.
- **Archivos clave:** `supabase/config.toml`, `supabase/.gitignore`, `package.json`,
  `.env.example`, `.gitignore`, `README.md`,
  `docs/decisiones/0005-version-y-configuracion-de-supabase-local.md`.
- **Decisiones:** versión exacta de la CLI, claves nuevas `sb_publishable_`/`sb_secret_`, sin
  pooler en local y sin script `db:reset` (choca con las migraciones de Prisma). Detalle en
  [0005](../decisiones/0005-version-y-configuracion-de-supabase-local.md).
- **Desvíos del spec:** el script de reinicio es `db:restart` (baja y levanta conservando datos)
  en lugar de `db:reset`, por lo explicado en 0005. Lo que la CLI genera y no se versiona lo
  ignora `supabase/.gitignore` (generado por la CLI); el `.gitignore` raíz solo lo menciona.
- **Cómo probarlo:** con Docker corriendo, `pnpm install`, `cp .env.example .env.local` y
  `pnpm db:up`. Abrir Studio en http://127.0.0.1:54323. `pnpm db:status` muestra las mismas
  claves que `.env.example`. Para ver que el registro está cerrado:
  `curl -X POST http://127.0.0.1:54321/auth/v1/signup -H "apikey: <PUBLISHABLE_KEY>" -H 'content-type: application/json' -d '{"email":"a@b.com","password":"Prueba12345!"}'`
  responde `422 signup_disabled`. `pnpm db:down` lo apaga.
- **Pendientes:**
  - `[auth] site_url` quedó en el valor por defecto (`http://127.0.0.1:3000`), mientras
    `NEXT_PUBLIC_SITE_URL` usa `localhost:3000`. Revisarlo en el step 15, cuando se armen los
    redirects y cookies del login.
  - El reset de datos de la base lo resuelve el step 04 con Prisma.
  - El step 26 tiene que confirmar que staging y producción usan PostgreSQL 17.
