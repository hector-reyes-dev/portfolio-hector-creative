#!/usr/bin/env bash
# Abre una terminal de Orca con `pnpm agent:story` y deja "/agile-story " ya
# escrito en el input, sin enviarlo — tú completas la historia y das Enter.
#
# Uso:
#   scripts/start-story.sh              # terminal nueva en el worktree actual
#   scripts/start-story.sh mi-historia  # crea worktree "mi-historia" primero
#
# Requiere la app de Orca abierta y el CLI `orca` resuelto según sus reglas
# (ver skill orca-cli): ORCA_CLI_COMMAND si está seteada, si no `orca`.

set -euo pipefail

ORCA="${ORCA_CLI_COMMAND:-orca}"

if ! command -v "$ORCA" >/dev/null 2>&1; then
  echo "Error: no se encontró el ejecutable '$ORCA'. Instala/abre Orca o define ORCA_CLI_COMMAND." >&2
  exit 1
fi

if ! "$ORCA" status --json >/dev/null 2>&1; then
  echo "Error: '$ORCA status' falló — ¿está la app de Orca abierta?" >&2
  exit 1
fi

SLUG="${1:-}"
WORKTREE_SELECTOR="active"
TITLE="agile-story"

if [[ -n "$SLUG" ]]; then
  echo "Creando worktree '$SLUG'..."
  CREATE_JSON=$("$ORCA" worktree create --name "$SLUG" --parent-worktree active --setup skip --json)
  WORKTREE_ID=$(echo "$CREATE_JSON" | jq -r '.result.worktree.id')
  WORKTREE_PATH=$(echo "$CREATE_JSON" | jq -r '.result.worktree.path')

  if [[ -z "$WORKTREE_ID" || "$WORKTREE_ID" == "null" ]]; then
    echo "Error: no se pudo crear el worktree. Respuesta:" >&2
    echo "$CREATE_JSON" >&2
    exit 1
  fi

  echo "Worktree creado en $WORKTREE_PATH — instalando dependencias..."
  (cd "$WORKTREE_PATH" && pnpm install --frozen-lockfile)

  WORKTREE_SELECTOR="id:$WORKTREE_ID"
  TITLE="$SLUG"
fi

echo "Abriendo terminal con pnpm agent:story..."
TERMINAL_JSON=$("$ORCA" terminal create --worktree "$WORKTREE_SELECTOR" --command "pnpm agent:story" --title "$TITLE" --json)
HANDLE=$(echo "$TERMINAL_JSON" | jq -r '.result.terminal.handle // .result.handle // empty')

if [[ -z "$HANDLE" ]]; then
  echo "Error: no se obtuvo el handle de la terminal. Respuesta:" >&2
  echo "$TERMINAL_JSON" >&2
  exit 1
fi

echo "Esperando a que OMP termine de cargar..."
WAIT_JSON=$("$ORCA" terminal wait --terminal "$HANDLE" --for tui-idle --timeout-ms 60000 --json)
SATISFIED=$(echo "$WAIT_JSON" | jq -r '.result.wait.satisfied // .result.satisfied // false')

if [[ "$SATISFIED" != "true" ]]; then
  echo "Aviso: OMP no confirmó estar listo a tiempo (60s). No se escribió el borrador para evitar mandarlo a medio cargar." >&2
  echo "Terminal: $HANDLE — revísala y corre a mano si hace falta." >&2
  exit 1
fi

echo "Escribiendo '/agile-story ' en el input (sin enviar)..."
"$ORCA" terminal send --terminal "$HANDLE" --text "/agile-story " --json >/dev/null

echo "Listo. Completa la historia en la terminal '$TITLE' y da Enter."
