#!/usr/bin/env bash
# Corre `pnpm agent:story` en ESTA MISMA terminal y deja "/agile-story " ya
# escrito en el input, sin enviarlo — tú completas la historia y das Enter.
#
# Pensado para el "comando rápido" de Orca (Acción: Terminal, Append Enter
# encendido): Orca ya abrió la terminal, este script no abre otra — se
# identifica a sí mismo vía la variable ORCA_TERMINAL_HANDLE que Orca inyecta
# en cada terminal que administra.
#
# Uso: scripts/start-story.sh

set -euo pipefail

ORCA="${ORCA_CLI_COMMAND:-orca}"
HANDLE="${ORCA_TERMINAL_HANDLE:-}"

if ! command -v "$ORCA" >/dev/null 2>&1; then
  echo "Error: no se encontró el ejecutable '$ORCA'. Instala/abre Orca o define ORCA_CLI_COMMAND." >&2
  exit 1
fi

if [[ -z "$HANDLE" ]]; then
  echo "Error: ORCA_TERMINAL_HANDLE no está seteada — este script debe correr dentro de una terminal administrada por Orca." >&2
  exit 1
fi

if ! "$ORCA" status --json >/dev/null 2>&1; then
  echo "Error: '$ORCA status' falló — ¿está la app de Orca abierta?" >&2
  exit 1
fi

# En segundo plano: espera a que OMP quede idle en ESTA terminal (mismo
# handle) y entonces escribe el borrador. Sobrevive al `exec` de abajo porque
# es un proceso aparte, ya independizado con `disown`.
(
  WAIT_JSON=$("$ORCA" terminal wait --terminal "$HANDLE" --for tui-idle --timeout-ms 60000 --json 2>/dev/null || echo '{}')
  SATISFIED=$(echo "$WAIT_JSON" | jq -r '.result.wait.satisfied // .result.satisfied // false' 2>/dev/null || echo false)
  if [[ "$SATISFIED" == "true" ]]; then
    "$ORCA" terminal send --terminal "$HANDLE" --text "/agile-story " --json >/dev/null 2>&1
  fi
) &
disown

exec pnpm agent:story
