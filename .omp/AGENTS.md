# Portfolio Hector Creative

Portafolio Astro con TypeScript estricto, Tailwind, GSAP, zod y pnpm.
Este archivo reúne las instrucciones del proyecto para OMP, el único harness.
Los modelos y permisos se configuran en `.omp/config.yml`; evita duplicar sus valores aquí.

## Alcance y autonomía

Trabaja en español (MX), con cambios enfocados y respetando el trabajo pendiente del usuario.
Resuelve decisiones locales dentro del alcance y continúa hasta cumplir la aceptación de
la fase asignada. Consulta al usuario si falta una decisión que cambie el alcance o un
acceso necesario; una dificultad técnica no requiere por sí misma otra aprobación.

Commit, push, merge y publicación requieren petición explícita. Solicita permiso para  
red, escrituras fuera del workspace y acciones destructivas no autorizadas.  
El principal usa `write`; yolo/auto-approve solo en worktrees desechables autorizados.  
Las herramientas `write` y `edit` están autorizadas sin confirmación adicional. En propose su alcance
es exclusivamente `openspec/changes/<cambio>/`; el permiso técnico no filtra rutas.
También están autorizados `task` y `orca orchestration send` para delegar y comunicar
el trabajo asignado. Estos permisos no sustituyen la revisión humana del plan.
`browser`, `eval` y `hub` tienen aprobación automática dentro del encargo. Son permisos
de herramienta completa, no un filtro de lectura ni de destinos; no autorizan operaciones
ajenas al encargo ni acciones destructivas o publicaciones sin petición explícita.
Las consultas de Git y Orca, lectura/validación de OpenSpec, instalación de dependencias
con `pnpm install`, check/build y creación local de worktrees de Orca ya están autorizadas
para el encargo. Para crear el worktree:
`orca worktree create --name <nombre> --parent-worktree active --setup skip --json`.
Las excepciones de `bash.patterns` evitan repetir esa aprobación, incluso fuera del
directorio principal cuando ese checkout cargue esta configuración. Las variantes de
instalación congelada/offline están incluidas. También se autoriza crear el change de
OpenSpec, abrir las terminales de propose/review, adoptarlas como workers, esperar y emitir heartbeat
con el preámbulo real. Las cadenas literales `&&` se evalúan comando por comando.
Lee directamente la salida JSON de OpenSpec: las tuberías `| jq` requieren aprobación.
Otros setup hooks, comandos de terminal, commit/push, borrado y aprobación del plan
conservan sus controles.
No recrees configuraciones de otros harnesses. Credenciales y providers viven en OMP global.

## Arquitectura

- `src/components/`: UI sin dependencias de `features/`. Atoms son elementos mínimos
  sin fetching; molecules agrupan átomos con lógica visual mínima; organisms componen
  secciones y reciben datos; templates definen estructuras de contenido.
- `src/features/`: estado complejo, persistencia y lógica específica de producto.
  Las features consumen la UI; la UI no importa features.
- `src/lib/`: `api/` para fetching, `core/` para inicializaciones/configuración y
  `utils/` para funciones puras. Usa `@lib/core/gsap.ts` cuando GSAP requiera configuración.
- `src/styles/`: reutiliza los tokens existentes en `global.css` y sus hojas importadas;
  prefiere utilidades en el HTML y evita el uso indiscriminado de `@apply`.
- Usa los aliases de `tsconfig.json`: `@atoms`, `@molecules`, `@organisms`,
  `@features`, `@layouts`, `@lib`.
- Define nuevas Content Collections en `src/content.config.ts` con esquemas zod.
  Al cambiar contenido, distingue esas colecciones del contenido consumido actualmente
  desde `src/lib/core/site-content.ts`; evita fuentes divergentes.

## Contrato del pipeline

Cambios triviales e inequívocos pueden ir directos. Multiarchivo, ambigüedad, cambios de
contratos, persistencia o riesgo requieren OpenSpec. Un worktree por solicitud:
propose, review y apply comparten artefactos, con terminales OMP distintas para fijar el modelo
y hacer visible cada fase. No delegues la revisión de specs con `task` interno.

| Fase | Resultado y límite |
| --- | --- |
| Coordinador `@orchestrator` | Despacha y comprueba resultados. En solicitudes no triviales, delega spec y código. Iniciar la sesión solo la deja disponible para recibir solicitudes. |
| Propose `@plan` | Solo artefactos en `openspec/changes/<cambio>/`; termina con `pnpm agent:ready <cambio>` y entrega al coordinador para revisión técnica. |
| Review `@review` | Terminal propia con `pnpm agent:review`, supervisada por Orca en el mismo worktree. Entrega `spec-review.md`; no aprueba ni implementa. |
| Revisión humana | El usuario revisa el plan y registra `pnpm agent:approve <cambio>`. El agente no fabrica el recibo ni aprueba su propio trabajo. |
| Apply `@smol` o `@default` | Implementa el plan aprobado, corrige fallos del cambio y completa la aceptación. Un cambio al plan requiere nueva revisión. |
| Cierre | `pnpm agent:verify <cambio>`, revisión del diff y aceptación funcional pertinente; luego archive/sync de OpenSpec. No implica autorización de commit/push/merge. |

Persisten en el change las decisiones, aprobación, evidencia y datos de handoff
(worktree, rama, modelo e IDs reales de Orca). Un worktree nuevo no hereda archivos
sin commit; verifica que tenga el pipeline vigente antes de despachar.
No cambies de modelo silenciosamente ni actives prewalk para estas fases.

## Coordinación mínima

El coordinador despacha, atiende bloqueos y comprueba entregas; no repite la exploración
del repo ni la revisión técnica del worker. Lee primero handoff, reporte y evidencia;
abre código solo para resolver una discrepancia concreta o comprobar el diff final.
Entrega al worker objetivo, alcance, rutas y aceptación, no la transcripción del chat.
Mantén un solo worker activo por change. Espera eventos de Orca; no sondees la terminal
continuamente ni envíes recordatorios si no hay novedades. Un timeout no implica fallo.
Lee las guías una vez por sesión y vuelve a ellas solo ante una operación nueva o recuperación.

Conserva un handoff breve con fase, IDs, rutas, hash y siguiente acción; no copies logs
ni specs completas al chat. Reporta al usuario cambios de fase, bloqueos y resultados.
No añadas reviewers, auditorías, plugins o scripts auxiliares sin una necesidad del encargo.
En apply usa el esfuerzo configurado. Si dos intentos distintos no resuelven el mismo
fallo, registra evidencia y pide un escalamiento acotado de esfuerzo o modelo; no escales
por rutina ni repitas intentos idénticos. No reduzcas los criterios de aceptación para ahorrar.

## Revisión técnica

Revisa proposal, design, specs y tasks contra el código existente: coherencia, alcance,
requisitos verificables, riesgos y cobertura de validaciones. No delegues esta revisión.
Haz una revisión inicial; si hay correcciones, revisa solo el delta y sus dependencias
contra los hallazgos previos. Amplía la revisión únicamente si cambió el alcance o surgió
un riesgo nuevo. Conserva en el reporte la base revisada y actualiza el hash vigente.
Distingue bloqueos de sugerencias: preferencias de estilo o mejoras opcionales no abren
otra ronda ni impiden presentar el plan al humano. Evita reescribir el plan en el reporte.
No modifiques código, plan, checkboxes ni `review.json`; la única escritura de contenido
permitida es `openspec/changes/<cambio>/spec-review.md`. Esto es un límite de instrucciones,
no un sandbox de rutas. No instales dependencias ni ejecutes tests de implementación.

Ejecuta `pnpm agent:ready <cambio>` y registra en el reporte el hash del plan, modelo,
fecha, resultado de validación, dictamen (`sin bloqueos` o `requiere ajustes`), hallazgos
con rutas y recomendaciones. Haz visible el progreso y explica las conclusiones sin
exigir razonamiento interno privado. Reporta al coordinador usando el preámbulo real
de Orca. El coordinador comprueba el reporte contra el hash vigente: si hay bloqueos o
cambia el plan, vuelve a propose/review. Después presenta plan y reporte al humano;
el dictamen técnico nunca sustituye `agent:approve`.

## Validación

Usa la comprobación más cercana a lo afectado. Los tests del pipeline
(`pnpm agent:test:pipeline`) usan fixtures temporales sin acceso a producción:
puedes ejecutarlos, corregir fallos del cambio y repetirlos sin otra aprobación.
Para cerrar apply, `agent:verify` exige tasks completas y ejecuta check/build.
Marca tasks completadas con evidencia, no con expectativas.
Después de pasar los checks, repítelos solo ante cambios o fallos que lo justifiquen.
El coordinador comprueba que evidencia, hash y diff corresponden al estado entregado;
no vuelve a ejecutar check/build solo por recibir `worker_done`. Si la evidencia falta,
está desactualizada o no permite comprobar ese estado, repite el chequeo pertinente.

Check/build no cubren interacción ni apariencia: verifica navegador, accesibilidad,
responsive y reduced motion cuando el cambio los afecte. No declares pruebas no realizadas.
`tui-idle`, `worker_done` y un recibo antiguo no prueban el estado actual del código.
Worktrees comparten cuotas, credenciales y servicios; asigna puertos/datos de prueba cuando aplique.

## Referencias según la tarea

- Despacho, espera, handoff o recuperación con Orca: `docs/flujo-orca-openspec.md`.
  La autoridad del worker viene del preámbulo real; reporta y libera según ese protocolo.
- Uso del pipeline, roles y señales de avance: `docs/agent-pipeline.md`.
- Propose/apply/archive/sync: comandos y skills generados por OpenSpec en `.omp/`;
  contexto y aceptación del cambio en `openspec/config.yaml` y sus artefactos.

Consulta solo las referencias relevantes para la tarea.
