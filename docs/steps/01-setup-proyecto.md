# Step 01 — Setup del proyecto

**Etapa:** 1. Base · **Depende de:** — · **Leer:** `SPEC.md` secciones 3 y 4; `AGENTS.md`

El repo ya existe y ya trae versionado `SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `docs/`, `.githooks/`, `.claude/`, `.codex/` y `.engram/`. Este step agrega la app Next.js **dentro** del repo que ya está; no se crea un proyecto nuevo en otra carpeta ni se copia nada.

## Objetivo

Dejar un proyecto Next.js vacío pero completo en herramientas, que cualquier integrante pueda clonar y levantar siguiendo el README.

## Tareas

- [ ] Generar el scaffold de Next.js sobre el repo existente (TypeScript, App Router, ESLint, Tailwind, carpeta `src/`, alias `@/*`), cuidando de **no pisar** los archivos y carpetas que ya están. El scaffold de `create-next-app` puede querer sobreescribir el `README.md`, el `.gitignore` o `tsconfig.json`: revisar el diff antes de commitear y conservar lo que ya existía.
- [ ] `tsconfig.json` con `strict: true` y `noUncheckedIndexedAccess: true`.
- [ ] `.nvmrc` con la versión LTS de Node; `"packageManager"` y `"engines"` en `package.json`.
- [ ] Prettier con `prettier-plugin-tailwindcss`, integrado con ESLint (sin reglas en conflicto).
- [ ] Inicializar shadcn/ui (`pnpm dlx shadcn@latest init`) y agregar los componentes base: `button`, `input`, `label`, `select`, `checkbox`, `card`, `form`, `sonner`.
- [ ] Vitest configurado con alias `@/*`, y un test de ejemplo en `src/lib/utils.test.ts`.
- [ ] Scripts en `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:watch`, `format`.
- [ ] Crear las carpetas de la sección 4 de `SPEC.md` que todavía no existan (con un `.gitkeep` si están vacías).
- [ ] `.env.example` con `NEXT_PUBLIC_SITE_URL` y `.gitignore` (todavía no existe en el repo; lo crea este step) que excluya `.env*` salvo `.env.example`. **No excluyas `.engram/`**: ahí viaja la memoria compartida del proyecto, y al empezar con punto es fácil que un template de `.gitignore` la tape y deje el flujo silenciosamente inútil.
- [ ] Activar, en el propio clon, los git hooks que ya están versionados en el repo: `git config core.hooksPath .githooks`. El hook `.githooks/pre-push` rechaza los pushes a `main` y `master` (ver `AGENTS.md`). `core.hooksPath` vive en `.git/config` y no se versiona, así que cada integrante lo tiene que correr en su clon.
- [ ] Instalar engram (3.5.2 o mayor) y correr `engram sync --import` una vez después de clonar, para traerse la memoria del proyecto que está en `.engram/`. De ahí en adelante el hook `post-merge` lo hace solo en cada pull.
- [ ] `README.md`: requisitos (Node, pnpm, engram), instalación, activación de los git hooks, variables de entorno, comandos y enlace a `SPEC.md` y `AGENTS.md`.
- [ ] Página `/` provisoria con un texto "MiSeguro — en construcción" usando un componente de shadcn/ui.

## Criterios de aceptación

- Con el repo recién clonado: `pnpm install && pnpm dev` levanta la página en `localhost:3000`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan sin errores.
- No hay credenciales en el repo.
- Con `core.hooksPath` configurado, `git push origin main` se rechaza antes de contactar al remoto, y el push de una rama `feat/NN-nombre-corto` pasa.
- El push de una rama con un nombre fuera de convención (por ejemplo `fix/bug`) se rechaza explicando la forma esperada.
- `git check-ignore .engram` no devuelve nada (la memoria del proyecto no está ignorada).
- Con memoria nueva sin commitear, el push de una rama `feat/NN-nombre-corto` se rechaza pidiendo commitear `.engram/`.

## Fuera de alcance

- Entorno local de base de datos (step 02). Prisma y el esquema (step 04). Cuentas en la nube (step 26).
- Diseño de la landing (step 07).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
