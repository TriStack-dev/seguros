import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// La CLI de Prisma no carga variables sola: usamos el mismo .env.local que Next.js.
// Si el archivo no existe (CI, clon nuevo) se usan las variables del entorno.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // La CLI (migrate, studio) usa la conexión directa, nunca el pooler.
    // process.env y no env(): env() falla si falta la variable, incluso en `prisma generate`
    // (postinstall), que no necesita la base.
    url: process.env.DIRECT_URL ?? "",
  },
});
