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
El principal usa `always-ask`; yolo/auto-approve solo en worktrees desechables autorizados.
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
propose y apply comparten artefactos, con sesiones distintas para fijar el modelo.

| Fase | Resultado y límite |
| --- | --- |
| Coordinador `@orchestrator` | Despacha y comprueba resultados. En solicitudes no triviales, delega spec y código. Iniciar la sesión solo la deja disponible para recibir solicitudes. |
| Propose `@plan` | Solo artefactos en `openspec/changes/<cambio>/`; termina con `pnpm agent:ready <cambio>` y entrega al humano para revisión. |
| Revisión humana | El usuario revisa el plan y registra `pnpm agent:approve <cambio>`. El agente no fabrica el recibo ni aprueba su propio trabajo. |
| Apply `@smol` o `@default` | Implementa el plan aprobado, corrige fallos del cambio y completa la aceptación. Un cambio al plan requiere nueva revisión. |
| Cierre | `pnpm agent:verify <cambio>`, revisión del diff y aceptación funcional pertinente; luego archive/sync de OpenSpec. No implica autorización de commit/push/merge. |

Persisten en el change las decisiones, aprobación, evidencia y datos de handoff
(worktree, rama, modelo e IDs reales de Orca). Un worktree nuevo no hereda archivos
sin commit; verifica que tenga el pipeline vigente antes de despachar.
No cambies de modelo silenciosamente ni actives prewalk para estas fases.

## Validación

Usa la comprobación más cercana a lo afectado. Los tests del pipeline
(`pnpm agent:test:pipeline`) usan fixtures temporales sin acceso a producción:
puedes ejecutarlos, corregir fallos del cambio y repetirlos sin otra aprobación.
Para cerrar apply, `agent:verify` exige tasks completas y ejecuta check/build.
Marca tasks completadas con evidencia, no con expectativas.
Después de pasar los checks, repítelos solo ante cambios o fallos que lo justifiquen.

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
