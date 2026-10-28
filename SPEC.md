# SPEC — MiSeguro

Fuente de verdad del proyecto para el equipo y para los agentes (Claude Code y Codex).
Las reglas de trabajo están en `AGENTS.md`, las reglas de negocio en `docs/reglas-negocio.md` y el detalle de cada step en `docs/steps/`.

**Cómo se usa**

1. El equipo acuerda quién toma cada step. Un step se puede empezar cuando sus dependencias están `DONE`.
2. El agente lee **solo** el archivo del step en `docs/steps/` y los documentos que ese archivo indique.
3. Al terminar, se marca el step en el índice (sección 9) y se completan sus notas de implementación, según el protocolo de `AGENTS.md`.

---

## 1. Contexto

MiSeguro es una plataforma web para un broker de seguros. El usuario completa un formulario para asegurar su **auto o moto**, queda registrado como **lead** y es derivado por **WhatsApp** a un asesor con un mensaje ya escrito que incluye todos sus datos. La cotización y la emisión de la póliza las hacen los brokers fuera de la plataforma. Un **panel de administración** privado permite hacer el seguimiento de cada lead y ver estadísticas.

Flujo principal:

1. El usuario entra a la landing (o directo a `/cotizar/auto` o `/cotizar/moto` desde un anuncio).
2. Completa el formulario, acepta la política de privacidad y presiona **Iniciar cotización**.
3. El servidor valida, guarda el lead con estado `NUEVO` y genera un número de solicitud (`MS-000123`).
4. Ve una pantalla de confirmación con el número y el botón **Abrir WhatsApp**, que abre el chat con el broker y el mensaje precargado.
5. El asesor sigue la conversación por WhatsApp y actualiza el estado del lead en el panel.

## 2. Alcance del MVP

**Entra:** landing, formulario de autos y motos, registro de leads, derivación a WhatsApp (link `wa.me`), panel con login (listado, detalle, estados, notas, CSV, estadísticas), anti-spam, SEO técnico, medición (GA4, Tag Manager, Search Console), monitoreo de errores (Sentry) y backups.

**No entra:** cotización automática o comparación de aseguradoras, emisión y pagos en línea, API de WhatsApp Business, roles de usuario en el panel (hay un solo rol), asignación de leads a asesores, aviso por email de leads nuevos, landings de contenido por vehículo o zona, gestión de Google Ads y tests E2E.

## 3. Stack

| Pieza | Tecnología |
| --- | --- |
| Lenguaje | TypeScript en modo `strict` |
| Runtime y paquetes | Node LTS vigente (fijado en `.nvmrc`) y **pnpm** |
| Framework | Next.js (App Router, última versión estable): Server Components para páginas públicas, Server Actions para formulario y panel |
| UI | Tailwind CSS + shadcn/ui; gráficos con los charts de shadcn/ui (Recharts) |
| Formularios | React Hook Form + Zod (mismo esquema en navegador y servidor) |
| ORM | Prisma (conexión con pooler para la app y conexión directa para migraciones) |
| Base de datos | Supabase PostgreSQL, con RLS activado en todas las tablas. En desarrollo, Supabase local con la CLI (Docker) |
| Autenticación del panel | Supabase Auth con `@supabase/ssr` (email y contraseña) |
| Anti-spam | Cloudflare Turnstile + límite de envíos por IP en la base + honeypot |
| Tests | Vitest, solo tests unitarios por ahora |
| Medición | Google Tag Manager + GA4, Search Console |
| Errores en producción | Sentry (plan gratuito) |
| Hosting y CI | Vercel (previews por PR, se conecta en el step 26) y GitHub Actions |

Se usan siempre los planes gratuitos; se pasa a un plan pago solo si el uso lo exige.

## 4. Estructura del proyecto

```
src/
  app/
    (public)/                 landing, /cotizar/[tipo], /privacidad
    admin/login/              login del panel
    admin/(protected)/        leads, leads/[id], estadisticas
    api/                      route handlers (modelos de vehículos, derivación a WhatsApp)
    sitemap.ts  robots.ts  layout.tsx
  components/
    ui/                       componentes de shadcn/ui (generados)
    public/                   componentes del sitio público
    admin/                    componentes del panel
  lib/
    validation/               esquemas Zod + tests
    leads/                    número de solicitud, transiciones de estado + tests
    whatsapp/                 armado del mensaje y del link + tests
    attribution/              lectura y escritura de UTM, gclid y página de entrada
    db.ts                     cliente de Prisma (singleton)
    supabase/                 clientes de Supabase para servidor y navegador
  server/
    actions/                  Server Actions (formulario y panel)
    queries/                  consultas de lectura del panel
  proxy.ts                    (o middleware.ts según la versión de Next.js)
prisma/
  schema.prisma  migrations/  seed/
docs/
  steps/  decisiones/  reglas-negocio.md
```

## 5. Entornos y variables

| Entorno | Base de datos | Deploy |
| --- | --- | --- |
| Local | Supabase local (CLI, Docker) | `pnpm dev` |
| Staging | Proyecto de Supabase de staging | Preview de Vercel por cada PR |
| Producción | Proyecto de Supabase de producción | Deploy automático al mergear a `main` |

Staging y producción no existen hasta el step 26, porque crear esas cuentas requiere definirlas con el cliente (step 00). Mientras tanto, todo el desarrollo y la verificación se hacen en local (step 02).

Variables (cada step agrega las suyas a `.env.example`, con un comentario de qué son y dónde se obtienen):

| Variable | Uso | Step |
| --- | --- | --- |
| `DATABASE_URL` | Conexión con pooler (app) | 02, 04 |
| `DIRECT_URL` | Conexión directa (migraciones) | 02, 04 |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (metadatos, sitemap, robots) | 01, 22 |
| `WHATSAPP_NUMBER` | Número de brokers, solo dígitos; alternativa si falla el captcha y link de derivación | 11, 14 |
| `IP_HASH_SALT` | Sal privada aleatoria y estable por entorno para guardar sha256(IP + sal); obligatoria | 11 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Captcha Turnstile: claves oficiales de prueba solo en desarrollo; secret solo servidor | 11 |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Auth (la clave publicable equivale a `anon`) | 02, 15 |
| `SUPABASE_SECRET_KEY` | Solo servidor y scripts (crear administradores; equivale a `service_role`) | 02, 15 |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager | 21 |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Sentry | 23 |

## 6. Documentos de referencia

- `docs/reglas-negocio.md`: validaciones, número de solicitud, estados y transiciones, mensaje de WhatsApp, atribución, eventos de GA4 y formato del CSV. Los steps indican qué secciones leer.
- `docs/decisiones/`: decisiones técnicas relevantes (una por archivo, con la plantilla `_plantilla.md`).
- Google Doc "Documentación — MiSeguro (v2)" (interno): origen funcional. Si algo cambia, se actualiza este spec y las reglas de negocio, que son las que mandan.

## 7. Valores provisorios

Lo marcado como **[PROVISORIO]** en `docs/reglas-negocio.md` es un supuesto del equipo mientras el cliente no responde (step 00). Se implementa igual, centralizado en constantes para cambiarlo fácil. Cuando el cliente responde:

1. Se actualiza `docs/reglas-negocio.md` y se quita la marca.
2. Si el cambio afecta código ya hecho, se agrega un step nuevo al final del índice.

Provisorios actuales: patente opcional para 0 km, rango de años, versión opcional, GNC solo para autos, tipos de uso, texto del mensaje de WhatsApp, motivos de "Perdido", límite de envíos por IP, manejo de duplicados, columnas del CSV, catálogo de vehículos, datos legales del sitio y procedimiento de backups.

## 8. Riesgos conocidos

- El plan gratuito de Vercel está pensado para uso no comercial; puede hacer falta pasar a Pro al lanzar.
- El plan gratuito de Supabase pausa proyectos inactivos (afecta sobre todo a staging) y no incluye backups descargables (ver step 24).
- El link `wa.me` registra que el usuario tocó el botón, no que el mensaje llegó.
- El catálogo de vehículos es propio y parcial; por eso siempre existe la opción "Otro".

## 9. Índice de steps

Estrategia: el desarrollo arranca contra el entorno local del step 02, y las cuentas en la nube se crean en el step 26, después de hablar con el cliente.

Estado: `PENDIENTE` o `DONE · AAAA-MM-DD · quién · #PR`.

| # | Step | Etapa | Depende de | Estado |
| --- | --- | --- | --- | --- |
| 00 | [Relevamiento con el cliente](docs/steps/00-relevamiento-cliente.md) | 0. Relevamiento | — | PENDIENTE |
| 01 | [Setup del proyecto](docs/steps/01-setup-proyecto.md) | 1. Base | — | DONE · 2026-10-22 · Walter · #6 |
| 02 | [Entorno de desarrollo local](docs/steps/02-entorno-local.md) | 1. Base | 01 | DONE · 2026-10-24 · Walter · #10 |
| 03 | [CI con GitHub Actions](docs/steps/03-ci.md) | 1. Base | 01 | DONE · 2026-10-24 · Crove · #3 |
| 04 | [Modelo de datos y Prisma](docs/steps/04-modelo-datos.md) | 1. Base | 01, 02 | DONE · 2026-10-24 · Walter · #16 |
| 05 | [Seed del catálogo de vehículos](docs/steps/05-seed-vehiculos.md) | 1. Base | 04 | DONE · 2026-10-26 · Crove · #22 |
| 06 | [Esquemas de validación](docs/steps/06-validaciones.md) | 2. Formulario | 01 | DONE · 2026-10-24 · Crove · #6 |
| 07 | [Layout base y landing](docs/steps/07-layout-landing.md) | 2. Formulario | 01 | DONE · 2026-10-24 · Teo · #12 |
| 08 | [Páginas legales y datos del productor](docs/steps/08-paginas-legales.md) | 2. Formulario | 07 | DONE · 2026-10-24 · Teo · #15 |
| 09 | [Formulario de cotización (UI)](docs/steps/09-formulario.md) | 2. Formulario | 05, 06, 07 | DONE · 2026-10-27 · Teo · #27 |
| 10 | [Envío y registro del lead](docs/steps/10-envio-lead.md) | 2. Formulario | 04, 06, 09 | DONE · 2026-10-27 · Teo · #28 |
| 11 | [Anti-spam](docs/steps/11-anti-spam.md) | 2. Formulario | 10 | DONE · 2026-10-28 · Teo · #37 |
| 12 | [Atribución (UTM, gclid, página de entrada)](docs/steps/12-atribucion.md) | 2. Formulario | 10 | DONE · 2026-10-27 · Walter · #31 |
| 13 | [Mensaje y link de WhatsApp](docs/steps/13-mensaje-whatsapp.md) | 3. WhatsApp | 06 | DONE · 2026-10-26 · Crove · #21 |
| 14 | [Confirmación y derivación a WhatsApp](docs/steps/14-confirmacion-whatsapp.md) | 3. WhatsApp | 10, 13 | DONE · 2026-10-28 · Teo · #38 |
| 15 | [Login del panel](docs/steps/15-auth-admin.md) | 4. Panel | 02, 04 | DONE · 2026-10-26 · Walter · #26 |
| 16 | [Listado de leads](docs/steps/16-panel-listado.md) | 4. Panel | 10, 15 | DONE · 2026-10-28 · Walter · #32 |
| 17 | [Detalle del lead y estados](docs/steps/17-panel-detalle-estados.md) | 4. Panel | 12, 16 | DONE · 2026-10-28 · Walter · #35 |
| 18 | [Notas del lead](docs/steps/18-panel-notas.md) | 4. Panel | 17 | PENDIENTE |
| 19 | [Exportación a CSV](docs/steps/19-panel-csv.md) | 4. Panel | 16 | DONE · 2026-10-28 · franc · #PR |
| 20 | [Estadísticas](docs/steps/20-panel-estadisticas.md) | 4. Panel | 17 | PENDIENTE |
| 21 | [Analítica con GTM y GA4](docs/steps/21-analitica-ga4.md) | 5. Lanzamiento | 09, 14 | DONE · 2026-10-28 · Teo · #40 |
| 22 | [SEO técnico](docs/steps/22-seo-tecnico.md) | 5. Lanzamiento | 07, 08 | DONE · 2026-10-28 · franc · #PR |
| 23 | [Monitoreo de errores con Sentry](docs/steps/23-sentry.md) | 5. Lanzamiento | 01, 26 | PENDIENTE |
| 24 | [Backups y restauración](docs/steps/24-backups.md) | 5. Lanzamiento | 04, 26 | PENDIENTE |
| 25 | [Lanzamiento a producción](docs/steps/25-lanzamiento.md) | 5. Lanzamiento | 00 a 24 y 26 | PENDIENTE |
| 26 | [Cuentas e infraestructura (Supabase y Vercel)](docs/steps/26-infraestructura-cuentas.md) | 5. Lanzamiento | 00, 01 | PENDIENTE |

Steps que se pueden hacer en paralelo una vez terminado el 01: 02, 03, 06, 07 y 13.

En la etapa 5 el orden de ejecución lo da la columna "Depende de", no el número: el step 26 va antes del 23, el 24 y el 25.
