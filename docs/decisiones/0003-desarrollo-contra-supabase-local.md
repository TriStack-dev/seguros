# 0003 — Desarrollo contra Supabase local, infraestructura en la nube al final

- **Fecha:** 2026-10-22
- **Step:** 02
- **Estado:** Aceptada

## Contexto
El plan original ponía las cuentas de Supabase y Vercel en el step 02, como prerequisito de casi
todo (04, 15, 23 y 24 dependían de él). Pero esas cuentas van a nombre del cliente y su creación
depende de una conversación que todavía no pasó (step 00: a nombre de quién quedan). Esperarla
deja al equipo sin poder escribir código, porque el modelo de datos, el seed, el login del panel y
buena parte del producto necesitan una base y un Auth corriendo.

## Decisión
El step 02 pasa a ser el entorno de desarrollo local con la CLI de Supabase (PostgreSQL + Auth +
Studio sobre Docker, con `supabase/config.toml` versionado en el repo). Las cuentas en la nube se
mueven al step 26, en la etapa de lanzamiento. El CI del step 03 no se mueve: no necesita ninguna
cuenta más allá de GitHub. En la nube quedan dos proyectos (staging y producción) en lugar de tres,
porque desarrollo ya es local.

## Alternativas descartadas
- **PostgreSQL pelado con Docker Compose:** alcanza para Prisma y el seed, pero deja el step 15
  (Supabase Auth) bloqueado y hace que el entorno local no se parezca al de producción.
- **Solo reordenar el índice sin entorno local:** dejaba bloqueados los steps 04, 05, 10, 11, 12,
  14 y 15-20, es decir casi todo el producto, hasta que existieran las cuentas en la nube.
- **Crear igual un proyecto de Supabase gratuito del equipo para desarrollo:** agrega una cuenta
  que después hay que migrar o dar de baja, y el plan gratuito pausa los proyectos inactivos
  (sección 8 del spec), con el riesgo de que el entorno de desarrollo se caiga solo.

## Consecuencias
- Las dependencias de los steps 23, 24 y 25 ahora apuntan al 26 (`01, 26`; `04, 26`; `00 a 24 y
  26`), aunque su número sea anterior.
- En la etapa 5 el número de step dejó de marcar el orden de ejecución: manda la columna "Depende
  de" (sección 9 de `SPEC.md`).
- El entorno local suma Docker como requisito para trabajar en el repo.
- Las claves locales de Supabase son públicas y fijas (la CLI las documenta igual en cada
  instalación), así que pueden ir con valor en `.env.example`, a diferencia del resto de las
  variables del proyecto. Esto no contradice la sección "Seguridad" de `AGENTS.md`: esa regla
  protege secretos reales (claves de proyectos en la nube, tokens), no valores públicos de un
  entorno que corre solo en la máquina de cada integrante.
- Si el cliente define las cuentas antes de lo esperado, el step 26 se puede hacer en cualquier
  momento sin tocar nada de lo ya construido: la diferencia entre local y nube es solo de
  variables de entorno.
