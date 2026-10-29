# Mejora integral de UI

Objetivo: compactar la cotización pública y mejorar la jerarquía del panel sin perder funciones ni accesibilidad.
Rama: feat/compact-public-admin-ui. Runner: Vitest/pnpm. Entrega local en unidades coherentes; sin publicación remota.

## Specs

- S1: «quiero que el hero quede al lado el formulario, pero que no quede tan grande, se entiende? que no sea muy ancho el formulario». El formulario debe ser lateral y acotado en escritorio, no una sección ancha debajo.
- S2: «en el /admin/leads hagas que sea mas sencillo entrar a un /home/teo/proyectos/seguros/src/app/admin/(protected)/leads/[id]. ya que ahora solo se puede mediante el nombre o el n de solicitud».
- S6: «por ultimo tambien mejora el /home/teo/proyectos/seguros/src/app/admin/(protected)/leads/[id], osea esa interfaz. haz lo que mejor puedas».
- S3: «dale una pasada a todo con todas las skills que tienes tanto la frontend-design como la impeccable, la ui-ux-pro-max. TODAS».
- S4: «siii, que quede perfeccionado y accesible». Confirmación a conservar todos los campos y funcionalidades, con libertad para reorganizar la presentación.
- S5: «trabaja directamente, empieza. te doy todos los permisos, no hace falta que preguntes. confio en ti!».

- S7: «lo unico que no me gusta o no me convence es lo del formulario. esta raro ... hace algo lindo ... lindo alineado ... visualmente accesible y no chocante ni abrumador, que sea un lujo». El resto de la interfaz está aceptado; refinar únicamente el formulario.

## Tasks

- T1 · S1,S3–S5,S7 · inline tras diagnóstico delegado · verificado visual/funcional · Hero lateral con formulario máximo30rem y 3 etapas; tests RED→GREEN, navegador y documentación; sin commit.
- T2 · S2–S5 · delegated · verificado · Ver detalle explícito y fila navegable; ficha por tareas con atribución desplegable; S2,S6, tests RED→GREEN; sin commit.
- T3 · S1–S7 · inline + verificación delegada · prueba de build pendiente · Lint, tipos y suite final264 tests pasan; el build de esta versión vuelve a fallar por restricción del entorno.

Dirección visual: [contrato](../../docs/ui-refinement-direction.md).

## Log

L1 · Solicitud original: «Hola, que tal? como estas? che, me gustaria mejorar bastante la ui tanto de la pagina principal, ya que no me gusta que el formulario queda muy largo y estirado, el hero muy grande. no me gusta eso. tampoco en el /admin me parece que esta demasido basica la interfaz, en el /leads tambien y dentro de cada lead especifico, es decir cuando seleccionas alguno tambien esta medio basico. me gustaria cambiar eso, dale una pasada a todo con todas las skills que tienes tanto la frontend-design como la impeccable, la ui-ux-pro-max. TODAS. perfecciona lo mas que puedas la ui de todo el sistema».

L2 · Confirmaciones: «siii, que quede perfeccionado y accesible»; «trabaja directamente, empieza. te doy todos los permisos, no hace falta que preguntes. confio en ti!».

L3 · Exploración: hero con mínimo 48rem; formulario compartido entre landing y /cotizar; /admin redirige a leads. Estadísticas pendiente: no ampliar funciones. Preservar .atl/ sin seguimiento. RDD apagado por preferencia local; no activar.

L4 · Ruta: dos unidades independientes de varios minutos, con superficies disjuntas. T1 posee globals.css y componentes públicos; T2 usa un stylesheet admin separado y componentes admin. El padre integra. Se conserva la identidad azul/coral y Geist, sin reemplazo de marca. Previsión >400 líneas; permiso explícito para proceder sin preguntas: unidades locales separadas, ninguna PR creada sin autorización de destino.


L5 · Resultado: hero independiente de 467px en captura desktop; formulario agrupado con columnas por contenedor. Admin con navegación activa, salto al contenido, tabla con scroll por teclado y acciones de 44px. AuthCard aplica el estilo a login/recuperación/nueva contraseña sin cambiar autenticación.

L6 · Verificación final: pnpm lint exit0 (1 advertencia preexistente en .opencode/plugins/block-push-to-protected.js:77); pnpm typecheck exit0; pnpm test exit0, 39 archivos/253 tests. Spot check público/admin: 12 archivos/37 tests. Tests nuevos con RED→GREEN observados para estructura, grupos, navegación, región de scroll y superficie de acceso.

L7 · Revisión visual independiente: defecto de tracks de filtros corregido y puntuado resolved tras recaptura a1440/1024/768/390. Capturas sintéticas de componentes reales con mocks, CSS del loader Tailwind real y Arial de respaldo: no certifican interacción admin autenticada ni métricas exactas de Geist. Sin overflow de página. Detector: solo avisos de tokens; DESIGN.md y sidecar actualizados desde código.

L8 · Prueba requerida pendiente: pnpm build falla incluso con escalación: Turbopack creating new process / binding to a port / Operation not permitted. pnpm build --webpack compiló con escalación, pero NO es sustituto válido: la configuración actual procesa Tailwind solo con @tailwindcss/turbopack y el CSS webpack deja utilidades sin generar. No cambiar dependencias/config fuera del alcance. Se preservan cambios locales, sin commit/publicación por cierre incompleto. Necesita ejecutar pnpm build en entorno compatible y probar interacciones admin autenticadas localmente con datos ficticios antes de declarar cierre total.

L9 · Evaluación nativa ejecutada con inventario explícito, tier high por señal de ruta auth-card (cambio solo presentacional). Sin item de seguridad real: no se alteran autenticación, guardas ni consultas. RDD apagado por preferencia local, no se inicia revisión nativa. Risk: none.

L10 · Corrección del usuario, 2026-10-29: «no, no me gusta. quiero que el hero quede al lado el formulario, pero que no quede tan grande, se entiende? que no sea muy ancho el formulario. ademas quiero que en el /admin/leads hagas que sea mas sencillo entrar a un /home/teo/proyectos/seguros/src/app/admin/(protected)/leads/[id]. ya que ahora solo se puede mediante el nombre o el n de solicitud. por ultimo tambien mejora el /home/teo/proyectos/seguros/src/app/admin/(protected)/leads/[id], osea esa interfaz. haz lo que mejor puedas».

L11 · Se invalida la composición con formulario debajo del hero. Dos unidades paralelas disjuntas: público (formulario lateral por etapas solo en landing para contener altura/ancho) y admin (enlace explícito Ver detalle + fila navegable sin destruir semántica; ficha organizada por tarea). No cambiar reglas, permisos ni datos. Mantener todas las funciones.

L12 · Corrección implementada: landing lateral con panel máximo30rem, tres etapas (Tus datos; Vehículo; Uso y envío), RHF/Zod compartidos, avance validado, vuelta sin pérdida, Enter bloqueado antes del envío, foco y errores por etapa. Formulario completo de /cotizar conserva orden y contratos. La etapa de vehículo se acortó pasando GNC/CP/uso a la última.

L13 · Listado: enlace explícito Ver detalle por lead, visible debajo del número en móvil y al final en escritorio; clic en espacio de fila navega sin interceptar enlaces, modificadores o selección. Ficha: nombre protagonista, contacto rápido, contacto/vehículo, gestión e historial; origen desplegable nativo. Navegación de retorno conserva filtros.

L14 · Prueba visual e interactiva hidratada: componentes reales, Geist local y CSS del loader real; integraciones de Next/servidor/Turnstile simuladas solo fuera del repo con datos ficticios. Anchos1440/1024/768/390/360 sin overflow de página. Validación inicial enfoca fullName; Enter inicial genera0 envíos; Back conserva nombre; final genera1 envío simulado. Ver detalle y fila llegan al detalle; origen abre. Sin erroresJS. Admin shell del harness simplificado, no prueba autenticación ni servicios reales.

L15 · Cierre de comprobaciones actualizado: pnpm lint exit0 (advertencia preexistente opencode:77), pnpm typecheck exit0, pnpm build Turbopack escalado exit0. Se supera el bloqueo del build del intento anterior sin cambiar configuración/dependencias. Una suite tuvo timeout aislado de5s en auth-card.test.tsx; ese test pasó focalmente y la suite completa repetida pasó40 archivos/263 tests. No se modificó el timeout para ocultarlo.

L16 · Revisión fresca independiente: disposition ship del diseño revisado al alcance de capturas/código; sin hallazgos materiales. Aviso: tabla móvil requiere desplazamiento horizontal para columnas secundarias. Detector88 hallazgos, todos advisory de tokens, sin hallazgos mecánicos. Documentación de diseño reconciliada con la corrección. RDD sigue apagado; assess high solo por señal de ruta auth-card, no cambia guardas ni autenticación. Risk: none. Cambios locales sin publicación ni commit; no se abrió PR.

L17 · Solicitud del usuario, 2026-10-29: «perfecto. quedo de 10. lo unico que no me gusta o no me convence es lo del formulario. esta raro. nose porque. hacelo como a vos te parezca pero hace de una vez por todas lo mejor de lo mejor. usa skills subagentes lo que necesites. te doy permiso para todo. pero hace algo lindo de una vez por todas. que quede lindo alineado, nose pero que quede una lindo visualmente accesible y no chocante ni abrumador, que sea un lujo. dale q podes».

L18 · Diagnóstico visual independiente: jerarquía triplicada, ayudas largas desalineando filas, 0km como celda suelta, foco coral en fieldset completo con apariencia de error y controles finales desconectados. Se conserva el flujo validado de3etapas, posición lateral, marca y todos los campos. Padre implementa una corrección entendida: cabecera breve, progreso nombrado, grillas intencionales, ayudas breves y foco neutro; admin y resto del sitio intactos.

L19 · Formulario pulido: cabecera Cotizá tu seguro, introducción por etapa, rail de progreso con nombres y aria-current, sin encabezados duplicados. Contacto en columna, 0km en fila completa, patente/año y marca/modelo emparejados, uso completo; volver y CTA comparten pie y primer CTA ocupa todo el ancho. Foco único2px, leyendas visibles solo para lectores de pantalla cuando corresponde. Default /cotizar conserva orden/copia/validación.

L20 · RED→GREEN observado en el nuevo test de etapas nombradas; foco/grupos/errores, avance/Back y envío existentes siguen pasando. Final lint exit0 con la advertencia preexistente, typecheck exit0,264tests/40archivos exit0. Build escalado final falla en admin.css sin cambios en ese archivo: Turbopack creatingnewprocess/bindingport/Operationnotpermitted. El build anterior sí pasó; no confundir aquel resultado con prueba de esta revisión.

L21 · Navegador hidratado: fuente Geist y componentes/CSS reales, servicios ficticios, cinco anchos1440/1024/768/390/360 y tres etapas completas. Cero overflow de página/ceroerroresJS/cero solicitudes externas, cada flujo0envíos anticipados/1envío simulado; Back conserva valores. Correcciones visuales finales (CTA completo y foco sin anillos superpuestos) puntuadas resolved por revisión independiente limitada a esos hallazgos. Detector33 avisos, todos advisory.

L22 · Gotcha corregido: el selector global de legend con width100% anulaba la utilidad sr-only y generaba overflow horizontal; se excluye .sr-only sin eliminar la leyenda accesible. Capturas conservadas fuera del código; sin cambios al admin ni al resto aceptado durante esta refinación. Risk:none. Falta repetir pnpm build en entorno que permita los procesos de Turbopack antes de cierre total/publicación.
