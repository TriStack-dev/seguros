# 0005 — Versión de la CLI y configuración de Supabase local

- **Fecha:** 2026-10-24
- **Step:** 02
- **Estado:** Aceptada

## Contexto
La CLI de Supabase cambia entre versiones mayores (comandos, puertos, forma del `config.toml`,
nombres de las claves locales), y cada versión de la CLI fija las imágenes de Docker que levanta.
Para que todos tengan el mismo entorno hay que fijar la versión y versionar la configuración.

## Decisión
- **CLI:** paquete `supabase` **2.122.0**, como dependencia de desarrollo con versión exacta (sin
  `^`), para que todos levanten las mismas imágenes. Se actualiza a propósito, en su propio PR.
- **Configuración:** `supabase/config.toml` generado con `supabase init` de esa versión, con dos
  cambios: `[auth] enable_signup = false` y `[auth.email] enable_signup = false` (sin registro
  público; los administradores se crean a mano en el step 15), y `[db] major_version = 17`
  (PostgreSQL 17, la versión por defecto de los proyectos nuevos de Supabase; el step 26 tiene
  que crear staging y producción en la misma mayor). El resto queda en los valores por defecto.
- **Puertos por defecto:** API 54321, base 54322, Studio 54323, Mailpit 54324.
- **Claves locales:** las nuevas (`sb_publishable_...` y `sb_secret_...`), que son las que usa
  `.env.example`. Las JWT viejas (`ANON_KEY`, `SERVICE_ROLE_KEY`) no se usan.
- **Sin pooler en local:** `DATABASE_URL` y `DIRECT_URL` apuntan las dos a la base directa. El
  pooler aparece recién en la nube (step 26).
- **Scripts:** `db:up`, `db:down`, `db:restart` y `db:status`. No se definió `db:reset` a
  propósito: `supabase db reset` reaplica las migraciones de `supabase/migrations/`, pero las
  migraciones del proyecto las maneja Prisma (step 04), así que borraría las tablas sin
  recrearlas. El reset de datos lo va a dar `prisma migrate reset`.

## Alternativas descartadas
- **CLI global (brew, scoop):** cada integrante tendría una versión distinta.
- **Versión con `^`:** una minor nueva puede traer imágenes distintas y el entorno deja de ser
  el mismo para todos.
- **Desactivar Storage, Realtime y Edge Functions para aligerar Docker:** ahorra memoria pero
  aleja el entorno del de producción y suma cambios al `config.toml` por defecto. Se puede
  revisar si a alguien le pesa.

## Consecuencias
- Actualizar la CLI es un cambio deliberado: subir la versión, revisar el changelog y comparar el
  `config.toml` contra uno nuevo de `supabase init`.
- Si el step 26 encuentra que la nube da otra mayor de PostgreSQL, hay que cambiar
  `major_version` acá en el mismo PR.
