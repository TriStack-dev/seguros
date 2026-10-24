# 0001 — Memoria de engram versionada en el repo

- **Fecha:** 2026-10-22
- **Step:** — (tooling, previo al step 01)
- **Estado:** Aceptada

## Contexto
El equipo trabaja este repo con agentes (Claude Code y Codex, ver `AGENTS.md`) que usan
engram como memoria persistente. Esa memoria vive en `~/.engram/engram.db`, una base
**global de cada máquina** que contiene además otros proyectos ajenos a MiSeguro. Sin
compartirla, cada integrante arranca sin el contexto de las decisiones ya tomadas y los
agentes repiten preguntas y errores ya resueltos.

La restricción fuerte es de privacidad: no puede terminar en el repo nada de otros
proyectos, ni los prompts crudos de nadie.

## Decisión
La memoria del proyecto viaja en el repo, en `.engram/`, como chunks JSONL gzippeados más
un `manifest.json`:

- **Exportar:** `engram sync` (sin flags), que está scopeado por el directorio de trabajo y
  exporta solo el proyecto `seguros`. Lo disparan el hook `SessionEnd` de Claude Code y el
  `pre-push` de git.
- **Importar:** `engram sync --import`, una vez al clonar y después automático en cada pull
  vía el hook `post-merge`.
- **Gate:** el `pre-push` rechaza el push si quedó memoria sin commitear en `.engram/`, para
  que el código y la memoria viajen juntos.

Reglas que no se rompen, anotadas también como comentarios en los hooks:

- **Nunca `engram sync --all`**: exportaría los otros proyectos de la base global.
- **Nunca `engram sync --include-prompts`**: compartiría los prompts crudos. Desde engram
  3.5.2 los prompts se excluyen por defecto; el flag los volvería a meter.

Se requiere engram **3.5.2 o mayor**: en 2.2.1 los prompts iban dentro del chunk.

## Alternativas descartadas
- **No compartir la memoria:** es el estado actual; cada integrante pierde el contexto y los
  agentes vuelven a tropezar con lo mismo. Descartada por costo de repetición.
- **Engram cloud (`--cloud`):** evitaría commitear datos, pero agrega un servicio externo,
  credenciales que administrar y datos del proyecto fuera de nuestra infraestructura.
  Descartada por ahora; es la salida natural si el equipo crece o el repo deja de ser privado.
- **Hook de agente en vez de `pre-push`:** solo cubriría a quien trabaje con ese agente.
  El `pre-push` es agnóstico: aplica a Claude Code, Codex, OpenCode y pushes a mano.

## Consecuencias
- Un repo recién clonado trae la memoria del proyecto sin configuración extra más allá de
  `pnpm install` (que activa `core.hooksPath`) y un `engram sync --import` inicial (step 01).
- **El contenido commiteado queda en el historial de git para siempre.** Aunque se deje de
  exportar algo, los chunks viejos no se borran. Por eso no van prompts y por eso esto
  depende de que el repo siga siendo privado y el equipo de confianza. Si el repo se abre,
  hay que revisar `.engram/` antes.
- `.engram/` empieza con punto: un template de `.gitignore` la puede tapar y dejar el flujo
  silenciosamente inútil. Hay un criterio de aceptación en el step 01 (`git check-ignore
  .engram` no devuelve nada) para cubrirlo.
- El export es append-only: cada sync crea un chunk con id nuevo, así que no hay conflictos
  de merge salvo en `manifest.json`. Un `engram sync` sin memorias nuevas igual puede crear
  un chunk con solo la fila de la sesión abierta, pero es idempotente.
- Las observaciones viajan; las **relaciones de conflicto** se exportan como mutaciones pero
  en la prueba de import no se replicaron. Queda como pendiente a revisar.
- `--no-verify` saltea el `pre-push`. El enforcement real contra pushes a `main` tiene que
  ser branch protection en GitHub; los hooks son la primera línea, no la última.
