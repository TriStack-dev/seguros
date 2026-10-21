# Step 25 — Lanzamiento a producción

**Etapa:** 5. Lanzamiento · **Depende de:** 00 a 24 · **Leer:** `SPEC.md` secciones 5, 7 y 8; `docs/redirecciones.md` (si existe)

## Objetivo

Publicar el sitio en el dominio del cliente con todo configurado, medido y verificado.

## Tareas

**Antes**
- [ ] Confirmar que no quedan [PROVISORIO] sin decisión del cliente que bloqueen el lanzamiento (como mínimo: datos del productor, política de privacidad aprobada, texto del mensaje de WhatsApp).
- [ ] Quitar el aviso de borrador de `/privacidad` si el cliente la aprobó.
- [ ] Aplicar las migraciones en producción (`pnpm db:deploy`) y cargar el catálogo (`pnpm db:seed`). **No** cargar leads de prueba.
- [ ] Crear las cuentas de los brokers con `pnpm admin:create`.
- [ ] Revisar todas las variables de entorno de Production en Vercel (claves reales de Turnstile, GTM, Sentry, `WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL` con el dominio final).
- [ ] Revisar si el plan de Vercel es adecuado para uso comercial y decidirlo con el cliente.

**Dominio y redirecciones**
- [ ] Conectar el dominio en Vercel (con y sin `www`, redirigiendo a uno solo) y verificar HTTPS.
- [ ] Si hay sitio previo: cargar las redirecciones 301 de `docs/redirecciones.md` en `next.config` (`redirects`).
- [ ] Agregar el dominio en Cloudflare Turnstile y en Supabase Auth (Site URL y Redirect URLs para la recuperación de contraseña).

**Medición**
- [ ] Verificar el dominio en Search Console y enviar `sitemap.xml`.
- [ ] Publicar el contenedor de GTM y verificar los eventos en GA4 Tiempo real.

**Prueba final (en producción)**
- [ ] Enviar un formulario de auto y uno de moto desde Android, iPhone y computadora; verificar que llega el mensaje a WhatsApp, que el lead aparece en el panel y que los eventos llegan a GA4.
- [ ] Cambiar el estado de un lead, agregar una nota, exportar CSV y ver las estadísticas.
- [ ] Probar el login, el cierre de sesión y la recuperación de contraseña.
- [ ] Forzar un error de prueba y verificar el aviso de Sentry.
- [ ] Tomar el primer backup de producción (step 24).
- [ ] Borrar los leads de prueba del lanzamiento.

## Criterios de aceptación

- El sitio funciona en el dominio del cliente con HTTPS y las redirecciones (si hay) responden 301.
- La prueba final pasa completa y queda registrada en las notas con fecha.
- El sitemap está enviado en Search Console y los eventos se ven en GA4.

## Fuera de alcance

- Campañas de Google Ads, SEO de contenido y mantenimiento mensual (servicio aparte).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
