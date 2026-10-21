# Step 21 — Analítica con GTM y GA4

**Etapa:** 5. Lanzamiento · **Depende de:** 09, 14 · **Leer:** `docs/reglas-negocio.md` sección 9

## Objetivo

Medir el embudo del formulario en GA4 a través de Google Tag Manager, incluida la conversión "Lead enviado" que después usará Google Ads.

## Tareas

- [ ] Crear (o pedir al cliente) la cuenta de GA4 y el contenedor de GTM a nombre del cliente. Variable `NEXT_PUBLIC_GTM_ID`.
- [ ] Cargar GTM solo en páginas públicas (nunca en `/admin`) con `@next/third-parties/google` (`GoogleTagManager`). Si `NEXT_PUBLIC_GTM_ID` no está definida (desarrollo), no se carga nada.
- [ ] `src/lib/analytics/track.ts`: `track(event, params)` tipado con los cuatro eventos de la sección 9, que hace `window.dataLayer.push`. Si `dataLayer` no existe, no hace nada. Tests de que los parámetros nunca incluyen datos personales (el tipo no lo permite).
- [ ] Disparar los eventos:
  - `form_view` al montar el formulario;
  - `form_start` en la primera interacción con un campo (una vez por carga);
  - `generate_lead` cuando `submitLead` devuelve éxito;
  - `whatsapp_click` al tocar "Abrir WhatsApp".
- [ ] Configurar en GTM: etiqueta de configuración de GA4, una etiqueta de evento de GA4 por cada evento (activador "Evento personalizado") y marcar `generate_lead` como evento clave en GA4. Exportar el contenedor de GTM como JSON a `docs/gtm-container.json` para tenerlo versionado.
- [ ] Documentar en `docs/decisiones/` el uso de cookies de analítica y si hace falta un aviso (consultar con el cliente en el step 00).

## Criterios de aceptación

- En el modo vista previa de GTM (Tag Assistant), recorrer el flujo completo muestra los cuatro eventos con sus parámetros.
- En GA4 → Tiempo real aparecen los eventos.
- Ningún evento contiene nombre, DNI, teléfono ni email.
- `/admin` no carga GTM.

## Fuera de alcance

- Conversiones offline de "Emitido" en Google Ads (post-MVP). Campañas de Google Ads.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
