import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Los tests corren siempre en UTC, en las tres máquinas del equipo y en el CI.
//
// Sin esto, cualquier test que toque fechas depende de la zona horaria del sistema y pasa
// en una máquina y falla en otra. UTC y no `America/Argentina/Buenos_Aires` a propósito:
// los servidores de Vercel corren en UTC, así que un código que formatea una fecha sin
// pasarle la zona explícita falla acá igual que fallaría en producción. Si los tests
// corrieran en hora de Argentina, ese error pasaría el CI y se vería recién en el sitio.
process.env.TZ = "UTC";

// `resolve.tsconfigPaths` resuelve el alias `@/*` del tsconfig, para que los tests importen
// igual que el resto del código. `react` habilita JSX en los tests de componentes.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    // Los tests del seed viven junto al JSON que validan, fuera de src/.
    include: ["src/**/*.test.{ts,tsx}", "prisma/**/*.test.ts"],
  },
});
