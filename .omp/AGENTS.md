# AGENTS.md — contrato del pipeline (portfolio-hector-creative)

Instalación limpia (ver `.omp/config.yml`): sin pipeline OpenSpec de agentes propio de este repo. Este archivo define el único carril de proceso activo hoy — el ciclo ágil TDD — y cómo se relaciona con OpenSpec cuando el humano lo pide explícitamente.

## Contrato del pipeline

| Ruta | Disparo |
|---|---|
| Trivial | Typo, texto, config de una línea → directo, sin ningún ciclo. |
| **Ciclo ágil TDD (por defecto)** | Historia de usuario chica (feature acotada, fix, ajuste de UI/componente), sin importar cuántos archivos toque. |
| OpenSpec | Solo por petición explícita del humano nombrando OpenSpec (`openspec/` sigue disponible vía CLI `openspec`). |

Referencias según la tarea:
- Ciclo ágil TDD → `docs/flujo-agil-tdd.md` (cheatsheet operativa) y `docs/agent-pipeline.md` (routing general).

### Cómo se fija el modelo por carril

El ciclo ágil TDD fija modelo vía `model:` en el frontmatter de cada agente (`.omp/agents/gherkin.md`, `tdd.md`, `harden.md`, resueltos contra `modelRoles` en `.omp/config.yml`). El coordinador (`pnpm agent:story`, comando `/agile-story`) también está pinneado, vía `--model @story` en el script — sin esto cae al modelo global de OMP, no al de este repo. Un carril OpenSpec, si se invoca, usaría en cambio terminales OMP distintas para fijar el modelo por etapa. Ambos mecanismos coexisten para carriles distintos del mismo worktree — no se mezclan dentro de un mismo carril.

### Sobre agregar agentes nuevos

Los tres agentes del ciclo ágil TDD (`gherkin`, `tdd`, `harden`) son infraestructura de pipeline aprobada en sesión de diseño con el humano (ver `docs/flujo-agil-tdd.md`), no algo que un worker agrega por su cuenta durante un encargo. No añadas reviewers, auditorías, plugins o agentes auxiliares nuevos sin una necesidad explícita del encargo actual.

## Arquitectura

`src/` sigue diseño atómico + features:

```
src/components/{atoms,molecules,organisms,templates}/  # presentación, sin estado de dominio
src/features/<feature>/                                 # comportamiento con estado, un directorio por feature
src/lib/{core,utils,api}/                                # lógica compartida, sin JSX/Astro
src/layouts/, src/pages/, src/content/, src/types/
```

Regla de frontera, exigida como gate determinista por `pnpm check:boundaries` (`dependency-cruiser`, etapa `harden`): **`src/components/**` no importa de `src/features/**`**. Si un componente necesita ese comportamiento, invierte la dependencia (prop/callback), inserta una interfaz, o parte el módulo.

Alias TS (`tsconfig.json`): `@atoms/*`, `@molecules/*`, `@organisms/*`, `@features/*`, `@layouts/*`, `@lib/*`.

## Qué no cambia

- Commit/push/merge requieren petición explícita del humano. Ningún agente de este pipeline los ejecuta por iniciativa propia.
- El pipeline OpenSpec completo sigue disponible bajo pedido explícito del humano; no es la ruta por defecto para historias chicas.
