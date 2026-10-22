import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js genera y sobreescribe su propio AGENTS.md en cada `next dev`. El AGENTS.md de
  // este repo son las reglas de trabajo del equipo, así que apagamos esa generación.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
