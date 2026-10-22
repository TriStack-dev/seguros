/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 no tiene archivo de config: el plugin lee el stylesheet para saber el orden
  // de las clases y los tokens del tema.
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
