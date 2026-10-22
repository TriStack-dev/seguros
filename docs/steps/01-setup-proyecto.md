# Step 01 — Setup del proyecto

**Etapa:** 1. Base · **Depende de:** — · **Leer:** `SPEC.md` secciones 3 y 4; `AGENTS.md`

## Objetivo

Dejar un proyecto Next.js vacío pero completo en herramientas, que cualquier integrante pueda clonar y levantar siguiendo el README.

## Tareas

- [ ] Crear el proyecto con `pnpm create next-app` (TypeScript, App Router, ESLint, Tailwind, carpeta `src/`, alias `@/*`).
- [ ] `tsconfig.json` con `strict: true` y `noUncheckedIndexedAccess: true`.
- [ ] `.nvmrc` con la versión LTS de Node; `"packageManager"` y `"engines"` en `package.json`.
- [ ] Prettier con `prettier-plugin-tailwindcss`, integrado con ESLint (sin reglas en conflicto).
- [ ] Inicializar shadcn/ui (`pnpm dlx shadcn@latest init`) y agregar los componentes base: `button`, `input`, `label`, `select`, `checkbox`, `card`, `form`, `sonner`.
- [ ] Vitest configurado con alias `@/*`, y un test de ejemplo en `src/lib/utils.test.ts`.
- [ ] Scripts en `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:watch`, `format`.
- [ ] Crear las carpetas de la sección 4 de `SPEC.md` que todavía no existan (con un `.gitkeep` si están vacías).
- [ ] `.env.example` con `NEXT_PUBLIC_SITE_URL` y `.gitignore` que excluya `.env*` salvo `.env.example`. **No excluyas `.engram/`**: ahí viaja la memoria compartida del proyecto, y al empezar con punto es fácil que un template de `.gitignore` la tape y deje el flujo silenciosamente inútil.
- [ ] Activar los git hooks del repo con `git config core.hooksPath .githooks`. El hook `.githooks/pre-push` rechaza los pushes a `main` y `master` (ver `AGENTS.md`). `core.hooksPath` vive en `.git/config` y no se versiona, así que lo tiene que correr cada integrante en su clon.
- [ ] Instalar engram (3.5.2 o mayor) y correr `engram sync --import` una vez después de clonar, para traerse la memoria del proyecto que está en `.engram/`. De ahí en adelante el hook `post-merge` lo hace solo en cada pull.
- [ ] `README.md`: requisitos (Node, pnpm, engram), instalación, activación de los git hooks, variables de entorno, comandos y enlace a `SPEC.md` y `AGENTS.md`.
- [ ] Página `/` provisoria con un texto "MiSeguro — en construcción" usando un componente de shadcn/ui.
- [ ] Copiar al repo `SPEC.md`, `AGENTS.md`, `CLAUDE.md` y la carpeta `docs/` (si no están).

## Criterios de aceptación

- Con el repo recién clonado: `pnpm install && pnpm dev` levanta la página en `localhost:3000`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan sin errores.
- No hay credenciales en el repo.
- Con `core.hooksPath` configurado, `git push origin main` se rechaza antes de contactar al remoto, y el push de una rama `step/NN-nombre-corto` pasa.
- `git check-ignore .engram` no devuelve nada (la memoria del proyecto no está ignorada).
- Con memoria nueva sin commitear, el push de una rama `step/NN-nombre-corto` se rechaza pidiendo commitear `.engram/`.

## Fuera de alcance

- Base de datos, Prisma, Supabase (steps 02 y 04).
- Diseño de la landing (step 07).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
