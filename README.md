# MiSeguro

Plataforma web para un broker de seguros: el usuario cotiza el seguro de su auto o moto,
queda registrado como lead y es derivado por WhatsApp a un asesor. Incluye un panel privado
para el seguimiento de los leads.

- Qué estamos construyendo, stack y el índice de steps: [`SPEC.md`](SPEC.md)
- Cómo trabajar en el repo (steps, ramas, PRs, convenciones): [`AGENTS.md`](AGENTS.md)
- Reglas de negocio: [`docs/reglas-negocio.md`](docs/reglas-negocio.md)

## Requisitos

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| [Node](https://nodejs.org) | 24 LTS (está fijada en `.nvmrc`) | runtime |
| [pnpm](https://pnpm.io) | 12 o mayor | gestor de paquetes (nunca npm ni yarn) |
| [engram](https://github.com/engram-ai/engram) | 3.5.2 o mayor | memoria compartida del proyecto |

Con [nvm](https://github.com/nvm-sh/nvm): `nvm install` toma la versión de `.nvmrc`.
pnpm se instala con `npm install -g pnpm` o con `corepack enable pnpm`.

## Instalación

```bash
git clone https://github.com/TriStack-dev/seguros.git
cd seguros
pnpm install
cp .env.example .env.local   # completá los valores (ver "Variables de entorno")
pnpm dev                     # http://localhost:3000
```

### Activar los git hooks (una vez por clon)

```bash
git config core.hooksPath .githooks
```

`core.hooksPath` vive en `.git/config`, que no se versiona, así que esto lo tiene que correr
cada persona en su clon. Los hooks de [`.githooks/`](.githooks) hacen dos cosas:

- `pre-push` rechaza los pushes directos a `main` y `master`, los nombres de rama fuera de
  la convención y los pushes con memoria de engram sin commitear.
- `post-merge` importa la memoria de engram después de cada `git pull`.

### Importar la memoria del proyecto (una vez después de clonar)

```bash
engram sync --import
```

La memoria de las sesiones anteriores viaja versionada en [`.engram/`](.engram). De ahí en
adelante el hook `post-merge` la importa solo en cada `git pull`.

## Variables de entorno

Se declaran en [`.env.example`](.env.example) con un comentario de qué son y dónde se
obtienen. Para trabajar en local, copialas a `.env.local` (ignorado por git) y completalas.
La tabla completa, con el step en el que aparece cada una, está en la sección 5 de
[`SPEC.md`](SPEC.md).

Nunca se commitea un archivo con valores reales: solo `.env.example`, con los nombres
vacíos.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, sin barra final (en local, `http://localhost:3000`) |

## Comandos

```bash
pnpm dev             # servidor local en http://localhost:3000
pnpm build           # build de producción
pnpm start           # sirve el build de producción
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
pnpm test            # Vitest, una pasada
pnpm test:watch      # Vitest en modo watch
pnpm format          # Prettier sobre el código
pnpm format:check    # Prettier en modo verificación, sin escribir
```

Antes de dar un step por terminado tienen que pasar `pnpm lint`, `pnpm typecheck`,
`pnpm test` y `pnpm build` (ver [`AGENTS.md`](AGENTS.md)).

## Estructura

El árbol de carpetas y qué va en cada una está en la sección 4 de [`SPEC.md`](SPEC.md).
Los componentes de `src/components/ui/` los genera el CLI de
[shadcn/ui](https://ui.shadcn.com); se agregan con `pnpm dlx shadcn@latest add <componente>`.
