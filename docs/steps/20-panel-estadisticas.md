# Step 20 — Estadísticas

**Etapa:** 4. Panel · **Depende de:** 17 · **Leer:** `docs/reglas-negocio.md` secciones 5.2 y 8

## Objetivo

Página de estadísticas con la evolución de leads, su distribución, el embudo hasta la emisión y los tiempos de respuesta.

## Tareas

- [ ] `src/server/queries/stats.ts` (con `requireAdmin()`), todas filtradas por un rango de fechas (por defecto, últimos 30 días) y agrupando en hora de Argentina (`date_trunc` con `AT TIME ZONE 'America/Argentina/Buenos_Aires'` vía `$queryRaw` tipado si Prisma no alcanza):
  - leads por día, semana o mes (según el largo del rango);
  - distribución por tipo de vehículo, marca (top 10 + "Otras"), tipo de uso y código postal (top 10);
  - embudo: enviados → derivados a WhatsApp (`whatsappClickedAt`) → contactados (`firstContactedAt`) → cotizados (alcanzaron `QUOTED` o `ISSUED` según el historial) → emitidos;
  - tasa de contacto (contactados / enviados);
  - tiempo de primera respuesta: promedio y mediana, mostrados en horas y minutos;
  - leads por origen (`classifySource` del step 12).
- [ ] Funciones puras para los cálculos que no son SQL (mediana, tasas, armado del embudo, agrupación de "Otras") con tests unitarios.
- [ ] Página `/admin/estadisticas`:
  - selector de rango (últimos 7, 30 y 90 días, y personalizado), guardado en la URL;
  - tarjetas de resumen: total de leads, tasa de contacto, tiempo mediano de primera respuesta, emitidos;
  - gráficos con los charts de shadcn/ui: línea de leads en el tiempo, barras para distribuciones y para el embudo;
  - aviso fijo: "Formularios vistos, iniciados y abandonos: ver GA4".
- [ ] Estados vacíos cuando el rango no tiene datos.

## Criterios de aceptación

- Con los leads de prueba del step 16, los números coinciden con un conteo manual hecho en el SQL Editor de Supabase (documentar las consultas usadas en las notas).
- Un lead creado a las 23:30 hora de Argentina cuenta en ese día, no en el siguiente.
- Los gráficos se leen bien en tablet y desktop.

## Fuera de alcance

- Reportes periódicos por email. Datos de GA4 dentro del panel.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
