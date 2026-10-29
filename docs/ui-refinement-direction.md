# Dirección de la mejora de interfaz

## Direction contract

THESIS: Cotizar sin una pared de campos y gestionar consultas con lectura rápida; se conserva la identidad existente, se reemplaza la escala excesiva.

OWN-WORLD: Azul profundo #101725, superficie #202839, coral #ff795f, texto #f7f8fc y secundario #c3cad8. Geist, campos legibles, agrupación semántica, paneles de 12–16px, sin decoración arbitraria.

STORY: El visitante completa contacto, vehículo y uso/envío en tres etapas sin perder datos; el administrador abre cualquier lead mediante Ver detalle o la fila, encuentra persona y vehículo y gestiona su estado.

FIRST VIEWPORT: Texto del hero a la izquierda y formulario lateral de ancho máximo aproximado de 30rem a la derecha en escritorio; flujo progresivo para evitar mostrar todos los campos a la vez. En móvil se apilan. Nunca un formulario ancho en una sección separada. Panel con navegación identificable y contenido principal protagonista. No se agregan estadísticas ni promesas ficticias.

FORM: Refinamiento de superficies existentes, no nueva identidad. seed: not applicable (incumbent refinement). Interacción distintiva: cotización progresiva con avance validado y vuelta atrás sin perder datos; ficha admin centrada en persona, vehículo y gestión.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Refinamiento del formulario

El resto del sistema permanece aceptado y no se modifica. La cotización lateral conserva sus tres etapas; la terminación se concentra en una sola jerarquía visible, campos personales en columna, parejas de datos de vehículo alineadas, ayudas breves, progreso nombrado y acciones agrupadas. Las leyendas se conservan para accesibilidad y el foco se distingue sin un contorno coral alrededor de toda la sección.
