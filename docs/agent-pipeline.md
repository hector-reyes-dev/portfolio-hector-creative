# Pipeline de agentes

## 1. Cuándo usar qué carril

| Ruta | Cuándo |
|---|---|
| Trivial | Typo, texto, config de una línea. Directo, sin ciclo ni revisión de proceso. |
| **Ciclo ágil TDD** (por defecto) | Historia de usuario chica: feature acotada, fix, ajuste de UI/componente. No importa cuántos archivos toque — el número de archivos no es, por sí solo, motivo para escalar a OpenSpec. |
| OpenSpec | Solo cuando el humano lo pide explícitamente nombrando OpenSpec. Reservado para cambios con riesgo, arquitectura compartida o persistencia que ameriten los 4 artefactos del pipeline `propose → review → approve → apply → verify`. |

Detalle operativo del ciclo ágil TDD (etapas, agentes, comandos, gates): `docs/flujo-agil-tdd.md`.

Contrato general del pipeline, arquitectura del repo y reglas de agentes: `.omp/AGENTS.md`.

## 2. Por qué el ciclo ágil TDD es el default

El pipeline OpenSpec de 4 artefactos resuelve bien cambios con riesgo real, pero genera documento de más para historias chicas. El ciclo ágil TDD (Gherkin → TDD asistido → endurecimiento → inspección arquitectónica humana) cubre ese tamaño de tarea con menos fricción y sin sacrificar los gates que importan: tests en verde, mutation testing, fronteras de dependencias y check/build. La complejidad ciclomática queda como diagnóstico manual opcional (`pnpm report:complexity`), no como gate bloqueante.
