# 0016 — Estadísticas: rango, agrupación y gráficos

- **Fecha:** 2026-10-29
- **Step:** 20
- **Estado:** Aceptada

## Contexto

El step 20 pide una página de estadísticas filtrada por un rango de fechas, con agrupación
automática y gráficos. El repo no tiene componente de calendario instalado, los charts de
shadcn/ui necesitan `recharts` (no estaba en `package.json`) y el spec no define cómo se agrupa
la serie temporal ni cómo se cuenta el embudo cuando los leads no tienen historial de estados.

## Decisión

- **Rango en la URL:** los rangos rápidos (7, 30, 90 días) y el personalizado viven en
  `?range=`. El personalizado usa dos `<input type="date">` nativos en un `<form method="get">`,
  así el estado es compartible y recargable sin JavaScript extra.
- **Agrupación:** hasta 31 días se agrupa por día, hasta 120 por semana y más por mes
  (`groupByForSpan`). Se elige por largo del rango, no por el rango elegido, para que un
  personalizado largo no genere cientos de puntos.
- **Zona horaria:** las fechas se interpretan en `America/Argentina/Buenos_Aires` (UTC-3 fijo,
  sin horario de verano desde 2009). Un lead creado a las 23:30 hora argentina cae en ese día.
  El rango es inclusivo en `from` y exclusivo en el día siguiente a `to`.
- **SQL crudo donde Prisma no alcanza:** la serie temporal necesita `generate_series` para
  mostrar los períodos sin leads en cero, y el embudo necesita `avg` y `percentile_cont` en una
  sola pasada. Ambas consultas usan `$queryRaw` tipado con parámetros; el resto (distribuciones)
  usa `groupBy` de Prisma.
- **Embudo:** cotizados y emitidos cuentan el estado actual **o** el historial
  (`LeadStatusChange.toStatus`). Los seeds y las altas manuales setean el estado directamente sin
  dejar historial, así que mirar solo `LeadStatusChange` subestimaba el embudo.
- **Gráficos:** `recharts` con el envoltorio `ChartContainer` de shadcn/ui
  (`src/components/ui/chart.tsx`, recortado a lo que usa el panel). Los colores salen de las
  variables `--admin-*` del panel, no del tema claro/oscuro del sitio público.

## Alternativas descartadas

- Instalar un componente de calendario (react-day-picker + popover): suma dependencias y estado
  de cliente para un caso que los dos inputs nativos resuelven sin accesibilidad extra.
- Agrupar siempre por día: un rango de 12 meses devuelve 365 puntos ilegibles en un gráfico de
  línea y una consulta más pesada.
- Usar solo `LeadStatusChange` para el embudo: los leads cargados por seed o creados
  directamente con estado `QUOTED`/`ISSUED` desaparecían del paso.
- Contar la serie temporal en memoria con `findMany` y agrupar en JS: trae todas las filas del
  rango al servidor y no puede mostrar períodos vacíos.

## Consecuencias

Agregar un rango nuevo es una constante en `STATS_RANGE_KEYS` y un enlace en el selector. Si
mañana se necesita comparar dos períodos o exportar las estadísticas, la lógica de rangos y
cálculos ya está aislada en `src/lib/stats/`, con tests. El costo es una dependencia más
(`recharts`) y dos consultas SQL crudas que hay que mantener a mano si cambia el esquema.
