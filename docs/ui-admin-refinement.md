# Refinamiento del panel de administración

El panel conserva sus flujos y datos actuales, con una jerarquía más clara para encontrar solicitudes y gestionar cada lead. El estilo queda aislado en `src/app/admin/admin.css` para no modificar la identidad ni los tokens de las páginas públicas.

## Qué revisar

| Vista | Comportamiento conservado | Mejora visible |
| --- | --- | --- |
| Navegación protegida | `requireAdmin()` y `signOut` | Sección activa, contador accesible y enlace para saltar al contenido |
| Leads | Búsqueda, filtros, paginación y enlaces con filtros de retorno | Acción visible «Ver detalle», fila activable sin reemplazar los enlaces y tabla desplazable por teclado |
| Detalle | Datos, atribución, acciones rápidas y transiciones existentes | La persona encabeza la ficha; contacto, vehículo y gestión quedan separados; atribución usa un disclosure nativo. El selector de estado arranca vacío y pide confirmación antes de retroceder, para no revertir un lead por accidente |
| Carga y error | Reintento de la ruta | Esqueleto de carga y mensaje con acción de recuperación |
| Estadísticas | Placeholder del step futuro | Se mantiene explícito; no se inventan métricas |

## Accesibilidad y adaptación

- Navegación con estado actual anunciado, foco visible y acceso directo al contenido principal.
- Tabla desplazable por teclado en pantallas angostas, sin quitar columnas ni datos.
- Acción de detalle visible en escritorio al final de la fila y junto al número de solicitud en móvil. La fila también navega desde espacio libre, pero respeta enlaces, modificadores y selección de texto.
- Gestión y contacto rápido aparecen antes de los datos secundarios en móvil; la cronología conserva estados, responsables y fechas.
- Contraste claro sobre superficies azul oscuro y movimiento de carga reducido cuando el sistema lo solicita.

## Verificación

`pnpm exec vitest run src/components/admin` cubre la navegación y la región desplazable de la tabla. La verificación general usa `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` desde el cierre de la unidad completa.
