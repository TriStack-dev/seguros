# Step 12 — Atribución (UTM, gclid, página de entrada)

**Etapa:** 2. Formulario · **Depende de:** 10 · **Leer:** `docs/reglas-negocio.md` sección 8

## Objetivo

Guardar en cada lead de dónde vino el usuario (campaña, buscador, referido o directo), para las estadísticas del panel y para subir conversiones a Google Ads más adelante.

## Tareas

- [ ] `src/lib/attribution/`: tipos, `parseAttributionFromUrl(url, referrer)`, serialización y lectura de la cookie `ms_attr`, y `classifySource(attribution)` según la sección 8. Todo con tests unitarios.
- [ ] En `src/proxy.ts` (o `middleware.ts`, según la versión de Next.js), solo para páginas públicas:
  - si la URL trae algún `utm_*` o `gclid`, escribe o reemplaza la cookie `ms_attr` con los parámetros, `landingPage` (ruta + query) y `referrer` (si es de otro dominio);
  - si no trae parámetros y no existe la cookie, la crea solo con `landingPage` y `referrer`;
  - excluye `/admin`, `/api`, archivos estáticos e imágenes con el `matcher`.
- [ ] Dejar el proxy preparado para componer más lógica (el step 15 suma la protección de `/admin`): una función por responsabilidad.
- [ ] En `submitLead`, leer la cookie con `cookies()` y copiar los valores a los campos del lead. Si la cookie falta o es inválida, el lead se guarda igual sin atribución.
- [ ] Limitar el largo de cada valor (por ejemplo, 255 caracteres) antes de guardarlo.

## Criterios de aceptación

- Entrar a `/?utm_source=google&utm_medium=cpc&utm_campaign=prueba&gclid=abc`, navegar y enviar el formulario guarda esos valores en el lead.
- Una segunda visita sin parámetros no borra la atribución anterior; una visita con otros UTM sí la reemplaza.
- `classifySource` tiene tests para los cinco orígenes.

## Fuera de alcance

- Mostrar la atribución en el panel (steps 17 y 20). Subir conversiones offline a Google Ads (post-MVP).

## Notas de implementación

- **Qué se hizo:** Se agregó lógica pura de atribución en `src/lib/attribution/` (tipos, parseo de URL/referrer, cookie `ms_attr` con límites, clasificación de origen) con tests unitarios. Se actualizó `src/proxy.ts` para capturar UTM/gclid/referrer/landingPage en rutas públicas (manteniendo protección de `/admin` componible) y ampliar el matcher. `submitLead` lee la cookie con `cookies()` (con fallback si no hay request scope) y guarda los campos de atribución en el lead.
- **Archivos clave:** `src/lib/attribution/*`, `src/proxy.ts`, `src/server/actions/submit-lead.ts`
- **Decisiones:** Se mantuvo un único archivo `proxy.ts` (como indica el TODO) con funciones por responsabilidad. La cookie es `httpOnly`, `sameSite=lax`, 30 días. Si no hay parámetros y no existe cookie, se guarda solo `landingPage` y `referrer` externo.
- **Desvíos del spec:** Ninguno.
- **Cómo probarlo:** Entrar a `/?utm_source=google&utm_medium=cpc&utm_campaign=prueba&gclid=abc`, navegar y enviar el formulario; verificar que el lead guarda esos valores. Visitar sin parámetros no borra la atribución; con otros UTM la reemplaza. Correr `pnpm test` para ver tests de `classifySource`.
- **Pendientes:** Ninguno.
