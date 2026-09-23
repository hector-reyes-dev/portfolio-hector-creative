# Tareas — design-md (DESIGN.md del portafolio)

**Objetivo:** escribir `DESIGN.md` en la raíz siguiendo la especificación oficial de Google
(`google-labs-code/design.md`, versión `alpha`) y verificarlo con el linter oficial
`npx @google/design.md lint`.

**Convención elegida por el usuario:** documentación y herramientas de Google para archivos
DESIGN.md (spec + CLI `@google/design.md`). Idioma del documento: español (convención del
proyecto); encabezados y nombres de token en inglés (son estructura parseada por la spec).

## Tareas

- [x] 1. Investigar la especificación y la herramienta de Google para DESIGN.md
- [x] 2. Extraer los tokens de diseño reales de `src/styles/**`
- [x] 3. Escribir `DESIGN.md` en la raíz (frontmatter YAML + secciones `##` en orden canónico)
- [x] 4. Verificar con el linter oficial de Google vía `gentle-ai-verify` — PASS (0 errores)
- [x] 5. Corregir hallazgos y re-verificar (meta: 0 errores)
  - Corregido: bloque yaml `motion` duplicado en la sección Motion (warning eliminado).
  - Corregido: añadida la variante real `button-primary-dark-pressed` que el linter detectó como gap (orphan `primary-dark-pressed` resuelto).
  - Aceptados y justificados: warnings asesorios `orphaned-tokens` sobre roles de página (canvas, ink-muted, body-text, border + equivalentes `*-dark`) que no son componentes, y `token-like-ignored` sobre `motion` (extensión documentada por Google en PHILOSOPHY.md; los exports la ignoran por diseño).
  - Criterio de fallo de Google = errores (exit code 1); el archivo queda en exit code 0.
- [ ] 6. Reportar resultados y ofrecer commit (rama feature; el árbol de trabajo tiene cambios ajenos sin confirmar)

## Evidencia

- Ronda 1 (`npx @google/design.md lint DESIGN.md`): exit 0, **0 errores**, 1 warning — `Section 'motion' is defined in both frontmatter and code block 1`. Corregido: eliminado el bloque yaml duplicado de la sección Motion.
- Ronda 2: exit 0, 0 errores, 10 warnings — 9 `orphaned-tokens` + 1 `token-like-ignored` (`motion`). Corregido el gap real: añadido componente `button-primary-dark-pressed` → el orphan de `primary-dark-pressed` desapareció.
- Ronda 3 (final): exit 0, **0 errores**, 9 warnings, 1 info. `summary: {errors: 0, warnings: 9, infos: 1}`. Secciones en orden canónico verificadas: Overview (194), Colors (212), Typography (241), Layout (258), Elevation & Depth (276), Shapes (295), Components (307), Motion (325), Do's and Don'ts (339). Frontmatter `---` intacto (líneas 1 y 191).
- Warnings aceptados con justificación: 8 `orphaned-tokens` sobre roles de página (canvas, ink-muted, body-text, border + equivalentes `*-dark`) que son reales en CSS pero no son componentes, y 1 `token-like-ignored` sobre `motion` (extensión documentada por Google en PHILOSOPHY.md; los exports la ignoran por diseño). Criterio de fallo de Google = errores; el archivo pasa.
- Fuentes de la convención: spec oficial `github.com/google-labs-code/design.md` (`docs/spec.md`, `README.md`, `PHILOSOPHY.md`) y CLI `@google/design.md`.
- Pendiente del usuario: commit (no ejecutado; el árbol tiene cambios ajenos sin confirmar).
