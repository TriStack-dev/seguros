/**
 * Crea un administrador del panel con la Admin API de Supabase.
 *
 *   pnpm admin:create <email>
 *
 * Genera una contraseña temporal aleatoria y la muestra UNA vez por la terminal (es la única
 * forma de entregarla). Pasale el email y la contraseña a la persona por un canal privado y
 * pedile que la cambie desde "Olvidé mi contraseña". Usa SUPABASE_SECRET_KEY, que nunca se
 * imprime. Corre solo en tu máquina o en un entorno de confianza.
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local", quiet: true });

async function main() {
  const email = z.email().safeParse(process.argv[2]?.trim());
  if (!email.success) {
    console.error("Uso: pnpm admin:create <email>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY (revisá .env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password = randomBytes(15).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({
    email: email.data,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error(`No se pudo crear el administrador: ${error.message}`);
    process.exit(1);
  }

  console.log(`Administrador creado: ${data.user.email}`);
  console.log(`Contraseña temporal (se muestra solo ahora): ${password}`);
}

void main();
