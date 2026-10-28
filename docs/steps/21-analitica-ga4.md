# Step 21 — Analítica con GTM y GA4

**Etapa:** 5. Lanzamiento · **Depende de:** 09, 14 · **Leer:** `docs/reglas-negocio.md` sección 9

## Objetivo

Medir el embudo del formulario en GA4 a través de Google Tag Manager, incluida la conversión "Lead enviado" que después usará Google Ads.

## Tareas

- [ ] Crear (o pedir al cliente) la cuenta de GA4 y el contenedor de GTM a nombre del cliente. Variable `NEXT_PUBLIC_GTM_ID`.
- [x] Cargar GTM solo en páginas públicas (nunca en `/admin`) con `@next/third-parties/google` (`GoogleTagManager`). Si `NEXT_PUBLIC_GTM_ID` no está definida (desarrollo), no se carga nada.
- [x] `src/lib/analytics/track.ts`: `track(event, params)` tipado con los cuatro eventos de la sección 9, que hace `window.dataLayer.push`. Si `dataLayer` no existe, no hace nada. Tests de que los parámetros nunca incluyen datos personales (el tipo no lo permite).
- [x] Disparar los eventos:
  - `form_view` al montar el formulario;
  - `form_start` en la primera interacción con un campo (una vez por carga);
  - `generate_lead` cuando `submitLead` devuelve éxito;
  - `whatsapp_click` al tocar "Abrir WhatsApp".
- [ ] Configurar en GTM: etiqueta de configuración de GA4, una etiqueta de evento de GA4 por cada evento (activador "Evento personalizado") y marcar `generate_lead` como evento clave en GA4. Exportar el contenedor de GTM como JSON a `docs/gtm-container.json` para tenerlo versionado.
- [x] Documentar en `docs/decisiones/` el uso de cookies de analítica y si hace falta un aviso (consultar con el cliente en el step 00).

## Criterios de aceptación

- En el modo vista previa de GTM (Tag Assistant), recorrer el flujo completo muestra los cuatro eventos con sus parámetros.
- En GA4 → Tiempo real aparecen los eventos.
- Ningún evento contiene nombre, DNI, teléfono ni email.
- `/admin` no carga GTM.

## Fuera de alcance

- Conversiones offline de "Emitido" en Google Ads (post-MVP). Campañas de Google Ads.

## Notas de implementación

### Qué se hizo

Se integró `GoogleTagManager` exclusivamente en el layout público, condicionado a `NEXT_PUBLIC_GTM_ID`.
Un componente cliente inicializa la cola antes de los efectos de montaje para no perder `form_view` durante la hidratación.
Se agregaron los cuatro eventos tipados y parámetros construidos por lista permitida, sin copiar datos del formulario ni el enlace de WhatsApp.
Se preservaron confirmación, enlace directo, beacon y reinicio; `form_start` ocurre en el primer cambio de campo una vez por montaje.
Se versionó una plantilla local de GTM y se documentaron los requisitos de privacidad, cookies y activación.

### Archivos clave

- `src/lib/analytics/track.ts` y tests.
- `src/components/public/{lead-form,lead-confirmation,public-tag-manager}.tsx` y tests.
- `src/app/(public)/layout.tsx` y tests; `.env.example`, `package.json`, `pnpm-lock.yaml`.
- `docs/gtm-container.json`, [decisión 0013](../decisiones/0013-analitica-y-cookies.md).

### Decisiones

Ver [0013](../decisiones/0013-analitica-y-cookies.md). Mantener GTM sin configurar hasta resolver cookies con el cliente. Desactivar medición automática de formularios y clics salientes: el enlace a WhatsApp incluye datos personales. Usar versión de `@next/third-parties` alineada con Next.js.

### Desvíos del spec

No se crearon ni configuraron cuentas externas: no se proporcionaron cuentas del cliente ni autorización para operarlas. El JSON es una plantilla no publicada, no una exportación real validada. La decisión sobre necesidad/contenido del aviso requiere el relevamiento del cliente; no se inventó una conclusión legal. Por indicación explícita del usuario (2026-10-28), se marca DONE en `SPEC.md` y se publica el PR, manteniendo documentados los criterios externos no verificados.

### Cómo probarlo

1. Sin `NEXT_PUBLIC_GTM_ID`, comprobar que el sitio no carga GTM. Ejecutar los cuatro comandos de verificación del proyecto.
2. En un entorno de prueba autorizado y después de resolver cookies, importar/verificar la plantilla, reemplazar `G-REPLACE_ME`, desactivar medición automática y configurar el ID del contenedor.
3. En Tag Assistant, abrir `/cotizar/auto` y `/cotizar/moto`, modificar campos y enviar. Comprobar `form_view`, un solo `form_start`, `generate_lead` tras éxito y `whatsapp_click` por cada clic directo. Un rechazo del servidor no debe generar conversión.
4. Comprobar parámetros exactos de sección 9 y ausencia de nombre, DNI, teléfono, email, URL de WhatsApp y campos libres en las solicitudes efectivas.
5. Abrir `/admin` directamente y desde una página pública: no debe cargar GTM. Verificar Tiempo real de GA4, marcar `generate_lead` como evento clave y reemplazar la plantilla con la exportación real del contenedor.

### Verificación observada

- `pnpm lint`: PASS, con advertencia preexistente en `.opencode/plugins/block-push-to-protected.js`.
- `pnpm typecheck`: PASS. Se corrigió durante la implementación el tipo de la cola vacía.
- `pnpm test`: PASS, 35 archivos y 248 tests. Payloads exactos para auto/moto, rechazo sin conversión, descarte de parámetros personales adicionales, errores de tags no bloqueantes, layout público/admin e inicialización antes de efectos pasivos bajo Strict Mode.
- RED observado al incorporar el test del helper antes de crear `track.ts`; luego GREEN.
- Revisión independiente sin bloqueos: 11 tests iniciales y 6 en el recheck acotado del inicializador. Spot check del padre: suite completa y typecheck.
- `pnpm build`: FAIL ambiental, Turbopack no puede abrir el puerto de procesamiento CSS (`Operation not permitted`), también en el reintento con permisos ampliados. `pnpm build --webpack`: PASS fuera del sandbox, compilación, TypeScript y generación de 10/10 páginas. Dentro del sandbox Webpack había fallado al interpretar `tsc --showConfig`.
- Tag Assistant, GA4 Tiempo real, importación real del JSON y tráfico real sin datos personales: NO VERIFICADOS; requieren cuentas/configuración del cliente.
- `git diff --check`: PASS.

### Pendientes

- Solicitar al cliente GA4/GTM y resolver política de cookies/aviso antes de configurar el ID.
- Validar importación y configuración del contenedor; exportar su versión real.
- Verificar criterios de Tag Assistant y GA4 Tiempo real con las cuentas reales, incluyendo dimensiones automáticas y navegación pública → admin. Los tests unitarios no prueban las solicitudes reales a Google.
- El usuario autorizó commit, push y PR el 2026-10-28 y pidió marcar DONE. RDD desactivado a nivel clon; no se inició revisión nativa.
