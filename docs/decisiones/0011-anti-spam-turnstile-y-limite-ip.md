# 0011 — Turnstile y límite por IP

- **Fecha:** 2026-10-28
- **Step:** 11
- **Estado:** Aceptada

## Decisión

Se usa Turnstile con renderizado explícito, sin una dependencia adicional. El servidor valida cada token con Siteverify y timeout de cinco segundos; ante error o configuración ausente, rechaza el envío. Los tokens son de un solo uso: el formulario renueva el widget después de cada intento de envío al servidor. Las claves públicas oficiales de prueba se documentan solo para desarrollo; la configuración real pertenece a la cuenta del cliente.

El primer valor de `x-forwarded-for` identifica la conexión en Vercel. Se valida como IP y se canoniza IPv6 antes de calcular `sha256(ip + IP_HASH_SALT)`. Solo se persiste el hash. No se envía la IP a Siteverify, no se registra en logs y no se agrega al lead. No hay buckets globales alternativos cuando falta la IP o la sal: se rechaza sin persistir el lead. Fuera de Vercel, el proxy de confianza debe sobrescribir la cabecera; aceptar cabeceras arbitrarias directamente no ofrece esta garantía.

El conteo de la última hora y el alta del intento usan una transacción `Serializable` con hasta tres intentos ante conflictos `P2034`. Una transacción de aislamiento predeterminado permitiría que dos solicitudes vieran simultáneamente cuatro intentos y ambas fueran admitidas. La transacción del intento se confirma antes de verificar Turnstile y validar el formulario: un envío inválido consume cupo y un fallo posterior al crear el lead no revierte el intento. El sexto se rechaza sin agregar otra fila. El honeypot conserva la respuesta ficticia, pero solo tras admisión y verificación; no crea lead.

Con probabilidad del 1 % se borran registros anteriores a siete días. La limpieza es oportunista y su fallo no altera una admisión ya confirmada. Se reutiliza `SubmissionAttempt`, su índice y sus permisos existentes: no hay migración ni nuevo proveedor.

La alternativa a fallos de carga usa `WHATSAPP_NUMBER` del servidor y `buildWhatsappLink` existente. Solo se ofrece un enlace real si hay un número configurado; en caso contrario se informa la falta de configuración. No se usan los contactos provisorios de `BUSINESS_DETAILS` ni se implementa el flujo de confirmación del step 14.

## Fuentes verificadas

- [Cloudflare: Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/): token obligatorio, máximo 2048 caracteres, validez de cinco minutos y un solo uso.
- [Cloudflare: widget](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/): renderizado explícito, callbacks y ciclo de vida.
- [Cloudflare: pruebas](https://developers.cloudflare.com/turnstile/troubleshooting/testing/): pareja de claves de prueba documentada.
- [Vercel: cabeceras](https://vercel.com/docs/headers/request-headers#x-forwarded-for): el proxy sobrescribe la cabecera para prevenir suplantación.
- Prisma: opciones de `isolationLevel` verificadas contra los tipos generados de la versión instalada (`src/generated/prisma/internal/class.ts`).

## Configuración pendiente

Antes de producción: crear el widget Managed en la cuenta del cliente, autorizar los dominios y configurar claves reales, sal privada estable y número real de WhatsApp. No se crean cuentas ni se aplican cambios a una base remota durante este step.
