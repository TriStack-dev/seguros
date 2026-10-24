# 0002 — Convención de nombres de rama por tipo

- **Fecha:** 2026-10-22
- **Step:** — (tooling, previo al step 01)
- **Estado:** Aceptada

## Contexto
`AGENTS.md` pedía trabajar en ramas `step/NN-nombre-corto`. Eso cubría bien los steps del
spec, pero dejaba sin convención todo lo demás: tooling, arreglos, refactors, documentación.
Además el prefijo `step/` no dice nada sobre la intención del cambio, mientras que los
commits del repo ya usan Conventional Commits (`feat:`, `fix:`, `refactor:`, …), así que la
rama y sus commits hablaban idiomas distintos.

El nombre de la rama es lo primero que se ve en la lista de PRs y en los previews de Vercel,
y el repo lo trabajan varias personas y varios agentes.

## Decisión
Las ramas se nombran `<tipo>/<descripción>`, y `<tipo>/<NN>-<descripción>` cuando el trabajo
es un step del spec. El tipo es uno de `feat`, `fix`, `refactor`, `chore`, `docs`, `test`:
los mismos de los commits. La descripción va en inglés, en minúsculas, con palabras
separadas por guiones, dos palabras o más, y tiene que nombrar el cambio concreto.

Se enforza en dos capas, con roles distintos:

- **`.githooks/pre-push`** valida la **forma** de cada rama que se pushea: tipo válido,
  minúsculas con guiones, dos palabras o más, largo entre 6 y 50 caracteres, y rechaza las
  descripciones armadas solo con palabras vacías (`misc`, `stuff`, `wip`, …). Un borrado de
  rama no se valida, para no trabar la limpieza de nombres viejos.
- **`.agents/skills/git-branch-naming/`** le explica a los agentes el **criterio**: qué tipo
  corresponde, qué significa que la descripción sea informativa, y ejemplos buenos y malos.

La división es deliberada: el hook puede verificar la forma pero no puede juzgar si el nombre
dice algo. `feat/some-new-thing` pasa el regex y es un mal nombre igual. Eso queda en manos
de quien escribe el nombre y de quien revisa el PR.

## Alternativas descartadas
- **Mantener `step/NN-` y agregar los tipos solo para lo demás:** era la opción conservadora
  y no obligaba a tocar `AGENTS.md`, pero dejaba dos convenciones conviviendo y seguía sin
  decir la intención de los steps, que tampoco son todos `feat`.
- **Validar en un hook de agente (PreToolUse) en vez del `pre-push`:** daría feedback antes
  de crear la rama, pero solo cubriría a quien trabaje con ese agente. El `pre-push` corre
  dentro de git y aplica a Claude Code, Codex y trabajo a mano por igual.
- **Solo la skill, sin hook:** una skill orienta a los agentes pero no bloquea nada, y la
  mitad del trabajo del repo se hace a mano.
- **Validar también los mensajes de commit con un hook `commit-msg`:** quedó afuera por
  alcance; `AGENTS.md` ya pide Conventional Commits y la skill los documenta.

## Consecuencias
- `AGENTS.md` (paso 4 de "Cómo trabajar un step" y sección "Git y PR") y los criterios de
  aceptación del step 01 pasaron a la convención nueva. No quedan menciones de `step/NN-`.
- El título del PR **no** cambia: para un step sigue siendo `Step NN — Título del step`.
  La rama dice el tipo, el PR dice el step; son dos cosas distintas y conviene que sigan así.
- El tope de 50 caracteres es para que el nombre entre completo en la UI de GitHub. Si una
  rama legítima no entra, el nombre probablemente esté describiendo dos cambios.
- La lista de palabras vacías es corta a propósito: solo rechaza cuando **todas** las
  palabras de la descripción están en la lista, para que `feat/temp-file-cleanup` pase.
  Si aparecen falsos positivos, se ajusta la lista en el hook, en un solo lugar.
- `--no-verify` saltea el `pre-push`, igual que con el bloqueo de `main`. Lo definitivo es
  branch protection en GitHub, más una regla de nombres si la queremos ahí también.
