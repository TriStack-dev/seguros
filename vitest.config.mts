import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// `resolve.tsconfigPaths` resuelve el alias `@/*` del tsconfig, para que los tests importen
// igual que el resto del código. `react` habilita JSX en los tests de componentes.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
