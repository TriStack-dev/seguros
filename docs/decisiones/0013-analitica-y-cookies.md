# 0013 — Analítica pública y cookies pendientes de validación

## Decisión

Usar `GoogleTagManager` de `@next/third-parties/google` únicamente en el layout público, condicionado a `NEXT_PUBLIC_GTM_ID`. Sin ID no se carga GTM. El layout raíz y el panel no lo importan. El helper además ignora eventos en `/admin`.

`track` permite exclusivamente los cuatro eventos de la sección 9. Construye un objeto nuevo con los parámetros permitidos: nunca copia valores del formulario, URL de WhatsApp, lead ID, atribución ni datos personales. `form_start` se registra en el primer cambio de campo y no se reinicia al cargar otra cotización en el mismo componente. `form_view` se emite una vez al montar, incluso bajo Strict Mode.

## Cookies y cliente

GA4 puede utilizar cookies de analítica. La decisión del cliente sobre consentimiento y aviso sigue pendiente del relevamiento (step 00); este documento NO determina una exención legal ni da por autorizado el uso de cookies. Mantener `NEXT_PUBLIC_GTM_ID` vacío hasta acordar y documentar esa decisión. Si exige consentimiento previo, implementar el mecanismo antes de activar GTM; no se agrega un banner sin contenido ni decisión aprobados.

## Configuración pendiente en cuentas del cliente

`docs/gtm-container.json` es una **plantilla local no publicada**, no una exportación obtenida de una cuenta real ni una importación validada. Crear o solicitar al cliente GA4 y GTM a su nombre; importar la plantilla en un workspace de prueba y reemplazar `G-REPLACE_ME` en todas las etiquetas por el ID real. Verificar el esquema y la configuración en la interfaz antes de publicar y sustituir el JSON por la exportación real.

Desactivar medición mejorada automática (especialmente clics salientes, interacciones de formulario e historial) y capacidades de datos proporcionados por usuarios. No activar variables de clic, texto de enlaces, campos del formulario ni etiquetas adicionales: el enlace `wa.me` contiene datos personales en el mensaje. La etiqueta base desactiva `send_page_view`; medir únicamente los cuatro eventos explícitos. No incluir ubicación, referente ni títulos derivados de entrada libre; validar en Tag Assistant las solicitudes efectivas de Google, incluidas sus dimensiones automáticas, antes de producción.

Configurar en GA4 `generate_lead` como evento clave. Recorrer auto y moto con Tag Assistant y Tiempo real; verificar nombres, parámetros, ausencia de información personal y ausencia de GTM en `/admin` (también al navegar desde una página pública). No publicar mientras falte esta evidencia.

## Fuentes

- [Next.js: Google Tag Manager](https://nextjs.org/docs/app/guides/third-party-libraries#google-tag-manager).
- [Google: configuración de detección automática](https://support.google.com/tagmanager/answer/12131703).
- [Google: controles de privacidad](https://developers.google.com/tag-platform/security/guides/privacy).
