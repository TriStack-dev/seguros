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

_Se completa al cerrar el step (ver `AGENTS.md`)._
