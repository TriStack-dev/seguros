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
| [engram](https://github.com/Gentleman-Programming/engram) | 3.5.2 o mayor | memoria compartida del proyecto |

Para Node, lo más simple es [fnm](https://github.com/Schniz/fnm): anda en Linux, macOS y
Windows, lee `.nvmrc` y con `--use-on-cd` cambia de versión solo al entrar a la carpeta.
`nvm` también sirve en Linux y macOS, pero ojo: `nvm-windows` es otro programa y no lee
`.nvmrc`. pnpm se instala con `npm install -g pnpm` o con `corepack enable pnpm`.

Desde el step 02 hace falta además **Docker** corriendo, para levantar Supabase local.

## Entorno por sistema operativo

El equipo trabaja en los tres sistemas y el repo está preparado para eso. Lo único que
cambia es cómo se instalan Node y Docker.

**Linux**

```bash
curl -fsSL https://fnm.vercel.app/install | bash   # Node
# Docker Engine nativo, desde el gestor de paquetes de tu distro
```

**macOS**

```bash
brew install fnm
brew install --cask docker   # o OrbStack, que es más liviano
```

**Windows: usá WSL2, no Windows a secas**

```powershell
wsl --install                      # Ubuntu sobre WSL2
winget install Schniz.fnm          # (o dentro de WSL, con el script de Linux)
winget install Docker.DockerDesktop
```

Dos cosas que importan más de lo que parecen:

- **El repo tiene que vivir adentro del filesystem de WSL2** (`~/proyectos/seguros`), nunca
  en `/mnt/c/Users/...`. Cruzar entre los dos filesystems hace que `pnpm install`, el watch
  de Next y los tests vayan varias veces más lento. Es el error más común.
- En Docker Desktop, activá el **backend de WSL2** (Settings → General) y el acceso desde tu
  distro (Settings → Resources → WSL integration).

Con VS Code, abrí el proyecto con la extensión **Remote - WSL**: de ahí en adelante la
terminal, git y los scripts corren todos del lado de Linux y la máquina se comporta igual
que las demás.

### Dos detalles entre sistemas

**Finales de línea.** Los maneja `.gitattributes`: todo viaja en LF. No configures
`core.autocrlf` a mano — si git en Windows convierte a CRLF, los hooks de `.githooks/` dejan
de correr en silencio (bash falla con `bad interpreter: bash^M`) y quien los pierde se queda
sin la protección de `main`.

**Mayúsculas en los imports.** Linux distingue mayúsculas y minúsculas en los nombres de
archivo; macOS y Windows, por defecto, no. Un `@/components/UI/button` compila en esas dos
máquinas y falla en Linux y en el CI. Si el CI se pone en rojo con un módulo que "existe",
mirá las mayúsculas del import.

Los tests corren siempre en UTC (está fijado en `vitest.config.mts`), así que las fechas dan
el mismo resultado en las tres máquinas y en el CI.

## Instalación

```bash
git clone https://github.com/TriStack-dev/seguros.git
cd seguros
pnpm install
cp .env.example .env.local   # completá los valores (ver "Variables de entorno")
pnpm dev                     # http://localhost:3000
```

### Git hooks

`pnpm install` los activa solo (script `prepare`). Si clonaste sin instalar, o querés
asegurarte:

```bash
git config core.hooksPath .githooks
```

`core.hooksPath` vive en `.git/config`, que no se versiona, así que cada clon lo necesita.
Los hooks de [`.githooks/`](.githooks) hacen dos cosas:

- `pre-push` rechaza los pushes directos a `main` y `master`, los nombres de rama fuera de
  la convención y los pushes con memoria de engram sin commitear.
- `post-merge` importa la memoria de engram después de cada `git pull`.

### Instalar e importar la memoria del proyecto (una vez después de clonar)

La memoria de las sesiones anteriores viaja versionada en [`.engram/`](.engram): son los
contextos, decisiones y descubrimientos que los agentes (Claude Code, Codex, OpenCode) fueron
acumulando. Para traértela a tu base local hace falta el binario de
[engram](https://github.com/Gentleman-Programming/engram), **3.5.2 o mayor**:

```bash
# macOS y Linux (incluido WSL2)
brew install gentleman-programming/tap/engram

# Alternativa si tenés Go, en cualquier sistema
go install github.com/Gentleman-Programming/engram/v3/cmd/engram@latest
```

El detalle por plataforma, incluido Windows nativo, está en la
[guía de instalación](https://github.com/Gentleman-Programming/engram/blob/main/docs/INSTALLATION.md).
Con el binario andando, una sola vez:

```bash
engram sync --import
```

De ahí en adelante el hook `post-merge` la importa solo en cada `git pull`.

**No bloquea nada el primer día.** El hook `post-merge` es best-effort: si engram no está
instalado se saltea sin romper el merge. Podés clonar, levantar el proyecto y trabajar sin
él, y sumarlo cuando quieras.

## Agentes

El repo funciona igual con Claude Code, Codex y OpenCode. Las reglas obligatorias las hace
cumplir git (`.githooks/`), así que valen para cualquier agente y para los pushes a mano.

| | Claude Code | Codex | OpenCode |
|---|---|---|---|
| Instrucciones | `CLAUDE.md` → `AGENTS.md` | `AGENTS.md` | `AGENTS.md` |
| Skills | `.claude/skills` (symlink a `.agents/skills`) | `.agents/skills` | `.agents/skills` |
| Aviso de push a `main` | `.claude/settings.json` | `.codex/config.toml` | `.opencode/plugins/` |

Los tres avisos llaman al mismo script, `.claude/hooks/block-push-to-protected.sh`. En Codex
hay que confiar en el proyecto para que lea `.codex/config.toml`.

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
