-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AUTO', 'MOTO');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('PARTICULAR', 'COMMERCIAL', 'RIDE_HAILING', 'DELIVERY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'ISSUED', 'LOST');

-- CreateEnum
CREATE TYPE "LostReason" AS ENUM ('PRICE', 'NO_RESPONSE', 'WENT_ELSEWHERE', 'JUST_ASKING', 'INVALID_DATA', 'OTHER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "requestNumber" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "isZeroKm" BOOLEAN NOT NULL DEFAULT false,
    "plate" TEXT,
    "brandId" UUID,
    "brandName" TEXT NOT NULL,
    "modelId" UUID,
    "modelName" TEXT NOT NULL,
    "version" TEXT,
    "year" INTEGER NOT NULL,
    "hasGnc" BOOLEAN,
    "postalCode" TEXT NOT NULL,
    "usage" "UsageType" NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "lostReason" "LostReason",
    "firstContactedAt" TIMESTAMP(3),
    "whatsappClickedAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "landingPage" TEXT,
    "referrer" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStatusChange" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "fromStatus" "LeadStatus",
    "toStatus" "LeadStatus" NOT NULL,
    "changedById" UUID,
    "changedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAttempt" (
    "id" UUID NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_requestNumber_key" ON "Lead"("requestNumber");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_dni_idx" ON "Lead"("dni");

-- CreateIndex
CREATE INDEX "Lead_plate_idx" ON "Lead"("plate");

-- CreateIndex
CREATE INDEX "LeadStatusChange_leadId_createdAt_idx" ON "LeadStatusChange"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_vehicleType_slug_key" ON "VehicleBrand"("vehicleType", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_brandId_slug_key" ON "VehicleModel"("brandId", "slug");

-- CreateIndex
CREATE INDEX "SubmissionAttempt_ipHash_createdAt_idx" ON "SubmissionAttempt"("ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStatusChange" ADD CONSTRAINT "LeadStatusChange_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS en todas las tablas, sin políticas: la API REST de Supabase (clave pública) no puede
-- leer ni escribir nada. Prisma se conecta con el rol dueño de las tablas y no se ve afectado.
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadStatusChange" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VehicleBrand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VehicleModel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubmissionAttempt" ENABLE ROW LEVEL SECURITY;
-- La tabla de control de Prisma también está en el esquema public. Es condicional porque
-- `migrate dev` aplica primero las migraciones a una base sombra donde todavía no existe.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;
