# AGENTS.md — MiSeguro

Reglas para cualquier agente (Claude Code, Codex) y persona que trabaje en este repo.
Contexto del producto, stack e índice de steps: `SPEC.md`. Reglas de negocio: `docs/reglas-negocio.md`.

## Cómo trabajar un step

1. Leé el índice de `SPEC.md` (sección 9) y el archivo del step en `docs/steps/`. No leas los demás steps salvo que el tuyo lo pida.
2. Verificá que las dependencias del step estén `DONE`. Si no lo están, avisá y no empieces.
3. Leé solo las secciones de `docs/reglas-negocio.md` que el step indique.
4. Trabajá en una rama `<tipo>/NN-nombre-corto` creada desde `main` actualizado (por ejemplo `feat/04-data-model`). Ver "Git y PR".
5. Hacé solo lo que pide el step. Si encontrás algo necesario fuera de su alcance, anotalo en "Pendientes" de las notas de implementación; no lo resuelvas.
6. Antes de dar el step por terminado, corré `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Todo tiene que pasar.
7. Verificá cada criterio de aceptación del step.
8. Cerrá el step (ver "Cierre de un step").

Si el step tiene una decisión que no está resuelta en el spec ni en las reglas de negocio, elegí la opción más simple, registrala en `docs/decisiones/` y mencionala en las notas.

## Cierre de un step

En el mismo PR del step:

1. En `SPEC.md`, sección 9, cambiá el estado de **tu fila** a `DONE · AAAA-MM-DD · quién · #PR`. No toques otras filas.
2. En el archivo del step, completá la sección "Notas de implementación" con:
   - **Qué se hizo:** resumen en 3 a 6 líneas.
   - **Archivos clave:** rutas principales creadas o modificadas.
   - **Decisiones:** elecciones tomadas y enlace al archivo de `docs/decisiones/` si corresponde.
   - **Desvíos del spec:** qué se hizo distinto y por qué (o "Ninguno").
   - **Cómo probarlo:** pasos concretos.
   - **Pendientes:** lo que quedó afuera o hay que resolver después (o "Ninguno").
3. Si agregaste variables de entorno, actualizá `.env.example` y la tabla de la sección 5 de `SPEC.md`.

## Comandos

```
pnpm dev             # servidor local
pnpm build           # build de producción
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
pnpm test            # Vitest (una pasada)
pnpm db:migrate      # prisma migrate dev
pnpm db:seed         # seed del catálogo de vehículos
```

Los comandos de base de datos y otros scripts se agregan en sus steps. Usá siempre pnpm; nunca npm ni yarn.

## Convenciones de código

- Código, nombres de variables, tablas, ramas y commits en **inglés**. Textos visibles para el usuario en **español rioplatense** con voseo ("Cotizá tu seguro"). La documentación, en español.
- TypeScript `strict`. Prohibido `any`; si es inevitable, comentá por qué.
- Server Components por defecto. `"use client"` solo donde haga falta interactividad.
- Toda Server Action y todo route handler valida su entrada con Zod antes de usarla.
- Toda acción o consulta del panel llama primero a `requireAdmin()` (step 15), aunque la ruta ya esté protegida.
- El acceso a la base es solo desde el servidor con Prisma (`src/lib/db.ts`). Nunca se consulta la base desde el navegador.
- Las reglas de negocio viven en funciones puras dentro de `src/lib/` y tienen tests unitarios en el mismo lugar (`archivo.test.ts`).
- Los valores [PROVISORIO] se definen en constantes de `src/lib/` (nunca repetidos en varios lugares), para cambiarlos en un solo punto.
- Las fechas se guardan en UTC y se muestran en la zona `America/Argentina/Buenos_Aires`.
- UI: componentes de shadcn/ui, mobile-first, accesibles (label en cada campo, foco visible, navegación con teclado). Si hay skills de UI instaladas en el repo, seguilas.

## Git y PR

- Nunca se trabaja ni se pushea directo a `main`.
- Ramas: `<tipo>/<descripción>`, o `<tipo>/<NN>-<descripción>` cuando el trabajo es un step del spec. El tipo es uno de `feat`, `fix`, `refactor`, `chore`, `docs`, `test` — los mismos de los commits. La descripción va en inglés, en minúsculas, con palabras separadas por guiones, y tiene que nombrar el cambio concreto: `fix/premium-rounding-on-annual-plans`, no `fix/bug`. El hook `pre-push` rechaza los nombres que no cumplen. Detalle y ejemplos: `.claude/skills/git-branch-naming/`.
- Commits con Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Título del PR: `Step NN — Título del step`. La descripción enlaza al archivo del step.
- Un step equivale a un PR. El PR necesita CI en verde y la revisión de otro integrante.

## Seguridad

- Nunca subas credenciales. Solo `.env.local` (ignorado) y variables en Vercel. `.env.example` lleva nombres sin valores reales.
- Las claves secretas (Supabase secret key, Turnstile secret, Sentry auth token) nunca llevan el prefijo `NEXT_PUBLIC_` ni se importan desde componentes cliente.
- No mandes datos personales (nombre, DNI, teléfono, email) a GA4 ni a Sentry.
- RLS activado en todas las tablas nuevas, sin políticas para `anon` ni `authenticated`.
