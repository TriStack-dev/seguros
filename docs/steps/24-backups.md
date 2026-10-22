# Step 24 — Backups y restauración

**Etapa:** 5. Lanzamiento · **Depende de:** 04, 26 · **Leer:** `SPEC.md` sección 8

## Objetivo

Tener un procedimiento de backup de la base de producción que no dependa del plan pago de Supabase, y haber probado que se puede restaurar.

El backup es de la base de producción, que la crea el step 26; por eso este step depende de él además del 04.

## Contexto

El plan gratuito de Supabase no incluye backups descargables (verificar las condiciones vigentes al hacer este step). La base tiene datos personales, así que los backups no se guardan en lugares del equipo de desarrollo (por ejemplo, artefactos de GitHub de la organización del equipo) sin acuerdo del cliente. El procedimiento final es [PROVISORIO] hasta confirmarlo con el cliente.

## Tareas

- [ ] Verificar y documentar en `docs/decisiones/` qué ofrece hoy el plan gratuito de Supabase en backups y qué cambiaría con el plan pago.
- [ ] Script `pnpm db:backup` (`scripts/db-backup.sh` o `.ts`) que usa `pg_dump` con `DIRECT_URL` y genera un archivo comprimido con fecha (`miseguro-prod-AAAA-MM-DD.dump`, formato custom). No guarda el archivo dentro del repo (agregar la carpeta de salida al `.gitignore`).
- [ ] Script `pnpm db:restore <archivo>` que restaura con `pg_restore` en la base indicada; se niega a restaurar sobre producción sin una confirmación explícita.
- [ ] Prueba de restauración: tomar un backup de staging (o de producción una vez lanzada), restaurarlo en la base local del step 02 y verificar cantidad de leads, notas e historial.
- [ ] Proponer al cliente la frecuencia (sugerido: semanal) y dónde se guardan los backups (su almacenamiento, por ejemplo su Google Drive), y quién los ejecuta. Si se automatiza, documentar cómo.
- [ ] Documentar el procedimiento completo en `docs/backups.md`: requisitos (`pg_dump` con la misma versión mayor de PostgreSQL), cómo hacer un backup, cómo restaurar y la última prueba realizada.

## Criterios de aceptación

- Existe `docs/backups.md` con el procedimiento y la fecha de la última prueba de restauración exitosa.
- Un backup restaurado en la base local del step 02 tiene la misma cantidad de filas por tabla que el origen.

## Fuera de alcance

- Backups automáticos con infraestructura paga. Point-in-time recovery.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
