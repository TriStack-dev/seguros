# 0007 — Prisma 7 con Supabase

- **Fecha:** 2026-10-24
- **Step:** 04
- **Estado:** Aceptada

## Contexto
La configuración de Prisma cambió mucho en la versión 7: la URL de conexión salió del schema,
el cliente se genera dentro del proyecto y la conexión pasa por un driver adapter. Además, con
Supabase la app y las migraciones tienen que usar conexiones distintas (pooler y directa). Al
momento del step, el dist-tag `latest` de npm apunta a `8.0.0-rc.27`, que es una release
candidate.

## Decisión
- **Versión:** `prisma`, `@prisma/client` y `@prisma/adapter-pg` **7.10.1**, la última estable,
  con versión exacta. La 8 se evalúa cuando salga estable, en su propio PR.
- **Generador:** `prisma-client` (el nuevo) con `output = "../src/generated/prisma"`. El código
  generado no se versiona (`.gitignore`) y lo regeneran `postinstall` y `pnpm db:generate`. Se
  importa desde `@/generated/prisma/client`.
- **`prisma.config.ts`:** carga `.env.local` con `dotenv` (Prisma 7 no carga variables solo) y
  define `datasource.url` con `DIRECT_URL`: la CLI (migrate, studio) usa la conexión directa. Se
  lee con `process.env` y no con el helper `env()`, que falla si la variable no existe incluso
  en `prisma generate`, y eso rompería el `pnpm install` de un clon nuevo sin `.env.local`.
- **Runtime:** `src/lib/db.ts` crea el cliente con `@prisma/adapter-pg` y `DATABASE_URL` (en la
  nube, el pooler de Supabase en modo transaction). Singleton en `globalThis` fuera de
  producción e `import "server-only"`.
- **Build scripts:** `pnpm-workspace.yaml` habilita los scripts de instalación de `prisma` y
  `@prisma/engines` (descargan el schema engine que usan migrate y studio).
- **Tablas:** se mantienen los nombres de los modelos (`Lead`, `LeadNote`, etc.), sin `@@map`.
- **RLS:** la migración inicial activa RLS en todas las tablas, sin políticas, incluida
  `_prisma_migrations`, que también vive en `public` y si no quedaría expuesta por la API REST.
  Esa sentencia es condicional porque `migrate dev` aplica las migraciones primero en una base
  sombra donde la tabla todavía no existe.

## Alternativas descartadas
- **Prisma 8 (RC):** no es estable.
- **Generador `prisma-client-js` (el viejo, en `node_modules`):** queda deprecado en Prisma 7.
- **`env()` en `prisma.config.ts`:** rompe `prisma generate` sin la variable definida.
- **Tablas en snake_case con `@@map`:** más trabajo sin beneficio para este proyecto; el spec
  usa los nombres de los modelos.

## Consecuencias
- Cada tabla nueva necesita su `ENABLE ROW LEVEL SECURITY` en SQL manual (`--create-only`).
- El cliente se importa desde `@/generated/prisma/client`, no desde `@prisma/client`.
- Si se pasa a Prisma 8, revisar `prisma.config.ts`, el generador y el adapter contra la guía
  vigente.
