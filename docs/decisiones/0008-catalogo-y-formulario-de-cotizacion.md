# 0008 — Catálogo y formulario de cotización

- **Fecha:** 2026-10-27
- **Step:** 09
- **Estado:** Aceptada

## Decisión

Se reutilizan `leadFormSchema`, las constantes de uso y `Controller` + `Field` de la decisión 0004. Los selectores de catálogo combinan `command` y `popover` de shadcn/ui. El tipo y la marca limpian sus campos dependientes; ocultar la patente por 0 km también limpia su valor.

Las consultas Prisma del catálogo se ejecutan solo en el servidor y usan `unstable_cache` con revalidación de 3600 segundos. El endpoint de modelos valida exactamente un UUID antes de consultar; únicamente las respuestas exitosas se pueden cachear. Las respuestas de error no exponen detalles internos.

Si falla la carga de marcas se ofrece ingresar marca/modelo con «Otro». Si falla la carga de modelos se ofrece reintentar o ingresar «Otro». Las peticiones obsoletas se abortan y sus resultados se ignoran al cambiar de marca.

El envío usa únicamente `console.log` del resultado validado y muestra un aviso explícito de demostración: no guarda solicitudes ni promete contacto. El honeypot se descarta silenciosamente antes de validar, sin enfocar un campo fuera de pantalla.

## Ajuste del esquema compartido

La regla de año entero ya existía en las reglas de negocio, pero el esquema aceptaba decimales. Se agregó `.int()` con mensaje en español y test de regresión, sin duplicar la validación en la UI.

La revisión independiente reprodujo que un uso vacío impedía ejecutar `superRefine`, ocultando errores de teléfono y patente al salir de sus campos. Se separaron los grupos de validación independientes con intersecciones Zod: datos/vehículo, uso según tipo y año. De este modo el uso o el año inválidos no bloquean las reglas de los otros grupos y el envío conserva todas las validaciones. Dos tests de interacción reprodujeron el fallo antes del arreglo y pasan después.

## Consecuencias

La carga real del catálogo necesita la base local configurada y el seed del step 05. La UI no sustituye el catálogo con datos ficticios. Las pruebas unitarias usan consultas simuladas; no demuestran conectividad de Prisma con una base real.

No se implementan persistencia, captcha, WhatsApp ni eventos de analítica; permanecen en sus steps respectivos.

## Actualización: simplificación confirmada por el usuario (2026-10-27)

Se reemplaza la lista inicial de controles por diez campos en este orden: nombre y apellido, teléfono, email, patente, marca, modelo, año del vehículo, código postal, tipo de uso y DNI. Se conservan Auto/Moto, privacidad, búsqueda de catálogo y estados de error/carga. Se eliminan versión, GNC y Es 0 km de la UI; la patente se solicita siempre.

El teléfono se ingresa completo en un único campo `type="tel"` y se normaliza a `549` + diez dígitos nacionales. No se inventa la división de código de área (puede tener 2, 3 o 4 dígitos). El normalizador de dos campos sigue disponible para consumidores anteriores. El valor de GNC no recolectado queda `null`, no `false`. Los campos heredados se conservan en el esquema para no romper otros consumidores. `phoneArea` y `phoneNumber` siguen siendo strings requeridos y la UI les asigna valores vacíos internos; al ingresar `phone` se valida ese teléfono completo. Ninguno se agrega como control visible.

Este cambio sustituye las decisiones anteriores de mostrar dos campos telefónicos, GNC y el checkbox de 0 km. No incorpora persistencia ni cambios a la API del catálogo.

## Corrección posterior (2026-10-27)

La [decisión 0009](0009-alineacion-del-formulario-y-lead.md) recupera 0 km y GNC y elimina versión de la persistencia con autorización expresa. La simplificación anterior se conserva como historial, no como regla vigente para estos controles.
