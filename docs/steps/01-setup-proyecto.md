# Step 01 — Setup del proyecto

**Etapa:** 1. Base · **Depende de:** — · **Leer:** `SPEC.md` secciones 3 y 4; `AGENTS.md`

El repo ya existe y ya trae versionado `SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `docs/`, `.githooks/`, `.claude/`, `.codex/` y `.engram/`. Este step agrega la app Next.js **dentro** del repo que ya está; no se crea un proyecto nuevo en otra carpeta ni se copia nada.

## Objetivo

Dejar un proyecto Next.js vacío pero completo en herramientas, que cualquier integrante pueda clonar y levantar siguiendo el README.

## Tareas

- [x] Generar el scaffold de Next.js sobre el repo existente (TypeScript, App Router, ESLint, Tailwind, carpeta `src/`, alias `@/*`), cuidando de **no pisar** los archivos y carpetas que ya están. El scaffold de `create-next-app` puede querer sobreescribir el `README.md`, el `.gitignore` o `tsconfig.json`: revisar el diff antes de commitear y conservar lo que ya existía.
- [x] `tsconfig.json` con `strict: true` y `noUncheckedIndexedAccess: true`.
- [x] `.nvmrc` con la versión LTS de Node; `"packageManager"` y `"engines"` en `package.json`.
- [x] Prettier con `prettier-plugin-tailwindcss`, integrado con ESLint (sin reglas en conflicto).
- [x] Inicializar shadcn/ui (`pnpm dlx shadcn@latest init`) y agregar los componentes base: `button`, `input`, `label`, `select`, `checkbox`, `card`, `form`, `sonner`.
- [x] Vitest configurado con alias `@/*`, y un test de ejemplo en `src/lib/utils.test.ts`.
- [x] Scripts en `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:watch`, `format`.
- [x] Crear las carpetas de la sección 4 de `SPEC.md` que todavía no existan (con un `.gitkeep` si están vacías).
- [x] `.env.example` con `NEXT_PUBLIC_SITE_URL` y `.gitignore` (todavía no existe en el repo; lo crea este step) que excluya `.env*` salvo `.env.example`. **No excluyas `.engram/`**: ahí viaja la memoria compartida del proyecto, y al empezar con punto es fácil que un template de `.gitignore` la tape y deje el flujo silenciosamente inútil.
- [x] Activar, en el propio clon, los git hooks que ya están versionados en el repo: `git config core.hooksPath .githooks`. El hook `.githooks/pre-push` rechaza los pushes a `main` y `master` (ver `AGENTS.md`). `core.hooksPath` vive en `.git/config` y no se versiona, así que cada integrante lo tiene que correr en su clon.
- [x] Instalar engram (3.5.2 o mayor) y correr `engram sync --import` una vez después de clonar, para traerse la memoria del proyecto que está en `.engram/`. De ahí en adelante el hook `post-merge` lo hace solo en cada pull.
- [x] `README.md`: requisitos (Node, pnpm, engram), instalación, activación de los git hooks, variables de entorno, comandos y enlace a `SPEC.md` y `AGENTS.md`.
- [x] Página `/` provisoria con un texto "MiSeguro — en construcción" usando un componente de shadcn/ui.

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

**Qué se hizo:** se generó el scaffold de Next.js 16.4.2 (App Router, TypeScript, Tailwind v4,
ESLint, `src/`, alias `@/*`) dentro del repo existente, sin pisar ningún archivo previo. Se sumó el
tooling del step: Prettier con `prettier-plugin-tailwindcss` integrado con ESLint, Vitest con jsdom
y el alias `@/*`, shadcn/ui inicializado con los componentes base, las carpetas de la sección 4 de
`SPEC.md`, `.gitignore`, `.env.example`, `.nvmrc`, los scripts de `package.json` y el README con la
instalación completa. La home es una página provisoria con un `Card` de shadcn/ui.

**Archivos clave:**

- `package.json` — scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`,
  `format`, `format:check`), `engines` (Node 24, pnpm 12) y `packageManager`.
- `tsconfig.json` — `strict: true` y `noUncheckedIndexedAccess: true`.
- `next.config.ts` — loader de Tailwind v4 para Turbopack y `agentRules: false`.
- `eslint.config.mjs` — config de Next más `eslint-config-prettier` al final.
- `prettier.config.mjs`, `.prettierignore` — formato del código; la documentación queda afuera.
- `vitest.config.mts` — entorno jsdom, `resolve.tsconfigPaths` para el alias `@/*`.
- `components.json` — shadcn/ui, estilo `radix-nova`, base `radix`, iconos Lucide.
- `src/components/ui/` — `button`, `input`, `label`, `select`, `checkbox`, `card`, `sonner`,
  `field` y `separator`.
- `src/app/layout.tsx`, `src/app/page.tsx` — `lang="es-AR"`, metadatos del proyecto y la página
  provisoria "MiSeguro — en construcción".
- `src/lib/utils.test.ts` — test de ejemplo sobre `cn`.
- `.nvmrc`, `.gitignore`, `.env.example`, `README.md`.

**Decisiones:**

- `field` en lugar de `form` en los componentes de shadcn/ui: ver
  [`docs/decisiones/0004-field-en-lugar-de-form-de-shadcn.md`](../decisiones/0004-field-en-lugar-de-form-de-shadcn.md).
- Scaffold con `--empty` y `--no-cache-components`: la plantilla vacía evita borrar después la demo
  de Next.js, y Cache Components (activado por defecto en Next 16 con App Router) cambia la
  semántica de caché de todo el proyecto; se descarta por ahora para trabajar con el modelo
  estándar. Si más adelante se quiere, se activa en un step propio.
- `typecheck` corre `next typegen && tsc --noEmit`: Next 16 genera tipos de rutas y layouts
  (`LayoutProps<"/">`) en `.next/types`, así que en un clon limpio `tsc` solo falla. Con `typegen`
  adelante, `pnpm typecheck` funciona sin haber corrido un build antes.
- Prettier no toca los `.md`: reformateaba `SPEC.md`, `docs/reglas-negocio.md` y los archivos de
  los steps (268 líneas de ruido en el diff de este step). La documentación se escribe a mano.
- Vitest 5 resuelve los paths del tsconfig de forma nativa (`resolve.tsconfigPaths: true`), así que
  no hace falta `vite-tsconfig-paths`.

**Desvíos del spec:**

- El componente `form` de shadcn/ui no existe más en el registry: se agregó `field` (decisión 0004).
  `field` arrastró `separator`, que no estaba en la lista del step.
- `create-next-app` se niega a escribir en una carpeta con archivos que no reconoce. Para generar
  el scaffold **dentro** del repo (como pide el step) se movieron temporalmente `AGENTS.md`,
  `CLAUDE.md`, `SPEC.md`, `.codex/`, `.engram/` y `.githooks/` fuera de la carpeta, se corrió el
  generador y se devolvieron al lugar. No se creó ningún proyecto en otra carpeta ni se copió
  código: `git status` después del scaffold mostró solo archivos nuevos.
- Se agregó `format:check` (Prettier en modo verificación), que no estaba en la lista de scripts del
  step, para que el CI del step 03 lo pueda usar sin tocar archivos.
- Se agregó `agentRules: false` en `next.config.ts`. Sin eso, `next dev` genera y **sobreescribe**
  `AGENTS.md`, que en este repo son las reglas de trabajo del equipo. Pasó una vez durante el step
  y se restauró.

**Cómo probarlo:**

```bash
git clone https://github.com/TriStack-dev/seguros.git && cd seguros
pnpm install
git config core.hooksPath .githooks
engram sync --import
pnpm dev          # http://localhost:3000 muestra "MiSeguro — en construcción"
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Los hooks, con `core.hooksPath` configurado (todos con `--dry-run`, no escriben en el remoto):

- Push de `HEAD` contra la rama protegida `main`: rechazado por rama protegida.
- Push de `HEAD` contra `refs/heads/fix/bug`: rechazado por nombre fuera de convención, con la
  forma esperada en el mensaje.
- `git check-ignore .engram` sin salida: la memoria del proyecto no está ignorada.
- Con memoria de engram sin commitear, el push de la rama del step se rechaza pidiendo
  `git add .engram && git commit`.

**Pendientes:**

- El mensaje del hook `pre-push` para ramas protegidas nombra la convención vieja
  (`step/NN-nombre-corto`); la actual es `<tipo>/<NN>-<descripción>`. El resto de los mensajes del
  hook ya está bien. Es una línea en `.githooks/pre-push`, fuera del alcance de este step.
- `pnpm` no estaba instalado en la máquina y se instaló con `npm install -g pnpm` (quedó 12.15.0,
  que es lo que fijó `packageManager`). Si el equipo prefiere `corepack`, hay que unificarlo.
- El CI que corre lint, typecheck, test y build en cada PR es el step 03.
