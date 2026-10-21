# Step 00 — Relevamiento con el cliente

**Etapa:** 0. Relevamiento · **Depende de:** — · **Leer:** `SPEC.md` secciones 7 y 8; `docs/reglas-negocio.md` (todo lo marcado [PROVISORIO])

Step de gestión, no de código. **No bloquea el desarrollo:** los demás steps avanzan con los valores provisorios. Solo bloquea el step 25 (lanzamiento).

## Objetivo

Obtener del cliente las respuestas, el contenido y los accesos que hacen falta para reemplazar los valores provisorios y poder lanzar.

## Tareas

- [ ] Armar un documento de preguntas para el cliente a partir de la sección 14 del Google Doc "Documentación — MiSeguro (v2)" y de los [PROVISORIO] de `docs/reglas-negocio.md`.
- [ ] Reunión o intercambio con el cliente; registrar las respuestas.
- [ ] Recibir el contenido: logo, paleta y tipografía (o acordar que se diseñan), textos de la landing, matrícula del productor ante la SSN, dirección y datos de contacto, política de privacidad.
- [ ] Definir el dominio. Si ya tiene un sitio con tráfico, relevar sus URLs (Search Console o rastreo) y armar el plan de redirecciones 301 en `docs/redirecciones.md` (tabla origen → destino).
- [ ] Confirmar quién crea y a nombre de quién quedan las cuentas (ver step 02 y sección 10 del Google Doc).
- [ ] Confirmar zonas donde operan los brokers y horario de atención.
- [ ] Volcar las respuestas en `docs/reglas-negocio.md` (quitando las marcas [PROVISORIO] que correspondan).
- [ ] Por cada respuesta que cambie código ya implementado, agregar un step nuevo al final del índice de `SPEC.md`.

## Criterios de aceptación

- Todos los [PROVISORIO] tienen respuesta del cliente o una decisión explícita de mantenerlos.
- El contenido legal y de marca necesario para el lanzamiento está en el repo o en una carpeta compartida enlazada desde las notas.
- Si hay sitio previo, existe `docs/redirecciones.md`.

## Fuera de alcance

- Implementar los cambios que surjan (van en steps nuevos).

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
