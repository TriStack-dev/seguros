# Step 04 — Modelo de datos y Prisma

**Etapa:** 1. Base · **Depende de:** 01, 02 · **Leer:** `docs/reglas-negocio.md` secciones 1, 3, 4, 5 y 11

## Objetivo

Crear el esquema completo de la base con Prisma, la migración inicial con RLS activado y el cliente de Prisma listo para usar desde el servidor.

## Tareas

- [ ] Instalar Prisma (versión estable). Seguir la guía oficial **vigente** de Prisma + Supabase: la configuración de la conexión directa, el generador y el driver adapter cambian entre versiones mayores. Registrar la versión y la configuración elegida en `docs/decisiones/`.
- [ ] `DATABASE_URL` y `DIRECT_URL` ya están en `.env.example` con los valores locales (step 02). Acá solo documentá en el comentario de cada una la distinción que importa en la nube: `DATABASE_URL` es el pooler en modo transaction (la usa la app) y `DIRECT_URL` la conexión directa (la usan las migraciones). Los valores de staging y producción los carga el step 26.
- [ ] Escribir `prisma/schema.prisma` a partir del modelo propuesto (abajo). Se pueden ajustar detalles técnicos, pero los nombres de enums y valores tienen que coincidir con `docs/reglas-negocio.md`.
- [ ] Migración inicial (`pnpm db:migrate`). Agregar en la misma migración (o en una segunda, SQL manual) `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` para **todas** las tablas, sin políticas. Prisma se conecta con el rol dueño de las tablas y no se ve afectado; la clave pública de Supabase no puede leer nada.
- [ ] `src/lib/db.ts`: cliente de Prisma singleton (evitar múltiples instancias en desarrollo con hot reload). Importable solo desde el servidor (`import "server-only"`).
- [ ] Scripts: `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`), `db:studio`, `db:generate`, y `postinstall` con `prisma generate`.
- [ ] Documentar en el README cómo correr las migraciones en el entorno local (`db:migrate`). Las migraciones de staging y producción se aplican con `db:deploy`, pero esos entornos todavía no existen (step 26): dejar documentado el comando y diferir a ese step la decisión de si se corre a mano o en el build de Vercel, registrándola en `docs/decisiones/` cuando se haga.
- [ ] Ajustar el CI del step 03 si hace falta generar el cliente de Prisma antes del build.

## Modelo propuesto

```prisma
enum VehicleType { AUTO MOTO }
enum UsageType   { PARTICULAR COMMERCIAL RIDE_HAILING DELIVERY }
enum LeadStatus  { NEW CONTACTED QUOTED ISSUED LOST }
enum LostReason  { PRICE NO_RESPONSE WENT_ELSEWHERE JUST_ASKING INVALID_DATA OTHER }

model Lead {
  id               String       @id @default(uuid()) @db.Uuid
  requestNumber    Int          @unique @default(autoincrement())
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  vehicleType      VehicleType
  fullName         String
  phone            String       // 549 + área + número, solo dígitos
  email            String
  dni              String
  isZeroKm         Boolean      @default(false)
  plate            String?
  brandId          String?      @db.Uuid
  brand            VehicleBrand? @relation(fields: [brandId], references: [id])
  brandName        String       // copia del nombre (catálogo u "Otro")
  modelId          String?      @db.Uuid
  model            VehicleModel? @relation(fields: [modelId], references: [id])
  modelName        String
  version          String?
  year             Int
  hasGnc           Boolean?
  postalCode       String
  usage            UsageType
  consentAt        DateTime

  status           LeadStatus   @default(NEW)
  lostReason       LostReason?
  firstContactedAt DateTime?
  whatsappClickedAt DateTime?

  utmSource        String?
  utmMedium        String?
  utmCampaign      String?
  utmTerm          String?
  utmContent       String?
  gclid            String?
  landingPage      String?
  referrer         String?

  statusChanges    LeadStatusChange[]
  notes            LeadNote[]

  @@index([createdAt])
  @@index([status])
  @@index([phone])
  @@index([dni])
  @@index([plate])
}

model LeadStatusChange {
  id             String      @id @default(uuid()) @db.Uuid
  leadId         String      @db.Uuid
  lead           Lead        @relation(fields: [leadId], references: [id], onDelete: Cascade)
  fromStatus     LeadStatus?
  toStatus       LeadStatus
  changedById    String?     @db.Uuid   // id de Supabase Auth; null = sistema
  changedByEmail String?
  createdAt      DateTime    @default(now())
  @@index([leadId, createdAt])
}

model LeadNote {
  id          String   @id @default(uuid()) @db.Uuid
  leadId      String   @db.Uuid
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  body        String
  authorId    String   @db.Uuid
  authorEmail String
  createdAt   DateTime @default(now())
  @@index([leadId, createdAt])
}

model VehicleBrand {
  id          String         @id @default(uuid()) @db.Uuid
  name        String
  slug        String
  vehicleType VehicleType
  models      VehicleModel[]
  leads       Lead[]
  @@unique([vehicleType, slug])
}

model VehicleModel {
  id      String       @id @default(uuid()) @db.Uuid
  brandId String       @db.Uuid
  brand   VehicleBrand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  name    String
  slug    String
  leads   Lead[]
  @@unique([brandId, slug])
}

model SubmissionAttempt {
  id        String   @id @default(uuid()) @db.Uuid
  ipHash    String
  createdAt DateTime @default(now())
  @@index([ipHash, createdAt])
}
```

No hay tabla de administradores: se usan los usuarios de Supabase Auth (un solo rol).

## Criterios de aceptación

- La migración se aplica sin errores en la base local del step 02 y crea todas las tablas.
- En Studio local o con `psql` sobre la base local, `select relname, relrowsecurity from pg_class where relname in (...)` muestra RLS activado en todas las tablas.
- Una consulta con la clave pública (API REST de Supabase) a `Lead`, usando la URL y la clave pública **locales**, devuelve vacío o error, nunca datos.
- `pnpm build` y el CI siguen pasando.

## Fuera de alcance

- Datos del catálogo (step 05). Leads de prueba (step 16).

## Notas de implementación

- **Qué se hizo:** se instaló Prisma 7.10.1 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`)
  con `prisma.config.ts` y el generador `prisma-client`, se escribió `prisma/schema.prisma` con el
  modelo propuesto, se creó la migración inicial con RLS en todas las tablas (incluida
  `_prisma_migrations`), se agregó el cliente singleton `src/lib/db.ts` (solo servidor), los
  scripts de base, la sección "Migraciones" del README y se sacó del CI el `prisma generate`
  tolerante a errores.
- **Archivos clave:** `prisma.config.ts`, `prisma/schema.prisma`,
  `prisma/migrations/20261024214942_init/migration.sql`, `src/lib/db.ts`, `package.json`,
  `pnpm-workspace.yaml`, `.github/workflows/ci.yml`, `.env.example`, `README.md`, `.gitignore`,
  `.prettierignore`, `eslint.config.mjs`.
- **Decisiones:** Prisma 7.10.1 y no la RC 8; cliente generado en `src/generated/prisma` (no se
  versiona); `prisma.config.ts` carga `.env.local` con dotenv y lee `DIRECT_URL` con
  `process.env` para no romper el `postinstall` sin variables; tablas con los nombres de los
  modelos, sin `@@map`. Detalle en
  [0007](../decisiones/0007-prisma-7-con-supabase.md).
- **Desvíos del spec:** el RLS de `_prisma_migrations` (que el step no nombra pero está en
  `public`) es condicional (`DO $$ ... to_regclass ...`) porque `migrate dev` aplica primero en
  una base sombra donde esa tabla no existe. `pnpm-workspace.yaml` habilita los scripts de
  instalación de `prisma` y `@prisma/engines`, que pnpm bloquea por defecto.
- **Cómo probarlo:** con Docker corriendo y `.env.local` copiado de `.env.example`:
  `pnpm install`, `pnpm db:up`, `pnpm db:migrate`. Ver RLS con
  `docker exec supabase_db_seguros psql -U postgres -c "select relname, relrowsecurity from pg_class where relname in ('Lead','LeadStatusChange','LeadNote','VehicleBrand','VehicleModel','SubmissionAttempt','_prisma_migrations')"`
  (todas `t`). Con la clave pública:
  `curl 'http://127.0.0.1:54321/rest/v1/Lead?select=*' -H "apikey: <NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>"`
  devuelve `[]` aunque haya filas.
- **Pendientes:**
  - En `SPEC.md` la fila del step 02 figura `PENDIENTE` aunque el PR #10 está mergeado (un
    merge posterior pisó el cambio de `ef39185`). Corregirlo en un PR `docs/` aparte.
  - Los enums están duplicados entre `src/lib/constants.ts` y el schema de Prisma. Evaluar
    derivar las constantes de los tipos generados.
  - El hook `PreToolUse` de `.claude/settings.json` arma la ruta con `CLAUDE_PROJECT_DIR`: si la
    sesión de Claude Code se abre fuera del repo y se mueve con `/cd`, apunta a una ruta
    inexistente (error no bloqueante; el `pre-push` de git sigue protegiendo). Se podría usar
    `git rev-parse --show-toplevel`.
  - El step 26 decide si `db:deploy` se corre a mano o en el build de Vercel.
