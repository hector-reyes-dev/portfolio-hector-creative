# Orca: OMP con modelos explícitos

Complementa [agent-pipeline.md](agent-pipeline.md). Comandos contrastados con Orca 1.4.200.
Ejecutar desde el coordinador dentro de Orca. Sustituir placeholders por recibos JSON reales.

## Inicio y worktree

```sh
pnpm agent:orchestrator
orca status --json
orca skills get orchestration
orca orchestration run-create --objective "Añadir dark mode al sitio" --json
orca worktree create --name dark-mode --parent-worktree active --setup skip --json
```

El id es <repoId>::<ruta>, no solo repoId. Conservarlo.
La creación `orca worktree create --name prueba --agent omp --json` está soportada,
pero usa el modelo del launcher por defecto. Aquí necesitamos argv explícito para Astra,
por eso creamos la terminal aparte. Una shell inicial de Orca puede quedar abierta;
no cerrar tabs configuradas por el usuario.

Antes de arrancar: comprobar que el hijo tiene el pipeline vigente.
Si todavía no se ha commiteado y .omp NO existe en el hijo, copiar desde el principal:

```sh
cp -R .omp "<ruta-hijo>/.omp"
cp package.json .gitignore "<ruta-hijo>/"
cp openspec/config.yaml "<ruta-hijo>/openspec/config.yaml"
cp docs/agent-pipeline.md docs/flujo-orca-openspec.md "<ruta-hijo>/docs/"
```

Si .omp existe, comparar y aplicar un patch específico. Revisar también las eliminaciones
pendientes del flujo anterior que HEAD conserva con
`git diff --name-status -- AGENTS.md .claude .codex .agent-flow CLAUDE.md scripts/sincronizar-agentes.mjs`.
Retirar del hijo exactamente esos archivos después de comprobar que no tienen cambios propios.
No copiar credenciales ni node_modules. En el hijo: pnpm install --frozen-lockfile.
Una vez integrado el setup en Git, el worktree lo hereda sin copia.

## Propose supervisado

```sh
orca terminal create --worktree "id:<repoId>::<ruta-hijo>" --title "PROPOSE · Astra" --command "pnpm agent:propose" --json
orca terminal wait --terminal <handle-propose> --for tui-idle --timeout-ms 60000 --json
orca orchestration worker-start --worktree "id:<repoId>::<ruta-hijo>" --terminal <handle-propose> --spec "/opsx-propose dark-mode: añadir dark mode. Solo artefactos. Lee .omp/AGENTS.md. Ejecuta pnpm agent:ready dark-mode. Reporta modelo, rutas, rama y validación con worker_done según el preámbulo. No aplicar." --json
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 60000 --json
```

Adoptar solo con wait.satisfied:true. Si hay timeout, observar de nuevo sin duplicar envío.
Comprobar modelo en la sesión: el título no lo prueba.
worker-start --terminal adopta la sesión arrancada con argv explícito y entrega el preámbulo
con Task/Dispatch y el comando exacto de worker_done. No inventar esos IDs.
No usar worker-start --agent omp --model @plan: el help de esta versión no documenta
model/effort para OMP. No existe una prohibición general de dispatch para propose:
hay que arrancar la sesión con el modelo correcto antes de adoptarla.

Guardar IDs/rutas en openspec/changes/dark-mode/handoff.json en el hijo.
Atender preguntas. Ante worker_done, comprobar archivos y ejecutar agent:ready desde el hijo.
Liberar al worker asentado y reconocer la entrega:

```sh
orca orchestration worker-release --dispatch <dispatch-id> --json
orca orchestration check --ack <delivery-id> --json
```

No liberar ante silencio, timeout o estado desconocido: consultar recuperación de Orca.
Presentar el plan al humano y esperar. Todavía no hay apply.

## Revisión y apply

El humano desde el hijo ejecuta pnpm agent:approve dark-mode.
Tras aprobar, el coordinador abre una sesión nueva, sin prompt hasta adoptarla:

```sh
orca terminal create --worktree "id:<repoId>::<ruta-hijo>" --title "APPLY · Flash" --command "pnpm agent:apply:flash dark-mode --idle" --json
orca terminal wait --terminal <handle-apply> --for tui-idle --timeout-ms 60000 --json
orca orchestration worker-start --worktree "id:<repoId>::<ruta-hijo>" --terminal <handle-apply> --spec "/opsx-apply dark-mode. Lee review.json y .omp/AGENTS.md. Implementa el plan aprobado. Ejecuta pnpm agent:verify dark-mode. Reporta evidencia y límites con worker_done según el preámbulo. Sin commit/push/merge." --json
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 60000 --json
```

Para Sonnet: comando de terminal pnpm agent:apply dark-mode --idle.
Tras éxito ejecutar agent:verify en el hijo, revisar diff y comportamiento; liberar/ack.
Si cambia el plan, nueva revisión. El receipt local no es una frontera de seguridad.
Archive en el hijo: openspec archive dark-mode, sin --yes; revisar sync y confirmar.
Spec y apply comparten worktree. Reportar resultado/ruta/pruebas; sin commit/push/merge.

## Sin Orca

```sh
git worktree add -b feature/dark-mode ../portfolio-dark-mode HEAD
cd ../portfolio-dark-mode
pnpm install --frozen-lockfile
pnpm agent:propose
# /opsx-propose dark-mode ...
pnpm agent:ready dark-mode
pnpm agent:approve dark-mode
pnpm agent:apply:flash dark-mode
pnpm agent:verify dark-mode
openspec archive dark-mode
```

Mismos requisitos de configuración versionada, aprobación y aislamiento de servicios.
