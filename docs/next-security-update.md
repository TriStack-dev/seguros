# Actualización de seguridad de Next.js

Se actualiza Next.js de 16.4.2 a 16.4.6, la versión corregida indicada por
`pnpm exec next upgrade --agent=security`. Se mantienen alineados
`@next/third-parties` y `eslint-config-next` con esa versión.

La configuración `experimental.agentUpgrade: "security"` conserva el modo de
actualización de seguridad recomendado por la herramienta. No se adoptan cambios
experimentales adicionales ni se modifica la lógica de la aplicación.

Para verificar: `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
Después de instalar las dependencias, reiniciar el servidor de desarrollo.
