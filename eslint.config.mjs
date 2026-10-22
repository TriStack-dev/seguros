import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Último de la lista: apaga las reglas de ESLint que chocan con el formato de Prettier.
  // El formato lo decide Prettier (`pnpm format`), ESLint solo mira la calidad del código.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Propios del repo:
    "coverage/**",
  ]),
]);

export default eslintConfig;
