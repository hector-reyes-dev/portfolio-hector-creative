# Agent selection — portfolio-hector-creative

Instrucciones de enrutamiento para el trabajo delegado a agentes hijos en este
workspace. Traycer enruta por *tipo de trabajo*, no por el nombre literal del
comando `/opsx:*` — mapeá por la naturaleza de la tarea que se está delegando.

## Planeación / propuesta (`/opsx:propose`, `/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:update`, exploración de requisitos)

- **Harness:** Claude Code
- **Modelo:** Claude Opus (el tier más alto disponible en la cuenta; actualmente `claude-opus-5`)
- **Reasoning effort:** high (subir a max en changes grandes o con requisitos ambiguos)
- **Por qué:** es la fase de mayor apalancamiento — un error de alcance, requisitos o deltas de spec acá se propaga a implementación y revisión. Nunca delegar esta fase a un modelo más barato.

## Implementación (`/opsx:apply`)

- **Harness:** OpenCode
- **Modelo:** GLM-5.3 (el modelo completo, no la variante Flash/económica)
- **Reasoning effort:** high
- **Por qué:** rendimiento fuerte en benchmarks agénticos/de terminal a una fracción del costo de Opus; adecuado para ejecutar un `tasks.md` ya aprobado y bien definido.
- **Restricción:** este agente nunca edita `proposal.md` ni los deltas de `specs/` — solo implementa las tareas ya planeadas.

## Revisión / verificación (`/opsx:verify`, revisión de PR, validación post-implementación)

- **Harness:** OpenCode
- **Modelo:** DeepSeek V4 (tier Pro/Reasoner si está disponible)
- **Reasoning effort:** max
- **Por qué:** familia de modelo independiente tanto del planificador (Claude) como del implementador (GLM) — detecta una clase de errores distinta a la de ambos. Solo lectura: valida contra los deltas de spec y `tasks.md`, corre los checks del proyecto, reporta PASS/FAIL con evidencia concreta (archivo:línea); no edita código.

## Fallback general

Trabajo delegado que no encaja claramente en planeación, implementación o
revisión: usar Claude Code + Opus con effort high hasta que se aclare la
categoría.
