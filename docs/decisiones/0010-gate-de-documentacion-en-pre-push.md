# 0010 — Gate de documentación en el pre-push

- **Fecha:** 2026-10-28
- **Step:** — (tooling)
- **Estado:** Aceptada

## Contexto
`AGENTS.md` pide, al cerrar cada step, completar las "Notas de implementación" del archivo
del step y actualizar el índice de `SPEC.md`. También pide registrar en `docs/decisiones/`
cualquier decisión que no esté resuelta en el spec. En la práctica eso dependía de que la
persona o el agente se acordara: el `pre-push` validaba el nombre de la rama y la memoria de
engram, pero no la documentación. Varias ramas llegaron al PR con código listo y la
documentación incompleta.

## Decisión
`.githooks/pre-push` llama a `.githooks/check-docs` para cada rama que se crea o actualiza.
El gate compara la rama **completa** contra su punto de partida (`merge-base` con
`origin/main`) y, si hay cambios de código, exige al menos un archivo de documentación:
`docs/**`, `SPEC.md`, `README.md`, `AGENTS.md`, `DESIGN.md` o `CLAUDE.md`.

En las ramas de step (`<tipo>/NN-...`) el archivo actualizado tiene que incluir
`docs/steps/NN-*.md`, que es donde viven las notas de implementación. Borrar documentación
no cuenta: `git diff` usa `--diff-filter=ACMR`.

La comparación es acumulada, no por push: una vez que la rama tiene la documentación, los
pushes de seguimiento (correcciones de review, sync de engram) no obligan a editarla de
nuevo.

## Alternativas descartadas
- **Revisar solo el último commit o el rango del push:** cualquier push de seguimiento
  posterior a la documentación volvería a fallar y empujaría a ediciones vacías.
- **Exigir siempre `SPEC.md` y el step doc en cada push:** el número de PR y el estado
  `DONE` recién se conocen después de abrir el PR, así que el gate no puede pedir el cierre
  completo antes del primer push. El step doc sí puede exigirse desde el principio.
- **Validar en CI en vez del hook:** CI llega después del push y el objetivo es no publicar
  ramas sin documentación. Se puede sumar más adelante como segunda capa, igual que branch
  protection con el bloqueo de `main`.
- **Hook de agente:** solo cubriría a quien use ese agente. El `pre-push` corre dentro de
  git y aplica a Claude Code, Codex, OpenCode y pushes a mano.

## Consecuencias
- `AGENTS.md` y el README documentan el gate; la lista de rutas de código y de
  documentación vive en `.githooks/check-docs`, en un solo lugar.
- Cambios que no tocan código (por ejemplo, actualizar solo el número de PR en `SPEC.md`)
  pasan sin exigir nada más.
- `--no-verify` sigue pudiendo saltear el hook. La defensa real a futuro es replicar el
  chequeo en CI y proteger las ramas en GitHub.
- Si una rama cambia código que no necesita documentación, el camino más simple es igual
  registrar por qué en `docs/decisiones/` o en el README. El gate prioriza dejar rastro
  sobre la excepción.
