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

Hace falta además **Docker** corriendo, para levantar Supabase local (ver "Entorno local").
La CLI de Supabase no se instala aparte: viene como dependencia de desarrollo con
`pnpm install`.

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
pnpm db:up                   # Supabase local en Docker (ver "Entorno local")
pnpm db:deploy               # aplica las migraciones de Prisma
pnpm db:seed                 # carga el catálogo de vehículos (sin esto los selects vienen vacíos)
pnpm dev                     # http://localhost:3000
```

### Git hooks

`pnpm install` los activa solo (script `prepare`). Si clonaste sin instalar, o querés
asegurarte:

```bash
git config core.hooksPath .githooks
```

`core.hooksPath` vive en `.git/config`, que no se versiona, así que cada clon lo necesita.
Los hooks de [`.githooks/`](.githooks) sincronizan la memoria y protegen las ramas:

- `pre-push` rechaza los pushes directos a `main` y `master`, los nombres de rama fuera de
  la convención y los pushes con memoria de engram sin commitear.
- `post-merge` importa la memoria después de un pull con merge o fast-forward.
- `post-rewrite` la importa después de un rebase (incluido `git pull --rebase`).
- `post-checkout` la importa al cambiar de rama.
- `pnpm install` activa los hooks e importa la memoria disponible.

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

De ahí en adelante los hooks importan la memoria al actualizar el repo. Si Git no
cambia nada (por ejemplo, un pull que ya está al día), podés importarla manualmente.
Los errores se muestran sin revertir el merge, rebase o checkout.

Antes de pushear, el hook exporta la memoria del proyecto. Si falta Engram o falla la
exportación, bloquea el push. Si hay archivos nuevos o modificados en `.engram/`,
revisalos e incluílos en un commit y volvé a pushear:

```bash
git add .engram
git commit -m "chore: sync engram memory"
git push
```

La memoria llega a quienes descargan esa rama; para compartirla por `main`, el PR debe
estar mergeado. Los prompts crudos se excluyen de las nuevas exportaciones por defecto;
esto no elimina prompts que ya hayan sido versionados.

Cada integrante necesita Engram instalado y conectado a su agente. Los hooks comparten
lo que el agente guardó: no generan resúmenes de conversaciones ni de cambios de código.
El agente debe consultar Engram para usar la memoria importada.

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

## Entorno local

Todo el desarrollo corre contra un Supabase local (PostgreSQL 17 + Auth + Studio) que la CLI
de Supabase levanta en Docker. No hace falta ninguna cuenta en la nube: staging y producción
se crean en el step 26 y la diferencia es solo de variables de entorno. La configuración es la
misma para todos porque está versionada en [`supabase/config.toml`](supabase/config.toml)
(con el registro público de usuarios desactivado: los administradores se crean a mano).

**Requisitos:** Docker corriendo (Docker Engine en Linux, Docker Desktop u OrbStack en macOS,
Docker Desktop con backend WSL2 en Windows). La primera levantada descarga las imágenes y
tarda unos minutos; las siguientes, segundos.

```bash
pnpm db:up        # levanta el entorno y muestra URLs y claves
pnpm db:status    # vuelve a mostrar URLs y claves
pnpm db:restart   # baja y vuelve a levantar (conserva los datos)
pnpm db:down      # apaga los contenedores (conserva los datos)
```

| Servicio | URL |
| --- | --- |
| API de Supabase (Auth incluido) | http://127.0.0.1:54321 |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio (panel web de la base) | http://127.0.0.1:54323 |
| Mailpit (mails que manda Auth) | http://127.0.0.1:54324 |

Las variables de [`.env.example`](.env.example) ya traen los valores locales: con copiarlo a
`.env.local` alcanza. Si en tu máquina no coinciden, `pnpm db:status` muestra los correctos.

### Administradores del panel

El panel (`/admin`) se protege con Supabase Auth. No hay registro público: las cuentas las
crea el equipo con el script `admin:create`, que usa la Admin API y `SUPABASE_SECRET_KEY`
(desde `.env.local`, nunca se imprime).

```bash
pnpm admin:create persona@ejemplo.com
```

El script crea el usuario ya confirmado con una contraseña temporal aleatoria, que muestra
**una sola vez** por la terminal. Pasásela a la persona por un canal privado; puede cambiarla
desde "Olvidé mi contraseña" en `/admin/login`. En local, el mail de recuperación se ve en
Mailpit (http://127.0.0.1:54324). Entrá siempre por el mismo host (`localhost` o `127.0.0.1`)
durante todo el flujo de recuperación, porque la sesión viaja en cookies.

Las claves `sb_publishable_...` y `sb_secret_...` de Supabase equivalen a las legacy `anon` y
`service_role`, respectivamente.

**Borrar todos los datos locales** y arrancar de cero:
`pnpm exec supabase stop --no-backup` y después `pnpm db:up`.

### Migraciones

El esquema de la base está en [`prisma/schema.prisma`](prisma/schema.prisma) y las
migraciones en `prisma/migrations/`. Con Supabase local levantado:

```bash
pnpm db:migrate      # aplica las migraciones pendientes (y crea una nueva si cambiaste el schema)
pnpm db:studio       # Prisma Studio para ver y editar datos
pnpm db:generate     # regenera el cliente (también corre solo en cada pnpm install)
```

Para crear una migración nueva, cambiá el schema y corré `pnpm db:migrate --name <nombre>`.
Si necesitás agregarle SQL a mano (por ejemplo RLS en una tabla nueva), usá
`pnpm db:migrate --name <nombre> --create-only`, editá el `migration.sql` y volvé a correr
`pnpm db:migrate`. **Toda tabla nueva lleva `ENABLE ROW LEVEL SECURITY`** (ver `AGENTS.md`).

**Borrar los datos y reaplicar las migraciones:** `pnpm exec prisma migrate reset`.

En staging y producción las migraciones se aplican con `pnpm db:deploy`
(`prisma migrate deploy`, que solo aplica las existentes y nunca crea nuevas). Si se corre a
mano o en el build de Vercel se decide en el step 26.

**Si un puerto está ocupado** (`port is already allocated` o similar):

1. Si es otro proyecto de Supabase que quedó levantado, apagalo con
   `pnpm exec supabase stop --all`.
2. Si no, buscá qué lo usa: `ss -ltnp | grep 5432` en Linux, `lsof -i :54322` en macOS o
   `netstat -ano | findstr 54322` en Windows, y cerralo.
3. Como último recurso, cambiá el puerto en `supabase/config.toml` (`[api]`, `[db]`,
   `[studio]`, etc.) **solo en tu copia, sin commitearlo**, y ajustá las URLs de tu
   `.env.local`.

### Catálogo de vehículos

[`prisma/seed/vehicles.json`](prisma/seed/vehicles.json) es el catálogo [PROVISORIO] de
marcas y modelos que alimentan los selects del formulario. Se versiona en el repo y se carga
en la base con:

```bash
pnpm db:seed         # prisma db seed (usa tsx, no hace falta compilar)
```

Es idempotente: hace upsert por slug en marcas y modelos, así que se puede correr las veces
que haga falta sin duplicar filas. No borra lo que ya no está en el JSON porque puede tener
leads asociados: lo lista por consola para revisarlo a mano.

Para actualizar el catálogo:

1. Editá `prisma/seed/vehicles.json`: marcas con sus modelos, en la grafía oficial, sin año
   ni versión (las variantes muy distintas van separadas: "Hilux" y "SW4").
2. Cambiá `version` a la fecha del cambio (`AAAA-MM-DD`) y actualizá `sources` si sumaste
   fuentes.
3. Corré `pnpm db:seed` en cada entorno donde tenga que estar el catálogo actualizado.
4. `pnpm test` valida el JSON antes de cargarlo: estructura, mínimos de marcas, duplicados
   por slug, orden alfabético y el top 10 de patentamientos.

Los nombres se guardan con slug (`fiat`, `cronos`; sin acentos ni mayúsculas) para que un
cambio de grafía no duplique la fila.

## Variables de entorno

Se declaran en [`.env.example`](.env.example) con un comentario de qué son y dónde se
obtienen. Para trabajar en local, copialas a `.env.local` (ignorado por git) y completalas.
La tabla completa, con el step en el que aparece cada una, está en la sección 5 de
[`SPEC.md`](SPEC.md).

Nunca se commitea un archivo con valores reales: solo `.env.example`, con los nombres
vacíos. La única excepción son las variables de Supabase local, que llevan valor porque son
públicas y fijas (ver [`docs/decisiones/0003`](docs/decisiones/0003-desarrollo-contra-supabase-local.md)).

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, sin barra final (en local, `http://localhost:3000`) |
| `DATABASE_URL` | Conexión de la app a la base (con pooler en la nube; en local, directa) |
| `DIRECT_URL` | Conexión directa a la base, para las migraciones |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la API de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase |
| `SUPABASE_SECRET_KEY` | Clave secreta de Supabase, solo servidor y scripts |

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
pnpm db:up           # levanta Supabase local (ver "Entorno local")
pnpm db:down         # apaga Supabase local
pnpm db:restart      # reinicia Supabase local
pnpm db:status       # URLs y claves de Supabase local
pnpm admin:create    # crea un administrador del panel (ver "Administradores del panel")
pnpm db:migrate      # aplica y crea migraciones en local (prisma migrate dev)
pnpm db:deploy       # aplica migraciones en staging y producción (prisma migrate deploy)
pnpm db:seed         # carga el catálogo de vehículos (prisma db seed)
pnpm db:studio       # Prisma Studio
pnpm db:generate     # regenera el cliente de Prisma
```

Antes de dar un step por terminado tienen que pasar `pnpm lint`, `pnpm typecheck`,
`pnpm test` y `pnpm build` (ver [`AGENTS.md`](AGENTS.md)).

## Estructura

El árbol de carpetas y qué va en cada una está en la sección 4 de [`SPEC.md`](SPEC.md).
Los componentes de `src/components/ui/` los genera el CLI de
[shadcn/ui](https://ui.shadcn.com); se agregan con `pnpm dlx shadcn@latest add <componente>`.
