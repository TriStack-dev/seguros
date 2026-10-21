# Step 02 — Cuentas e infraestructura

**Etapa:** 1. Base · **Depende de:** 01 · **Leer:** `SPEC.md` secciones 5 y 8

Step mayormente manual (consolas web). El agente puede guiar y documentar; la creación de cuentas la hace una persona.

## Objetivo

Tener el repositorio protegido, los proyectos de Supabase por entorno y Vercel conectado, con deploys de preview por PR.

## Tareas

**GitHub**
- [ ] Crear la organización y el repo; subir el proyecto del step 01.
- [ ] Protección de `main`: requiere PR, 1 aprobación, CI en verde (se activa cuando exista el workflow del step 03) y sin push directo.

**Supabase** (cuentas productivas a nombre del cliente, ver Google Doc sección 10)
- [ ] Crear tres proyectos: `miseguro-dev`, `miseguro-staging`, `miseguro-prod`, en la región más cercana disponible (São Paulo).
- [ ] En los tres: desactivar el registro público de usuarios en Auth (los administradores se crean a mano, step 15).
- [ ] Guardar las cadenas de conexión (pooler y directa) y las claves de API en el gestor de contraseñas del equipo. **Nunca en el repo ni en el chat.**

**Vercel** (cuenta a nombre del cliente)
- [ ] Importar el repo. Producción = rama `main`; previews = cada PR.
- [ ] Cargar variables: Production apunta a `miseguro-prod`; Preview apunta a `miseguro-staging`.
- [ ] Verificar que un PR de prueba genere un preview.

**Documentación**
- [ ] Sección "Entornos" en el README: qué proyecto usa cada entorno, quién tiene acceso y cómo pedir las variables para `.env.local`.
- [ ] Registrar en `docs/decisiones/` qué cuentas están a nombre del cliente y cuáles del equipo.

## Criterios de aceptación

- No se puede pushear a `main`; un PR de prueba genera un preview en Vercel.
- Existen los tres proyectos de Supabase con el registro público desactivado.
- Cada integrante puede armar su `.env.local` siguiendo el README.

## Fuera de alcance

- Crear tablas (step 04). Dominio propio (step 25). Cuentas de Sentry, GA4 y Turnstile (sus steps).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
