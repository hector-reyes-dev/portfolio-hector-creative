# Flujo personal de agentes

Lee también AGENTS.md y las instrucciones específicas del proyecto.
Comunicar en español (MX), claro y directo. Explicar la acción inmediata antes de ejecutar comandos.

## Roles

- El checkout principal de Orca coordina con Codex gpt-5.6-luna, esfuerzo xhigh.
- Cada funcionalidad nueva se trabaja en un hijo nuevo; una continuación usa su hijo existente. Consultas y mantenimiento de herramientas pueden hacerse en el principal.
- El primer agente del hijo prepara la spec con Codex gpt-6-astra, esfuerzo medium, usando $openspec-propose. No implementa.
- El usuario inicia después apply en ese mismo hijo con Claude Code sonnet, o OpenCode GLM/Kimi con el proveedor/modelo que haya elegido.
- Los hijos no vuelven a orquestar recursivamente. Una instrucción posterior explícita del usuario prevalece sobre estos valores.

## Secuencia

1. Leer las skills orca-cli y orchestration y su guía vigente desde el binario de Orca.
2. Desde el coordinador usar flujo-agentes new <nombre> --project <raíz>. Crea el hijo con setup de aplicación omitido, sincroniza estas instrucciones y prepara OpenSpec antes de devolverlo. No lanza agentes ni instala dependencias de aplicación. Si se crea desde la UI, ejecutar flujo-agentes sync --from <principal> --to <hijo> y flujo-agentes setup <hijo> antes de despachar.
3. Crear el Run y la Task, y usar worker-start en el hijo preparado con --agent codex --model gpt-6-astra --effort medium. Comprobar launch.effective una vez. Nunca asumir el modelo por el título de la terminal.
4. Astra lee este archivo, el código y las specs existentes; genera proposal, design, delta specs y tasks. Usa las rutas resueltas por OpenSpec. Valida con openspec validate <cambio> --type change --strict --no-interactive.
5. Esperar eventos en ventanas de hasta 120 segundos. Procesar todas las entregas y reconocerlas. Una espera vacía no implica fallo. Aplicar worker-release solo tras la finalización válida y según la guía vigente.
6. Entregar nombre, ruta, rama, validación y comando de apply; marcar Spec lista; pendiente de apply. No iniciar implementación automáticamente.

## Autorización de coordinación

El usuario que instala este flujo autoriza la lectura de archivos y salidas de sus agentes, inspección de procesos/modelos, esperas, creación y configuración de worktrees, sincronización de estas instrucciones, despachos y mensajes dentro del proyecto. No pedir confirmación conversacional por cada operación. Los permisos administrados por el entorno siguen aplicando: si requieren aprobación técnica, guardar un prefijo estable por operación, nunca uno ligado a un handle o timeout. Usar orca consistentemente, sin wrappers; si la skill exige otro ejecutable, comprobar y adaptar sus permisos. No desactivar el sandbox ni establecer approval_policy=never para ocultar bloqueos.

Esta autorización no incluye borrar worktrees, resetear bases, publicar artefactos, merge, push, deploy o escrituras en otros proyectos. No copiar credenciales, .env ni configuraciones globales personales. No guardar capacidades ni handles efímeros en Git.

## Integración y validación

Antes de apply, coordinar dueño y orden cuando dos specs compartan rutas, componentes o contratos. Asignar puertos por worktree y un único ejecutor para pruebas que muten servicios compartidos. Validar con los comandos propios del proyecto; marcar tareas solo cuando estén comprobadas. Mantener cambios mínimos y conservar modificaciones ajenas.

## Contexto del proyecto

Describe aquí el stack, dominio y convenciones de este proyecto.
