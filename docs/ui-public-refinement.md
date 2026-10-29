# Cotización pública

La landing conserva su fotografía, paleta azul/coral y tipografía Geist. En escritorio, el hero ubica el mensaje a la izquierda y el formulario, de hasta 30rem, a la derecha; en pantallas estrechas se apilan.

La landing presenta el mismo formulario en tres etapas —datos, vehículo y uso y envío— para mantener el panel lateral acotado. Cada etapa valida antes de avanzar; volver conserva los valores. El Enter en una etapa intermedia avanza, nunca envía. Una respuesta de error del servidor vuelve al grupo que contiene el campo observado. GNC, código postal y uso se agrupan con consentimiento, Turnstile y envío en la última etapa.

`/cotizar/auto` y `/cotizar/moto` conservan el formulario completo, sus campos en orden, sus estados y su contrato de envío. La variante progresiva solo se activa explícitamente en la landing mediante `compact`.

Verificación: `pnpm exec vitest run src/components/public 'src/app/(public)'`.

## Terminación visual del formulario compacto

Una cabecera breve y una introducción por etapa reemplazan los títulos repetidos. El progreso nombra las tres etapas y anuncia la actual para lectores de pantalla. Los datos personales se presentan en una columna; en vehículo, el control de 0 km ocupa una fila y se emparejan patente/año y marca/modelo cuando el ancho lo permite. Los campos manuales alternativos y el tipo de uso usan el ancho completo.

Las acciones se alinean al pie: el primer botón ocupa todo el ancho; las etapas siguientes presentan Volver junto a la acción principal. El foco de teclado usa un único contorno de 2px y las leyendas accesibles no fuerzan ancho ni generan desplazamiento horizontal. La variante completa conserva el orden y las ayudas originales.

Se eliminó únicamente el contorno del fieldset enfocado; los controles conservan su foco visible. La confirmación destaca el número y distingue WhatsApp de cargar otra cotización.
