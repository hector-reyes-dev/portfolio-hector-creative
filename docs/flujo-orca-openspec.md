# Orca + OpenSpec

El checkout principal coordina con Codex `gpt-5.6-luna` y esfuerzo `xhigh`.
Cada funcionalidad nueva se trabaja en un worktree hijo de Orca. Astra prepara
la spec con `gpt-6-astra` y esfuerzo `medium`; el implementador usa Claude Code
Sonnet en ese mismo hijo cuando el usuario lo solicita.

## Preparar un hijo

Crear el worktree con `--setup skip` cuando el hook de aplicación no deba
instalar dependencias. Después, desde el coordinador, sincronizar la
configuración del flujo:

```sh
pnpm agents:sync --target /ruta/absoluta/del/hijo --apply
pnpm agents:sync --target /ruta/absoluta/del/hijo --check
```

Luego ejecutar en el hijo `pnpm agents:setup`. El sincronizador solo copia
archivos de coordinación y mezcla scripts `agent:*`/`agents:*`; conserva código,
dependencias, secretos y specs propias del hijo. Si detecta un cambio local o
un enlace simbólico, cancela antes de escribir.

## Despacho

Usar `worker-start` sobre el worktree ya preparado, con el modelo y esfuerzo
explícitos. Comprobar `launch.effective` y el estado de inicio del recibo; no
inferir el modelo por el título de la terminal. Para una spec, el encargo debe
indicar alcance, restricciones, archivos bajo responsabilidad y validación.

Una spec lista requiere `openspec validate <cambio> --type change --strict
--no-interactive`. Entregar nombre, worktree, rama, rutas de artefactos y
comando de apply. No iniciar otro worktree desde el hijo.

El usuario puede iniciar la implementación en el mismo hijo con:

```sh
pnpm agent:apply
/opsx:apply <cambio>
```

Las instrucciones explícitas del usuario para el modelo o esfuerzo tienen
precedencia sobre estos valores por defecto.
