# Step 26 — Cuentas e infraestructura (Supabase y Vercel)

**Etapa:** 5. Lanzamiento · **Depende de:** 00, 01 · **Leer:** `SPEC.md` secciones 5 y 8

Step mayormente manual (consolas web). El agente puede guiar y documentar; la creación de cuentas la hace una persona.

## Contexto

Este step estaba al principio del plan y se movió al final porque crear estas cuentas requiere definir con el cliente a nombre de quién quedan (step 00), y el desarrollo arranca antes, contra el entorno local del step 02. Hasta que este step esté hecho no hay staging, ni producción, ni previews de Vercel.

## Objetivo

Tener el repositorio protegido, los proyectos de Supabase de staging y producción, y Vercel conectado, con deploys de preview por PR.

## Tareas

**GitHub**
- [ ] Protección de `main`: requiere PR, CI en verde (workflow del step 03) y sin push directo. Sin exigir aprobaciones: el equipo es chico y `AGENTS.md` no pide revisión de otra persona. El hook `.githooks/pre-push` ya bloquea el push directo a `main` en cada clon local; esta protección es la capa definitiva, del lado del servidor, y no se puede saltear con `--no-verify`.

**Supabase** (cuentas productivas a nombre del cliente, ver Google Doc sección 10)
- [ ] Crear dos proyectos: `miseguro-staging` y `miseguro-prod`, en la región más cercana disponible (São Paulo). El desarrollo no necesita un tercer proyecto: usa el entorno local del step 02.
- [ ] En los dos: desactivar el registro público de usuarios en Auth (los administradores se crean a mano, step 15).
- [ ] Guardar las cadenas de conexión (pooler y directa) y las claves de API en el gestor de contraseñas del equipo. **Nunca en el repo ni en el chat.**
- [ ] Aplicar las migraciones en staging (`pnpm db:deploy`) y cargar el catálogo (`pnpm db:seed`). En producción lo hace el step 25.
- [ ] Crear los administradores de staging con `pnpm admin:create` (step 15).

**Vercel** (cuenta a nombre del cliente)
- [ ] Importar el repo. Producción = rama `main`; previews = cada PR.
- [ ] Cargar variables: Production apunta a `miseguro-prod`; Preview apunta a `miseguro-staging`.
- [ ] Verificar que un PR de prueba genere un preview.

**Documentación**
- [ ] Sección "Entornos" en el README: qué proyecto usa cada entorno, quién tiene acceso y cómo pedir las variables para `.env.local`.
- [ ] Registrar en `docs/decisiones/` qué cuentas están a nombre del cliente y cuáles del equipo.

## Criterios de aceptación

- No se puede pushear a `main` directamente, ni siquiera saltando el hook local; un PR de prueba genera un preview en Vercel.
- Existen los dos proyectos de Supabase (`miseguro-staging` y `miseguro-prod`) con el registro público desactivado.
- Staging tiene el esquema aplicado y el catálogo cargado.
- Cada integrante puede armar las variables de staging siguiendo el README.

## Fuera de alcance

- Crear tablas (step 04). Dominio propio (step 25). Cuentas de Sentry, GA4 y Turnstile (sus steps).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
