# Reglas de negocio — MiSeguro

Referencia para los steps. Cada step indica qué secciones leer.
**[PROVISORIO]** = supuesto del equipo hasta que responda el cliente (ver `SPEC.md`, sección 7).

## 1. Campos del formulario

Un solo formulario para autos y motos. Las validaciones se aplican en el navegador y se repiten en el servidor con el mismo esquema Zod.

| Campo (código) | Etiqueta | Obligatorio | Regla |
| --- | --- | --- | --- |
| `vehicleType` | Tipo de vehículo | Sí | `AUTO` o `MOTO` |
| `fullName` | Nombre y apellido | Sí | Ver 2.1 |
| `phoneArea` + `phoneNumber` | Teléfono | Sí | Ver 2.2; se guarda como un solo campo `phone` |
| `email` | Email | Sí | Email válido; se guarda en minúsculas y sin espacios |
| `dni` | DNI | Sí | Ver 2.3 |
| `isZeroKm` | Es 0 km | No | Checkbox; si está marcado, la patente no se pide [PROVISORIO] |
| `plate` | Patente | Sí, salvo 0 km [PROVISORIO] | Ver 2.4 |
| `brandId` / `brandOther` | Marca | Sí | Elegida del catálogo o "Otro" con texto libre (2 a 40 caracteres) |
| `modelId` / `modelOther` | Modelo | Sí | Elegido del catálogo (filtrado por marca) o "Otro" con texto libre (1 a 60 caracteres). Si la marca es "Otro", el modelo es siempre texto libre |
| `version` | Versión | No [PROVISORIO] | Texto libre, hasta 60 caracteres |
| `year` | Año | Sí | Ver 2.5 |
| `hasGnc` | ¿Tiene GNC? | Sí, solo para autos [PROVISORIO] | Sí / No. En motos no se muestra y se guarda `null` |
| `postalCode` | Código postal | Sí | Ver 2.6 |
| `usage` | Tipo de uso | Sí | Ver 3 |
| `consent` | Acepto la política de privacidad | Sí | Tiene que estar marcado; se guarda la fecha en `consentAt` |
| `website` | (oculto) | — | Honeypot: si viene con contenido, se descarta el envío sin mostrar error |

## 2. Validaciones

### 2.1 Nombre y apellido
- Al menos 2 palabras de 2 o más letras. Se aceptan letras con acentos, ñ, espacios, apóstrofo y guion.
- Máximo 100 caracteres. Se recortan los espacios de los extremos y los espacios dobles.

### 2.2 Teléfono
- Dos campos: código de área sin 0 (2 a 4 dígitos) y número sin 15 (6 a 8 dígitos). Entre los dos suman **10 dígitos**.
- Tolerancia: si el código de área empieza con 0, se quita. Si el número empieza con 15 y con eso la suma da 12 dígitos, se quita el 15.
- Se ignoran espacios, guiones y paréntesis.
- Se guarda en formato internacional sin símbolos: `549` + área + número (ejemplo: `5493414123456`). Para mostrar: `+54 9 341 412-3456`.
- Mensajes de error claros: "Ingresá el código de área sin el 0" y "Ingresá el número sin el 15".

### 2.3 DNI
- 7 u 8 dígitos. Se quitan puntos y espacios antes de validar. Se guarda solo con dígitos.

### 2.4 Patente
Se guarda en mayúsculas, sin espacios ni guiones. Formatos válidos según el tipo de vehículo:

| Tipo | Formato viejo | Formato Mercosur |
| --- | --- | --- |
| Auto | `AAA999` (3 letras + 3 números) | `AA999AA` (2 letras + 3 números + 2 letras) |
| Moto | `999AAA` (3 números + 3 letras) | `A999AAA` (1 letra + 3 números + 3 letras) |

Patentes anteriores a 1995 no se aceptan [PROVISORIO]; esos casos se resuelven por WhatsApp.

### 2.5 Año
- Número entero entre **1990** [PROVISORIO] y el **año actual + 1**. El año actual se calcula al validar, nunca se escribe fijo.

### 2.6 Código postal
- 4 dígitos (`2000`) o CPA de 8 caracteres: letra de provincia + 4 dígitos + 3 letras (`S2000ABC`). Se guarda en mayúsculas sin espacios.

## 3. Tipos de uso [PROVISORIO]

Un solo enum `UsageType`; cada tipo de vehículo muestra solo sus opciones.

| Valor | Etiqueta | Auto | Moto |
| --- | --- | --- | --- |
| `PARTICULAR` | Particular | Sí | Sí |
| `COMMERCIAL` | Comercial | Sí | Sí |
| `RIDE_HAILING` | Aplicaciones de transporte (Uber, Cabify, DiDi) | Sí | No |
| `DELIVERY` | Delivery / mensajería | No | Sí |

## 4. Número de solicitud

- Se genera con un entero autoincremental de la base (`requestNumber`), nunca en la aplicación.
- Formato visible: `MS-` + número con ceros a la izquierda hasta 6 dígitos (`MS-000123`). Con más de 6 dígitos se muestra completo (`MS-1234567`).
- El panel permite buscar por `MS-000123`, `000123` o `123`.

## 5. Estados del lead

| Estado (código) | Etiqueta | Significado |
| --- | --- | --- |
| `NEW` | Nuevo | Envió el formulario; nadie lo atendió todavía |
| `CONTACTED` | Contactado | Un asesor le respondió |
| `QUOTED` | Cotizado | Recibió una cotización |
| `ISSUED` | Emitido | Contrató la póliza |
| `LOST` | Perdido | No avanzó |

### 5.1 Transiciones permitidas

Orden de avance: `NEW → CONTACTED → QUOTED → ISSUED`.

- Se puede avanzar a cualquier estado posterior (ejemplo: `NEW → QUOTED`, si la primera respuesta ya fue una cotización).
- Se puede retroceder **un** estado, para corregir errores (`QUOTED → CONTACTED`).
- Se puede pasar a `LOST` desde `NEW`, `CONTACTED` o `QUOTED`.
- Desde `LOST` solo se puede volver a `CONTACTED` (reabrir).
- `ISSUED` solo puede retroceder a `QUOTED`.
- Cualquier otra transición se rechaza en el servidor.

### 5.2 Historial y primera respuesta
- Cada cambio de estado guarda: estado anterior, estado nuevo, usuario (id y email) y fecha.
- La creación del lead registra un primer cambio `null → NEW` sin usuario.
- `firstContactedAt` se completa la **primera vez** que el lead pasa a `CONTACTED`, `QUOTED` o `ISSUED`, y no se modifica después.
- Tiempo de primera respuesta = `firstContactedAt − createdAt`.

### 5.3 Motivos de "Perdido" [PROVISORIO]
Lista fija y **opcional** al pasar a `LOST`:

| Valor | Etiqueta |
| --- | --- |
| `PRICE` | Le pareció caro |
| `NO_RESPONSE` | No respondió |
| `WENT_ELSEWHERE` | Contrató en otro lado |
| `JUST_ASKING` | Solo estaba consultando |
| `INVALID_DATA` | Datos inválidos o falsos |
| `OTHER` | Otro |

Al reabrir (`LOST → CONTACTED`) se borra el motivo.

## 6. Duplicados [PROVISORIO]

Siempre se crea un lead nuevo. En el listado del panel se muestra la marca "Posible duplicado" si existe otro lead con el mismo teléfono o DNI creado en los 30 días anteriores.

## 7. Mensaje de WhatsApp [PROVISORIO: texto a aprobar por el cliente]

- Link: `https://wa.me/{WHATSAPP_NUMBER}?text={mensaje codificado con encodeURIComponent}`.
- Las líneas de datos vacíos (versión, patente en 0 km) se omiten. En 0 km, la línea de patente dice `Patente: 0 km`.
- En motos no se incluye la línea de GNC.

```
¡Hola! Quiero cotizar un seguro para mi {auto|moto}.
Solicitud N° {MS-000123}
Nombre: {fullName}
DNI: {dni}
Teléfono: {+54 9 341 412-3456}
Email: {email}
Vehículo: {marca} {modelo} {versión} {año}
Patente: {patente}
GNC: {Sí|No}
Uso: {etiqueta del tipo de uso}
Código postal: {postalCode}
```

## 8. Atribución

- Parámetros que se capturan: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` y `gclid`. También la página de entrada (`landingPage`, ruta y query) y el `referrer` externo.
- Se guardan en una cookie propia `ms_attr` (JSON, `httpOnly`, `sameSite=lax`, 30 días).
- **Último clic con parámetros:** si una visita trae UTM o gclid, reemplaza la cookie. Una visita sin parámetros no la pisa.
- Si no hay cookie, `landingPage` y `referrer` se toman de la primera página vista de la sesión.
- Al crear el lead, el servidor copia los valores de la cookie a los campos del lead.
- Clasificación del origen para estadísticas: `gclid` o `utm_medium` en (`cpc`, `ppc`, `paid`) → **Campaña**; `utm_*` con otro medio → **Campaña (otra)**; referrer de buscador (google, bing, yahoo, duckduckgo) → **Orgánico**; otro referrer → **Referido**; sin datos → **Directo**.

## 9. Eventos de analítica (GA4 vía dataLayer)

Nunca se envían datos personales. Solo tipo de vehículo, tipo de uso y número de solicitud.

| Evento | Cuándo | Parámetros |
| --- | --- | --- |
| `form_view` | Se muestra el formulario | `vehicle_type` (si ya está elegido) |
| `form_start` | Primer campo completado (una vez por carga) | `vehicle_type` |
| `generate_lead` | El servidor confirmó el lead | `vehicle_type`, `usage`, `request_number` |
| `whatsapp_click` | El usuario toca "Abrir WhatsApp" | `vehicle_type`, `request_number` |

Abandono = `form_start` sin `generate_lead`, se mide en GA4.

## 10. Exportación CSV [PROVISORIO: columnas a confirmar]

- Exporta los leads que coinciden con los filtros y la búsqueda del listado, sin límite de páginas.
- Codificación UTF-8 con BOM, separador `;` (para que Excel en español lo abra bien), fechas en `DD/MM/AAAA HH:mm` en hora de Argentina.
- Nombre del archivo: `leads-AAAA-MM-DD.csv`.
- Columnas: número de solicitud, fecha, estado, motivo de pérdida, tipo de vehículo, nombre, DNI, teléfono, email, marca, modelo, versión, año, GNC, patente, 0 km, código postal, tipo de uso, derivado a WhatsApp (Sí/No), primera respuesta, origen, utm_source, utm_medium, utm_campaign, gclid.

## 11. Límites anti-spam [PROVISORIO]

- Máximo **5 envíos por IP por hora**. Al superarlo: "Recibimos varias solicitudes desde tu conexión. Probá de nuevo más tarde o escribinos por WhatsApp."
- La IP nunca se guarda en claro: se guarda `sha256(ip + IP_HASH_SALT)`.
- Los intentos de más de 7 días se pueden borrar.
