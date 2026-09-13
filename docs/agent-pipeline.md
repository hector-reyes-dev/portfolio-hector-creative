# Flujo de trabajo: OMP + OpenSpec + Orca

OMP ejecuta los agentes, OpenSpec guarda el plan y Orca organiza worktrees y workers.
El coordinador dirige las fases mediante comandos de Orca; los scripts del repo
comprueban los requisitos para avanzar. No hay un proceso que apruebe planes automáticamente.

## 1. Solicitud al coordinador

Abre la sesión configurada en Orca con `pnpm agent:orchestrator` y describe el resultado:
“Añade dark mode al sitio”. Luna recibe la solicitud y determina su alcance.

Un cambio trivial puede resolverse directamente. Una feature, un cambio multiarchivo
o una solicitud con ambigüedad o riesgo pasa por OpenSpec en un worktree propio.

## 2. Propuesta en el worktree

El coordinador crea el worktree y abre una sesión OMP con `pnpm agent:propose`.
La despacha como worker con `/opsx-propose <cambio>` y la descripción del encargo.
Astra inspecciona el proyecto y escribe únicamente el plan:

```text
openspec/changes/<cambio>/
├── proposal.md          Alcance y motivo
├── design.md            Decisiones de implementación
├── specs/**/spec.md     Requisitos y escenarios
└── tasks.md             Trabajo y validaciones pendientes
```

El worker ejecuta `pnpm agent:ready <cambio>`, que comprueba los artefactos y
`openspec validate --strict`. Después avisa al coordinador mediante `worker_done`.
El coordinador comprueba el resultado y te presenta el plan para revisión.

## 3. Revisión humana

Revisa los cuatro artefactos. Si requieren ajustes, el trabajo vuelve a propuesta.
Cuando estés conforme, desde una terminal del mismo worktree ejecuta:

```sh
pnpm agent:approve <cambio>
```

La confirmación guarda `review.json` con el hash del plan aprobado.
Modificar el plan invalida la aprobación; marcar checkboxes de tasks no la invalida.
El coordinador espera esta revisión antes de despachar implementación.

## 4. Implementación

En el mismo worktree, el coordinador abre una sesión nueva para fijar el modelo:

| Comando | Modelo y esfuerzo |
| --- | --- |
| `pnpm agent:orchestrator` | Luna xhigh |
| `pnpm agent:propose` | Astra medium |
| `pnpm agent:apply:flash <cambio>` | DeepSeek V4.1 Flash low |
| `pnpm agent:apply <cambio>` | Sonnet 5 medium |

Los comandos de apply comprueban `review.json` antes de iniciar `/opsx-apply <cambio>`.
Con Orca se añade `--idle` para abrir la sesión y adoptarla como worker antes de despachar
ese prompt. Flash es la opción habitual; Sonnet es la alternativa explícita.
No hay cambio automático de modelo. Los IDs y roles están en [.omp/config.yml](../.omp/config.yml).

El worker implementa, valida y actualiza tasks con evidencia. Si necesita cambiar el
plan aprobado, vuelve a revisión humana.

## 5. Comprobación y cierre

El worker ejecuta `pnpm agent:verify <cambio>`: exige plan aprobado vigente,
OpenSpec válido y tasks completas; después corre `pnpm check && pnpm build`.
Si todo pasa, guarda `verification.json` y reporta el resultado al coordinador.

El coordinador comprueba evidencia y diff. Los cambios visuales o interactivos requieren
además revisión en navegador: check/build no prueban su comportamiento.
Si cambia código después de verificar, se repiten las comprobaciones afectadas.

Con la aceptación cumplida, `openspec archive <cambio>` sincroniza los deltas y archiva
el cambio, atendiendo sus confirmaciones. El coordinador libera los workers terminados
y entrega el resultado. Commit, push y merge requieren tu petición explícita.

## Qué puedes observar

- **Estado y contexto:** artefactos y decisiones en `openspec/changes/<cambio>/`;
  `handoff.json` registra worktree, rama, modelo e IDs de Orca.
- **Aprobación:** `review.json`. Es un recibo local; un comando OMP directo puede omitir el control del launcher.
- **Validación:** `verification.json`, salida de los checks y diff actual.
- **Avisos:** `worker_done` comunica fin de fase; `tui-idle` solo indica que la terminal está disponible. Ninguno sustituye las comprobaciones.

Los worktrees heredan lo commiteado, no los cambios pendientes. Comparten cuotas,
credenciales y servicios: consulta `omp usage` y asigna puertos distintos cuando haga falta.
El principal usa `always-ask`; auto-approve se reserva para worktrees desechables autorizados.

Instrucciones del proyecto: [.omp/AGENTS.md](../.omp/AGENTS.md).
Comandos exactos de creación, despacho, espera y liberación:
[flujo-orca-openspec.md](flujo-orca-openspec.md).
