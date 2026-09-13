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
El coordinador comprueba el resultado y despacha la revisión técnica.
No repite la exploración del proyecto: transmite objetivo, rutas y aceptación, y espera
eventos de Orca en lugar de consultar continuamente las terminales.

## 3. Revisión técnica y humana

El coordinador abre **otra terminal OMP en el mismo worktree** con `pnpm agent:review`
(Sonnet 5 high), espera a que esté disponible y la adopta como worker de Orca.
No usa `task` interno para esta fase. Verás su actividad, herramientas y conclusiones;
los bloques de thinking dependen de lo que el proveedor entregue y OMP muestre.

El reviewer contrasta el plan con el código y deja `spec-review.md` con el hash revisado,
hallazgos y dictamen. No cambia la spec ni implementa. Si requiere ajustes, vuelve a
propose y después a review **solo del delta y sus dependencias**. Las sugerencias opcionales
no abren otra ronda; una nueva revisión completa requiere cambio de alcance o riesgo nuevo.
El coordinador comprueba que el reporte corresponde al
plan vigente y te presenta ambos. Este dictamen **no es la aprobación humana**.

Revisa los cuatro artefactos y el reporte. Si requieren ajustes, vuelve a propuesta.
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
| `pnpm agent:review` | Sonnet 5 high |
| `pnpm agent:apply:flash <cambio>` | DeepSeek V4.1 Flash medium |
| `pnpm agent:apply <cambio>` | Sonnet 5 medium |

Los comandos de apply comprueban `review.json` antes de iniciar `/opsx-apply <cambio>`.
Con Orca se añade `--idle` para abrir la sesión y adoptarla como worker antes de despachar
ese prompt. Flash es la opción habitual; Sonnet es la alternativa explícita.
No hay cambio automático de modelo. Los IDs y roles están en [.omp/config.yml](../.omp/config.yml).
`medium` es el punto de partida de Flash, no una mejora de eficiencia ya demostrada.
Tras dos intentos distintos fallidos sobre el mismo bloqueo, el worker reporta evidencia
y solicita un escalamiento acotado; no usa `max` ni cambia a Sonnet por rutina.

El worker implementa, valida y actualiza tasks con evidencia. Si necesita cambiar el
plan aprobado, vuelve a revisión humana.

## 5. Comprobación y cierre

El worker ejecuta `pnpm agent:verify <cambio>`: exige plan aprobado vigente,
OpenSpec válido y tasks completas; después corre `pnpm check && pnpm build`.
Si todo pasa, guarda `verification.json` y reporta el resultado al coordinador.

El coordinador comprueba evidencia y diff. Los cambios visuales o interactivos requieren
además revisión en navegador: check/build no prueban su comportamiento.
Si cambia código después de verificar, se repiten las comprobaciones afectadas.
Si la evidencia corresponde al estado entregado, el coordinador no repite check/build
ni solicita otra auditoría completa. Si falta evidencia o no está vigente, sí revalida.

Con la aceptación cumplida, `openspec archive <cambio>` sincroniza los deltas y archiva
el cambio, atendiendo sus confirmaciones. El coordinador libera los workers terminados
y entrega el resultado. Commit, push y merge requieren tu petición explícita.

## Qué puedes observar

- **Estado y contexto:** artefactos y decisiones en `openspec/changes/<cambio>/`;
  `handoff.json` registra worktree, rama, modelo e IDs de Orca.
- **Aprobación:** `review.json`. Es un recibo local; un comando OMP directo puede omitir el control del launcher.
- **Revisión técnica:** terminal REVIEW y `spec-review.md`. La sesión interna ya iniciada no se convierte automáticamente en una terminal; este flujo aplica a nuevos despachos con el setup actualizado.
- **Validación:** `verification.json`, salida de los checks y diff actual.
- **Avisos:** `worker_done` comunica fin de fase; `tui-idle` solo indica que la terminal está disponible. Ninguno sustituye las comprobaciones.

Los worktrees heredan lo commiteado, no los cambios pendientes. Comparten cuotas,
credenciales y servicios: consulta `omp usage` y asigna puertos distintos cuando haga falta.
El principal usa `always-ask`; auto-approve se reserva para worktrees desechables autorizados.
`write` y `edit` tienen aprobación automática para escribir o editar artefactos. Es una excepción por
herramienta, no por ruta: propose mantiene el alcance `openspec/changes/<cambio>/`.
`task` y `orca orchestration send` también tienen aprobación automática para delegación
y comunicación dentro del encargo; la revisión humana del plan sigue siendo obligatoria.
`browser`, `eval` y `hub` están permitidos dentro del encargo. El permiso cubre cada
herramienta completa; no limita destinos ni vuelve de solo lectura la ejecución de código.
Las consultas de Git/Orca, lectura y validación de OpenSpec, `pnpm install` (también
congelado/offline) y crear worktrees con `--setup skip --json` tienen aprobación
persistente en `.omp/config.yml`. También están cubiertos los comandos observados en
dark-mode: crear el change, crear la corrida, abrir terminales de propose/review, adoptar al
worker, esperar, consultar su buzón, emitir heartbeat y ejecutar check/build.
Las cadenas `&&` se evalúan comando por comando. Las tuberías `| jq` siguen requiriendo
aprobación: para OpenSpec basta leer el JSON directamente. Otros setup hooks, comandos
de terminal, borrado de worktrees y commit/push conservan sus controles.
Estas excepciones se aplican a sesiones que carguen la configuración actual; no cambian
automáticamente la sesión en curso ni los worktrees que ya se habían creado.

Instrucciones del proyecto: [.omp/AGENTS.md](../.omp/AGENTS.md).
Comandos exactos de creación, despacho, espera y liberación:
[flujo-orca-openspec.md](flujo-orca-openspec.md).
