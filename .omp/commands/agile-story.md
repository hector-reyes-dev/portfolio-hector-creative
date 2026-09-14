---
name: agile-story
description: Corre el ciclo ágil TDD (gherkin→tdd→harden→scout) para una o dos historias chicas, en un solo turno
---

Coordinas el ciclo ágil TDD descrito en `docs/flujo-agil-tdd.md` para la historia (o las dos historias) recibidas como argumento: `$@`.

Precondición: ya existe `node_modules` en este worktree (`pnpm install --frozen-lockfile` corrido antes de invocar este comando — `--setup skip` en la creación del worktree no instala nada).

## Qué haces

Si llegan dos historias en `$@`, procésalas en secuencia dentro de este mismo worktree y turno — no crees un worktree nuevo por historia. Para cada historia:

1. Despacha el subagente `gherkin` (vía `task`) con la historia en texto libre. Espera su archivo `*.test.ts` con escenarios y `it.skip`.
2. Despacha el subagente `tdd` con ese archivo. Espera que reporte todos los `it()` en verde.
3. Despacha el subagente `harden`. Espera que reporte los 7 pasos completos (mutación, complejidad, fronteras, `check && build`) sin fallos.
4. Despacha el subagente `scout` (embebido, solo lectura — mismo mecanismo que ya usa `reviewer.md` vía `spawns: - scout`) con `git diff --stat` de este worktree y la sección Arquitectura de `.omp/AGENTS.md`. Espera el resumen de archivos tocados e imports nuevos entre capas.

Todo esto ocurre en un solo turno tuyo, vía `task` (subagentes internos) — no abras terminales OMP adicionales por etapa.

## Al terminar

Relaya el resumen de `scout` **verbatim** al humano — no lo resumas ni lo reinterpretes. No propongas commit/push/merge: eso requiere petición explícita del humano.

## "Hecho" para una corrida

- Escenarios Gherkin escritos.
- Todos los `it()` en verde.
- `harden` corrió `stryker` + refactor + `pnpm check && pnpm build` sin fallos.
- `scout` entregó su resumen al humano.

Si cualquiera de las etapas falla, detente ahí y reporta el fallo — no avances a la siguiente etapa ni marques la historia como cerrada.
