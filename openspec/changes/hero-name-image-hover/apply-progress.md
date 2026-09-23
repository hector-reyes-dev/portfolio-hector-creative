# Apply Progress — hero-name-image-hover

Progreso acumulativo por unidad de trabajo. Estrategia de entrega: `feature-branch-chain` (PR1=Unidad A, PR2=Unidad B, PR3=Unidades C+D), elegida por el humano. Este archivo nunca sobrescribe trabajo previo.

## Unidad A — Contrato de markup y módulo SSR-safe (PR 1) — COMPLETA

### Tareas completadas (checkboxes persistidos en tasks.md)

- [x] **Tarea 1** — `src/lib/core/hero-name-hover.ts` creado: esqueleto no-op SSR-safe, exporta `initHeroNameHover(): () => void`. Nada accede a `document`/`window` al importar; sin `matchMedia` (o sin DOM) retorna un cleanup inocuo e idempotente. Patrón efímero de `hero-emoji-burst.ts`; sin estado persistente.
- [x] **Tarea 2** — `src/features/hero-name-hover.test.ts` creado: primer escenario SSR-safety con `@vitest-environment node` (patrón `ssr-safety.test.ts`): importa el módulo, invoca `initHeroNameHover()` y su cleanup dos veces sin DOM sin lanzar.
- [x] **Tarea 3** — `src/components/organisms/Hero.astro` modificado: lista local estática de 11 registros `{ slot, glyph }` (slots 00–10: H é c t o r · R e y e s; clave estable de dos dígitos, no el glifo), seis primeros spans `.hero__name-letter` con `data-hero-name-letter` + `data-slot`, un espacio real como nodo de texto (`{' '}`, no margen CSS ni `&nbsp;`), cinco spans restantes, `data-hero-name` en el h1, y `<script>` procesado que importa e invoca `initHeroNameHover()` (patrón `HeroPortrait.astro`, sin modificar esa molecule). El efecto permanece visualmente inactivo (spans inline sin CSS nuevo).

### Archivos cambiados (Unidad A)

| Archivo | Acción |
|---|---|
| `src/lib/core/hero-name-hover.ts` | Nuevo (esqueleto no-op SSR-safe). |
| `src/features/hero-name-hover.test.ts` | Nuevo (test node SSR-safety). |
| `src/components/organisms/Hero.astro` | Modificado (split en 11 spans + espacio real + script inicializador). |
| `src/features/projects/navigation-semantics.test.ts` | Ver abajo: corrección quirúrgica del helper `compact()` (sin tocar aserciones). |

### Comandos ejecutados y resultados reales

- `pnpm test src/features/hero-name-hover.test.ts` → **1 passed** (archivo enfocado).
- `pnpm test src/features/projects/navigation-semantics.test.ts` → **11 passed**, incluida la aserción intacta `text: 'Héctor Reyes'` del h1.
- `pnpm test` (suite completa) → **12 files / 120 tests passed** (verificación de que nada más se afectó).
- `pnpm check` → **0 errors, 0 warnings** (33 hints preexistentes, ninguno en los archivos de este cambio).
- Nota de invocación: `pnpm test -- <archivo>` no filtra en este proyecto (pnpm ejecuta la suite completa); los archivos enfocados se ejecutaron con `pnpm test <archivo>`, y el resultado verde de la suite completa cubre ambas formas.

### Evidencia de nodos childNodes (contrato de la tarea 3)

Sonda temporal (astro/container, luego eliminada) sobre el HTML renderizado confirmó: h1 con 11 nodos elemento (letras, `data-slot` 00–10) + 1 nodo texto (`" "` exacto, nodeType 3) entre los grupos de spans; `h1.textContent` === `"Héctor Reyes"` exacto, sin whitespace extra entre letras. El HTML compilado contiene `</span> <span` — un único espacio ASCII entre palabras.

### Desviación de design.md (documentada, requiere visibilidad en review)

**Corrección del helper `compact()` en `src/features/projects/navigation-semantics.test.ts`.** El HTML renderizado cumple el contrato del diseño (nodo de texto real del espacio), pero el propio arnés del test destruía ese espacio antes de extraer el texto: `compact()` hacía `html.replace(/>\s+</g, '><')`, que elimina TODO whitespace entre etiquetas — incluido el espacio semántico del h1 — produciendo `HéctorReyes` y fallando la aserción con el markup correcto. Sonda sobre la página completa: 58 puntos de whitespace inter-etiqueta en el HTML renderizado; exactamente 1 (el espacio del h1) carece de salto de línea. Corrección: `compact()` ahora colapsa solo whitespace que contiene salto de línea (`/>\s*\n\s*</` → `'><'`), preservando nodos de espacio puro; el resto de la página compacta byte-idéntico. **Ninguna aserción (`expect`) fue modificada ni relajada**; la aserción `text: 'Héctor Reyes'` permanece intacta y ahora verifica realmente el contrato del espacio. Suite completa en verde confirma cero radio de impacto. Alternativa descartada: mover el espacio dentro de un span de letra violaría el markup explícito del design.md y la geometría de tiles de la Unidad C.

### Tareas restantes

Actualizado tras completar la Unidad B (ver abajo); quedan las unidades C y D:

Actualizado tras completar la tarea 6 de la Unidad C (ver abajo); quedan:

```text
- [ ] 7. Comparar visualmente el nombre antes/después del split… (Unidad C)
- [ ] 8. Con `pnpm dev -- --host 127.0.0.1`, registrar la matriz de evidencia… (Unidad D)
- [ ] 9. Ejecutar `pnpm agent:test`… (Unidad D)
- [ ] 10. Antes de delivery, medir líneas cambiadas… (Unidad D)
```

### Límite de PR / workload (Unidad A)

Unidad A completa = **PR 1** de la cadena `feature-branch-chain`. Líneas cambiadas de esta unidad (~4 archivos): módulo 32, test 20, Hero.astro +26, navigation-semantics compact +6 ≈ **~84 líneas**, muy por debajo del presupuesto de 400. Sin commit/push/PR: requiere autorización humana explícita (tarea 10). Rama actual: `docs/design-md`.

### Decisión de rama (humana)

Se intentó crear una rama tracker limpia desde `main`, pero Git rechazó el cambio de rama porque `Hero.astro` y `navigation-semantics.test.ts` tienen cambios sin commit. El intento abortó sin alterar el árbol. El usuario eligió continuar en `docs/design-md` y aceptó que sus dos commits previos (documentación/diseño y homologación de navegación) formen parte de la base de la futura cadena. No se hizo stash, reset ni cambio de rama. PR1 continúa siendo la Slice A planeada; la publicación/creación efectiva de PRs permanece pendiente de autorización explícita.

### Estado nativo consumido (Unidad A)

`gentle-ai.sdd-status` v2: `nextRecommended=apply`, `applyState=ready`, `actionContext.mode=repo-local`, workspaceRoot = raíz canónica del proyecto; 0/10 tareas al inicio. Nota informativa de edit-root `/` para una unidad futura: no aplica a esta unidad.

## Unidad B — Controller completo con pruebas deterministas (PR 2) — COMPLETA

### Tareas completadas (checkboxes persistidos en tasks.md)

- [x] **Tarea 4** — `src/lib/core/hero-name-hover.ts`: controller por raíz con `WeakMap<HTMLElement, Controller>` (segunda llamada no agrega listeners y devuelve el mismo cleanup compartido); raíz incompleta (≠ 11 letras) = no-op sin listeners parciales; `pointerenter` válido solo con `pointerType === 'mouse'` + `'(hover: hover) and (pointer: fine)'` activo + `'(prefers-reduced-motion: reduce)'` inactivo; tiles perezosos (dos `<span class="hero__name-tile" data-variant="0|1" aria-hidden="true">` vacíos con `pointer-events`/`user-select` inline, hijos de la letra, texto nunca reemplazado); sorteo `Math.floor(Math.random() * 2)` por activación con `data-active`/`data-active-variant`; `pointerleave` de letra activa programa un único `setTimeout` de 180 ms que solo retira `data-active` al expirar; reentrada cancela el timer sin frame de texto; handlers `change` de ambas MediaQueryList retiran timers/atributos/tiles de inmediato (recuperación sin autoactivación); cleanup idempotente (timers, listeners de las once letras, media queries, tiles, WeakMap) con reinit posterior; sin delegación global de `pointerenter`, intervalos ni dependencias externas.
- [x] **Tarea 5** — `src/features/hero-name-hover.test.ts`: suite jsdom determinista de 16 tests con fake timers y `matchMedia` controlado (patrón de `complexity-contracts.test.ts`): SSR sin DOM (via `vi.stubGlobal`, ver desviación) y sin `matchMedia`; raíz incompleta sin listeners parciales; init repetido = un listener por enter/leave y mismo cleanup (`toBe`) con una suscripción por media query; sorteo forzado con `Math.random` en 0 y 0.999999 (ambas variantes en la misma letra, una consulta al azar por activación, sin falsear independencia); once slots con dos tiles vacíos tras su primera activación y `textContent` del h1 exactamente `Héctor Reyes`; timers 179/180 ms con restauración al expirar; reentrada en demora cancela el timer sin frame de texto y nueva salida reprograma delay completo; letras distintas con temporizadores independientes (t=180/t=280); reduce al cargar, cambio dinámico a reduce durante la demora (retiro inmediato sin avanzar relojes) y recuperación sin autoactivar; pérdida y recuperación de hover fino; `pointerType` touch/pen en híbrido (el mouse sí); cleanup idempotente (listeners removidos una vez por tipo, cero suscripciones a media queries, tiles/atributos retirados, timer pendiente cancelado) y reinit sin duplicados (una consulta al azar por activación, dos tiles por letra).

### Aserción de nombre accesible (nota de review independiente)

La suite afirma explícitamente que el nombre accesible del `h1` proviene solo de su texto: `root.textContent === 'Héctor Reyes'` y ausencia de `aria-label`/`aria-labelledby` (sin etiqueta duplicada, conforme al design). jsdom no expone árbol de accesibilidad: el riesgo de anuncio letra-a-letra de los spans no es verificable aquí y permanece para la evidencia con lector de pantalla de la Unidad D.

### Archivos cambiados (Unidad B)

| Archivo | Acción |
|---|---|
| `src/lib/core/hero-name-hover.ts` | Reescrito: del esqueleto no-op (32 líneas) al controller completo (185 líneas). |
| `src/features/hero-name-hover.test.ts` | Ampliado: del test SSR único (20 líneas) a la suite determinista de 16 tests (497 líneas). |
| `openspec/changes/hero-name-image-hover/tasks.md` | Checkboxes de tareas 4 y 5 marcados `[x]`. |

Sin cambios a Hero markup, CSS, otros tests, rama, commits o PRs (límite de la slice respetado).

### Comandos ejecutados y resultados reales (Unidad B)

- `pnpm test src/features/hero-name-hover.test.ts` → **16 passed** (archivo enfocado; forma de invocación de la Unidad A).
- `pnpm test -- src/features/hero-name-hover.test.ts src/features/projects/navigation-semantics.test.ts src/features/projects/portfolio-consistency.test.ts` → **suite completa: 12 files / 135 tests passed** (pnpm no filtra en este proyecto — igual que en la Unidad A —; los tres archivos objetivo están incluidos y en verde, incluida la aserción intacta `text: 'Héctor Reyes'` de `navigation-semantics.test.ts`).
- `pnpm check` → **0 errors, 0 warnings** (33 hints preexistentes, ninguno en los archivos de este cambio).
- `pnpm check:boundaries` → **sin violaciones** (435 módulos, 997 dependencias).

### Decisiones de implementación (Unidad B)

- `data-active` es de presencia/ausencia (valor vacío) para el selector CSS `[data-active]` de la Unidad C; al expirar el delay solo se retira `data-active` (el fade de vuelta cruza 150 ms vía CSS); el retiro por deshabilitación/limpieza quita también `data-active-variant` ("retirar selección" del design).
- `handleLeave` no filtra por `pointerType`: solo letras con tile activo programan timer, y ningún evento táctil puede activar tiles, por lo que un leave inválido es un no-op.
- Los tiles fijan `pointer-events: none` / `user-select: none` inline para ser inertes incluso antes del CSS de la Unidad C.
- El cleanup compartido (`teardownAll`) es una función estable: `init()` repetido devuelve la misma referencia y destruye todos los controllers vivos de forma idempotente, permitiendo reinit posterior.

### Desviación de design.md (documentada)

**Escenario SSR simulado con `vi.stubGlobal` en archivo jsdom.** El docblock `@vitest-environment` es por archivo; para mantener la tarea 5 en el mismo archivo (según design, "Ampliar `src/features/hero-name-hover.test.ts`"), el escenario de la Unidad A se preservó anulando `document`/`window` con `vi.stubGlobal` dentro de un archivo jsdom. La semántica es equivalente para el módulo (lee `typeof document`/`typeof window`/`typeof window.matchMedia` en el momento de la llamada): importa, invoca y limpia dos veces sin DOM sin lanzar. Se añadió además un caso "sin `matchMedia`" (window presente, `matchMedia` ausente) previsto por el design. Ninguna aserción de la Unidad A fue relajada.

### Límite de PR / workload (Unidad B)

Líneas authored de la unidad: **~682** (módulo 185 + test 497), por encima del presupuesto de 400 para PR 2. No se comprimió ni recortó documentación, harness o escenarios requeridos por tasks.md. La causa: la suite determinista exige fixture del h1 (11 letras + espacio textual), control de `matchMedia`, helpers de eventos y encabezados Given/When/Then del estilo del proyecto, además de los escenarios exigidos por la tarea 5. El usuario aceptó explícitamente `size:exception` para PR 2 / Unidad B únicamente; no extiende la excepción a PR 3. El conteo exacto de diff lines (adiciones + eliminaciones) se medirá antes de delivery; la excepción no autoriza commit, push ni PR.

### Verificación independiente (Unidad B)

El agente `gentle-ai-verify` repitió en modo lectura y confirmó PASS: `pnpm test src/features/hero-name-hover.test.ts` (16/16), `pnpm test -- src/features/hero-name-hover.test.ts src/features/projects/navigation-semantics.test.ts src/features/projects/portfolio-consistency.test.ts` (suite completa 12 files / 135 tests), `pnpm check` (EXIT=0, 0 errors / 0 warnings / 33 pre-existing hints) y `pnpm check:boundaries` (EXIT=0, 435 módulos / 997 dependencias, sin violaciones). `git status` antes/después idéntico. Huecos menores: falta test de import realmente sin DOM, assert explícito de ausencia de tabindex/role, reinit en raíz DOM nueva y sorteo distinto en reentrada; Screen Reader no validable por jsdom y queda pendiente en Slice D.

### Decisión de workload (humana)

El usuario aceptó `size:exception` para PR 2 / Unidad B (~682 authored lines) únicamente. PR 1 y PR 3 mantienen presupuesto estándar; si PR 3 supera 400, pausar y pedir nueva decisión. Conteo de diff lines exacto sigue pendiente. Se conserva `feature-branch-chain` con `docs/design-md` como rama tracker, aceptada por el usuario aun con dos commits previos ajenos. Sin stash, cambio de rama, commit, push ni apertura de PR.

### Estado nativo consumido (Unidad B)

`gentle-ai.sdd-status` v2: `nextRecommended=apply`, `applyState=ready`, 5/10 tareas, `actionContext.mode=repo-local` con `allowedEditRoots` = raíz canónica del proyecto; los archivos de esta unidad están dentro del alcance. La nota previa de edit-root `/` se resolvió en `tasks.md` marcando el URL futuro como read-only; el estado fresco volvió a `apply` sin notas ni bloqueos.

## Unidad C — Estilos por tokens con salvaguardas (PR 3) — EN PROGRESO (tarea 6 completa)

### Tareas completadas (checkboxes persistidos en tasks.md)

- [x] **Tarea 6** — `src/styles/portfolio/hero.css`: bloque del efecto añadido tras `.hero__cta` y salvaguardas al final del archivo. `.hero__name-letter` con `display: inline-block; position: relative; vertical-align: baseline` + `transition: color .15s var(--ease-out)`; `[data-active]` fija `color: transparent` conservando caja y texto. `.hero__name-tile`: `position: absolute; inset: 0; overflow: hidden; border-radius: var(--r-sm)` (caja/recorte locales, sin padding ni ancho extra), `background: var(--tile-surface, transparent)`, `opacity: 0`, `transition: opacity .15s var(--ease-out)`, `pointer-events: none`, `user-select: none`. Tile seleccionado vía `.hero__name-letter[data-active][data-active-variant="0|1"] > .hero__name-tile[data-variant="0|1"] { opacity: 1 }` (cruce 0→1/1→0 en 150 ms); el delay de 180 ms vive solo en el JS, sin nueva duración de transición. Marca geométrica vía `::after { background: var(--tile-mark, transparent) }`: variante 0 marca centrada redondeada (círculo `.3em`, `border-radius: 50%`) y variante 1 franja diagonal (`width: 150%; height: .18em; rotate(-45deg)`) recortada por el `overflow` de la caja; dimensiones en `em`/proporción limitadas por `inset`, escalan 56→40 px. Matriz explícita de 22 reglas `[data-slot="NN"] > .hero__name-tile[data-variant="0|1"]` fijando `--tile-surface`/`--tile-mark` exactamente según la tabla de `design.md`, solo con `--accent`, `--accent-soft`, `--fill`, `--ink`, `--bg-soft`. Comentario de cabecera con el contrato de imágenes futuras (`public/assets/hero-name/NN-V.webp`, URL `/assets/hero-name/NN-V.webp` read-only, cambiar solo las 22 reglas visuales). Salvaguardas `@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)`: tiles `display: none` y letra (con y sin `[data-active]`) a `color: inherit; transition: none`. Cero reglas `:hover` de activación.

### Archivos cambiados (tarea 6)

| Archivo | Acción |
|---|---|
| `src/styles/portfolio/hero.css` | Modificado: +97 líneas (bloque del efecto + matriz 22 + salvaguardas), 0 eliminaciones. |
| `openspec/changes/hero-name-image-hover/tasks.md` | Checkbox de tarea 6 marcado `[x]`. |

Ningún otro archivo fuente tocado (límite de la slice respetado); ODD tracking (`odd/tasks/`) es propiedad del parent y no se modificó.

### Comandos ejecutados y resultados reales (tarea 6)

- `pnpm build` (único comando autorizado para la tarea) → **verde**: `1 page(s) built in 520ms`, `Complete!`; solo warnings preexistentes de glob-loader de contenido (`src/content/{projects,experiments,packages,components,resources}` sin `*.md`), no relacionados con este cambio.
- Verificación del bundle generado `dist/_astro/index.BjVxVeiy.css`: **22** ocurrencias de selectores `data-slot="00"…"10"`, **22** asignaciones `--tile-surface:var(--accent-soft|fill|bg-soft)`, selectores `[data-active][data-active-variant]` presentes, y los tres safeguards (`hover: none`, `pointer: coarse`, `prefers-reduced-motion: reduce`) presentes en el CSS compilado. `grep` de reglas `:hover` de activación: ninguna.

### Decisiones de implementación (tarea 6)

- Duración de transición escrita como literal `.15s` con `var(--ease-out)`, idéntica al patrón existente (`buttons.css`, `footer-cta.css`, `dock-window.css` usan `.15s var(--ease-out)`); `motion.css` no define variables de duración, por lo que no se introdujo ninguna nueva.
- Marca de variante 0 como círculo `.3em` (`border-radius: 50%`, forma estándar, no un token de radio nuevo); radio de contenedor únicamente `var(--r-sm)`.
- Safaguardas colocadas al final del archivo para que `color: inherit; transition: none` gane por orden de cascada al mismo valor de especificidad que `[data-active] { color: transparent }`.
- Sin `will-change`, sombras, gradientes, tokens ni dependencias nuevos.

### Límite de PR / workload (tarea 6)

Slice C (tarea 6): **+97 / −0 líneas** en `hero.css`. PR 3 acumulado (C+D): 97 líneas + Slice D pendiente (evidencia de navegador, tarea 9 `pnpm agent:test`, tarea 10 medición de diff) — muy por debajo del presupuesto de 400; **sin amenaza actual**, se re-medirá en la tarea 10 antes de delivery. `size:exception` NO solicitado ni inferido para PR 3 (la excepción aceptada cubre solo PR 2 / Unidad B). Sin commit, push, cambio de rama ni PR: rama `docs/design-md` intacta.

### Restricciones respetadas (tarea 6)

- Solo `src/styles/portfolio/hero.css` modificado; tokens, `motion.css`, `DESIGN.md`, markup, controller y tests intactos.
- Contrato JS respetado: tiles hijos de cada letra con `data-variant`, selección por `data-active`/`data-active-variant` en el span padre, texto del glifo nunca reemplazado, delay 180 ms exclusivamente en el JS.
- No se reclama verificación de navegador ni contraste de color: pertenecen a las tareas 7–10 (Unidad C/D).

### Tareas restantes

```text
- [ ] 7. Comparar visualmente el nombre antes/después del split… (Unidad C)
- [ ] 8. Con `pnpm dev -- --host 127.0.0.1`, registrar la matriz de evidencia… (Unidad D)
- [ ] 9. Ejecutar `pnpm agent:test`… (Unidad D)
- [ ] 10. Antes de delivery, medir líneas cambiadas… (Unidad D)
```

### Estado nativo consumido (tarea 6)

`gentle-ai.sdd-status` v2 (parent-provided, fresco): `nextRecommended=apply`, `applyState=ready`, 5/10 tareas al inicio de la slice, `actionContext.mode=repo-local`, workspaceRoot/allowedEditRoots = raíz canónica del proyecto (los archivos de esta unidad dentro del alcance), 0 blockedReasons, 0 notes.

## Corrección de nombre accesible observada en navegador (Unidad A, post tarea 6)

### Hechos observados vs inferencia

**Observado en el navegador integrado de Orca (`http://localhost:4321/`):** tras el split en spans
inline-block, el nombre accesible del h1 en el snapshot de accesibilidad era `H é c t o r R e y e s`
(letra a letra), no `Héctor Reyes`; `textContent` seguía siendo exactamente `Héctor Reyes`. Una sonda
runtime-only con `aria-label="Héctor Reyes"` (solo en la página del navegador, sin editar fuente)
cambió el nombre del h1 del snapshot a exactamente `Héctor Reyes` sin alterar `textContent`.
**Inferencia corregida:** la suposición del diseño —que los spans inline aplanan de forma natural a
un único nombre accesible— quedó refutada por la observación.

### Corrección de fuente aplicada (mínima, nivel markup)

- `src/components/organisms/Hero.astro`: el h1 ahora lleva `aria-label={heroName}` donde `heroName`
  se **deriva de la misma lista `nameLetters`** (`[slice(0,6).join(''), slice(6).join('')].join(' ')`
  = `Héctor Reyes`), no un literal aparte: el nombre accesible no puede divergir del texto servido.
  Coincide byte a byte con `textContent` (Label in Name, WCAG 2.5.3, satisfecho por coincidencia
  exacta); sin `aria-labelledby`, `sr-only`, `role`, `tabindex` ni texto oculto adicional no hay
  nombre duplicado ni paradas de teclado por letra. **Sin cambios a CSS/tokens/controller**: la
  corrección probó ser innecesaria en CSS (el nombre accesible es computo de nombre, no de estilo).

### Tests ajustados (corrección del contrato, no relajación)

- `src/features/projects/navigation-semantics.test.ts` (página real renderizada vía
  `astro/container`): el test «conserva un único h1…» ahora afirma el contrato explícito de nombre
  accesible sobre el h1 servido — `aria-label="Héctor Reyes"` presente, sin `aria-labelledby`, un
  único espacio textual entre palabras (`occurrences(h1, '</span> <span') === 1`), sin
  `tabindex`/`role` en las letras y cero tiles servidos en el HTML inicial. Las aserciones
  existentes (`text: 'Héctor Reyes'`, un único h1) quedan intactas; el helper `compact()` no se tocó.
- `src/features/hero-name-hover.test.ts`: el fixture `mountName()` espeja el markup real añadiendo
  el `aria-label` derivado de la misma lista; la aserción anterior «sin `aria-label`» (que codificaba
  la suposición refutada) se sustituye por el contrato explícito: `aria-label === 'Héctor Reyes'`,
  sin `aria-labelledby`, letras sin `tabindex`/`role`, y `textContent` exacto. Es una corrección a
  valor exacto, no una relajación.

### Artefactos de documentación actualizados

| Archivo | Acción |
|---|---|
| `openspec/changes/hero-name-image-hover/design.md` | Suposición refutada reemplazada por la corrección observada; ejemplo de markup con `aria-label` derivado; «duplicador» redefinido (prohibido solo si diverge del texto visible). |
| `openspec/changes/hero-name-image-hover/tasks.md` | Tarea 3 (ya `[x]`) documenta la corrección posterior observada; nueva Nota con hechos observados; tareas 7–10 sin marcar. |
| `odd/tasks/hero-name-image-hover.md` | Evidencia/progreso actualizada con la discrepancia observada y la corrección; slices 4–5 siguen sin marcar. |

### Comandos ejecutados y resultados reales

- `pnpm test src/features/hero-name-hover.test.ts src/features/projects/navigation-semantics.test.ts`
  → **2 files / 27 tests passed** (16 del controller + 11 de navegación; filtrado de archivos sí
  funcionó en esta invocación, a diferencia de lo reportado con la forma `pnpm test -- …`).
- `pnpm check` → **exit 0; 0 errors, 0 warnings, 33 hints preexistentes** (zod deprecations en
  `site-content.ts` y afines; ninguno en los archivos de este cambio).
- `pnpm test` (suite completa, aseguramiento adicional) → **12 files / 135 tests passed**.

### Estado de tareas y límite de PR

- Tareas SDD: 6/10 completas; **7–10 siguen `- [ ]`** (matriz de navegador/evidencia/delivery sin
  evidencia observada — no se marcaron).
- La corrección pertenece a la **Unidad A / PR 1** (markup): ~+10 líneas en `Hero.astro` y ~+25 en
  tests/doc de contrato. PR 1 sigue muy por debajo de 400. **PR 3 (C+D) no crece** por esta
  corrección (cero cambios de CSS); su presupuesto de 400 sin excepción se conserva y se re-medirá
  en la tarea 10.
- Sin commit, push, cambio de rama ni PR: rama `docs/design-md` intacta; requiere autorización
  humana explícita (tarea 10).

### Estado nativo consumido (esta corrección)

`gentle-ai.sdd-status` v2 (parent-provided, fresco): `nextRecommended=apply`, `applyState=ready`,
6/10 tareas, `actionContext.mode=repo-local` con workspaceRoot/allowedEditRoots = raíz canónica del
proyecto (los siete archivos editados dentro del alcance), 0 blockedReasons, 0 notes.

## Unidad C cerrada (tarea 7) y Unidad D (tareas 8–10): registro de sesión de apply

Sesión de continue para tareas 7–10 con el navegador integrado de Orca (petición explícita del
usuario). Nada de fuente/CSS tocado; solo artefactos de evidencia/progreso. El servidor dev
existente (`http://localhost:4321/`, localhost/IPv6) NO se detuvo ni reinició; un arranque
previo en 127.0.0.1 falló y no era necesario.

### Tarea 7 — COMPLETA (checkbox `[x]` persistido)

Comparación antes/después del split y revisión de contraste cerradas con medición real. Viewport
real de la sesión: **856×1221** (no 1280/768/390/320 — registrado honestamente; la interfaz
documentada del navegador de Orca no expone redimensionamiento de viewport ni emulación).

Observado en primera persona (`orca eval` sobre la página viva): `letter-spacing: -1.96px`
(= −.035em × 56px, tracking heredado intacto), `line-height: 54.88px`, `font-size: 56px`,
`white-space: normal` (sin `nowrap` forzado), las 11 letras comparten una misma coordenada y
(una sola línea), `scrollWidth === clientWidth` (841) y `textContent` exacto. Parent midió el
kerning: texto plano 341.05px vs run partido ~343.6px (**~2.6px / ~0.8% más ancho**) dentro de la
caja de 520px sin overflow: cambio modesto, **sin corrección CSS justificada** (cero ediciones a
hero.css en esta tarea; sin tocar tokens, `motion.css` ni `DESIGN.md`). Contraste marca/tile
revisado en ambos temas: matriz parent completa con los 6 pares por tema ≥ 4.5:1 (mínimo 4.86
claro / 7.40 oscuro) y spot-checks de primera persona coincidentes — oscuro slot 08 variante 1
superficie `rgb(30,41,59)` / marca `rgb(226,232,240)` → **11.87:1**; claro (vía toggle real,
restituido exactamente a oscuro) superficie `rgb(244,244,245)` / marca `rgb(32,32,32)` →
**14.82:1**.

### Tarea 8 — NO marcada; matriz de evidencia registrada en `evidence/browser-validation.md`

Archivo creado: `openspec/changes/hero-name-image-hover/evidence/browser-validation.md` con la
matriz `verified / partial / not verified` (15 ítems). Resumen honesto:

- **Verified (observado en primera persona):** un único h1 level 1 «Héctor Reyes» (snapshot Orca);
  `textContent`/`aria-label` exactos sin `aria-labelledby`; 11 slots 00–10; hover real de puntero
  con exactamente una letra activa (slot 08), tiles `aria-hidden="true"`, una opacidad 1 y otra 0,
  sin overflow; demora de restauración medida **181.3 ms** (parent: 182.8 ms) con movimiento real
  de puntero e instrumentación sintética etiquetada; hover y contraste en ambos temas; consola en
  el momento del check: 16 mensajes todos debug de vite, 0 errores/0 warnings.
- **Partial:** copia exacta (texto DOM/copiable verificado exacto; acción real de portapapeles no
  ejercida); sin tab stops nuevos (0 tabindex/role/focusables en letras y h1 por DOM/snapshot;
  recorrido real con Tab no realizado); «sin errores de consola» solo como estado en el momento.
- **Not verified (no se reclaman):** viewports 1280/768/390/320; hover de las once letras y ambas
  variantes por letra (solo slot 08 con hover real); reentrada durante la demora; touch 390/320
  con taps/scroll; zoom 200%; reduce al cargar/cambio dinámico; frontera 767/768; la interfaz
  documentada del navegador de Orca no expone esos controles y no se inventaron comandos ni se
  usó emulador.
- Las capturas temporales del parent NO se persistieron como evidencia; solo se registraron las
  mediciones numéricas.

### Tarea 9 — COMPLETA (checkbox `[x]` persistido)

- `pnpm agent:test` → **verde observado**: `pnpm check` exit 0 (73 files: **0 errors, 0 warnings,
  33 hints preexistentes**, ninguno en archivos de este cambio) y `pnpm build` verde
  (`1 page(s) built in 526ms`, `Complete!`; solo warnings preexistentes de glob-loader de
  contenido, sin `*.md`).
- Suite completa adicional `pnpm test` → **12 files / 135 tests passed**, incluidos
  `navigation-semantics.test.ts` y `portfolio-consistency.test.ts` verdes sin modificaciones a
  sus aserciones en esta sesión.

### Tarea 10 — NO marcada; medición conservadora read-only registrada

Medición conservadora de **PR3 (Unidades C+D, sin `size:exception`)** contra el árbol de trabajo
(git diff/numstat + conteo de archivos no rastreados, sin staging ni commits):

- Slice C: `src/styles/portfolio/hero.css` → **+97/−0**.
- Slice D (documentación/evidencia): `evidence/browser-validation.md` nuevo (89 líneas),
  adiciones a `apply-progress.md` (+113), ediciones de `tasks.md` (+4 neto) y `odd/tasks/` (+1).
- Total conservador medido PR3: **~304 líneas cambiadas** (< 400). Sin amenaza actual al presupuesto;
  no se solicitó ni infirió `size:exception` para PR3.

La tarea queda `- [ ]` porque el conteo exacto por slice contra la base requiere acciones de
delivery (staging por hunks: `hero-name-hover.ts` y `hero-name-hover.test.ts` mezclan las slices
A y B, y la base de la cadena sigue ambigua con los dos commits previos aceptados en
`docs/design-md`), y porque commits/push/PR requieren autorización humana explícita. Estado git
read-only observado: `Hero.astro` +39/−1, `navigation-semantics.test.ts` +23/−1, `hero.css`
+97/−0 (tracked); no rastreados: módulo 185 líneas, test 514, openspec del cambio (proposal 95,
design 107, spec 115, tasks 52, apply-progress 236→+, evidence nuevo), odd/tasks 37.

### Archivos cambiados (esta sesión, tareas 7–10)

| Archivo | Acción |
|---|---|
| `openspec/changes/hero-name-image-hover/evidence/browser-validation.md` | Nuevo: matriz de evidencia verified/partial/not-verified. |
| `openspec/changes/hero-name-image-hover/tasks.md` | Tareas 7 y 9 marcadas `[x]`; notas de cierre honestas añadidas. |
| `openspec/changes/hero-name-image-hover/apply-progress.md` | Esta sección acumulativa añadida (sin sobrescribir trabajo previo). |
| `odd/tasks/hero-name-image-hover.md` | Evidencia/progreso del tracker parent actualizado. |

Cero cambios a fuente/CSS/tests/commits/rama/servidor dev.

### Comandos ejecutados y resultados reales (esta sesión)

- Orca (documentados en `orca skills get orca-cli` + `references/browser.md`): `status --json`,
  `worktree current --json`, `tab list --json`, `snapshot --json`, `hover --element`,
  `click --element` (toggle de tema, restituido), `eval --expression` (medidas),
  `console --limit 50 --json`, `exec --command "help"` (→ `Unknown command: help`; confirma que
  la superficie documentada no expone viewport/emulación).
- `pnpm agent:test` → verde (detalle arriba). `pnpm test` → 12 files / 135 tests passed.
- Sin `pnpm dev`: el servidor existente quedó intacto.

### Estado nativo consumido (esta sesión)

`gentle-ai.sdd-status` v2 (parent-provided, fresco): `nextRecommended=apply`, `applyState=ready`,
taskProgress 6/10 al inicio, `artifactStore=openspec`, `actionContext.mode=repo-local` con
workspaceRoot/allowedEditRoots = raíz canónica del proyecto (los cuatro archivos editados dentro
de las superficies permitidas), 0 blockedReasons, 0 notes. Skills inyectados por el parent y
cargados antes del trabajo: `orca-cli` (+ `references/browser.md`) y `better-accessibility`.

### Tareas restantes

```text
- [ ] 8. Con `pnpm dev -- --host 127.0.0.1`, registrar la matriz de evidencia… (registrada parcial; mayoría de ítems not verified)
- [ ] 10. Antes de delivery, medir líneas cambiadas… (medición conservadora hecha; conteo exacto y autorización pendientes)
```

## Nota append-only (2026-09-23): evidencia Chrome DevTools Responsive del parent añadida a la matriz de la tarea 8

Registro acumulativo, sin sobrescribir trabajo previo. El parent realizó comprobaciones frescas en
Chrome contra el servidor dev ya existente (`http://localhost:4321/`) usando DevTools Responsive
(**viewport emulado, no un dispositivo real**): fijó el campo width, pulsó Return e inspeccionó
visualmente capturas a **1280, 768, 767, 390 y 320 CSS px**. Resultado registrado en
`evidence/browser-validation.md` (nueva sección fechada «Chrome DevTools Responsive (parent,
2026-09-23)» + adiciones precisas a las filas 7, 8, 14 y 15 de la matriz):

- Título completo «Héctor Reyes» en una línea, sin recorte horizontal aparente, en los cinco anchos
  — **observación visual**, no métrica DOM.
- 767/768: la transición de tamaño del heading es visible en las capturas; **sin** `font-size`
  computado ni `scrollWidth` extraídos (los intentos de expresión en consola no produjeron métricas)
  → fila 14 pasa a **partial — visual (emulado)**.
- 390/320: emulación de viewport únicamente; sin entrada táctil ni hardware probados; el 40px
  **no** es una métrica computada → fila 8 sigue **not verified** para el criterio táctil.
- Consola Chrome: **404s preexistentes de imágenes de proyectos** (`ikni-project.webp` repetido,
  `acabados-integrales-project.webp`, `blog-backend-image.webp`, `food-mood-project.webp`,
  `landing-ofera/ofera-1.webp`, `pin-estelar-project.webp`); unos SyntaxErrors previos de intentos
  de expresión en consola fueron limpiados antes del reload y los 404s persistieron tras él →
  **no se reporta consola limpia**; los 404s son recursos ajenos a este cambio.
- Sin cambios de estado: hover de las once letras, ambas variantes por letra, reentrada durante la
  demora, reduce, zoom 200 %, portapapeles, recorrido Tab y métricas DOM siguen **partial /
  not verified**. La evidencia previa de Orca (856×1221, primera persona) permanece sin cambios.

**Tarea 8 permanece `- [ ]`** (ningún checkbox tocado): la evidencia Chrome es visual y emulada, y
no cubre los criterios faltantes de la tarea. Sin cambios a fuente/tests/CSS/otros archivos; sin
tests ejecutados, commits, staging, push ni PRs. Archivos cambiados en esta nota: únicamente los
dos de las superficies permitidas de arriba.

## Decisión humana sobre commit local (2026-09-23)

El usuario autorizó **un único commit local agregado** con todos los cambios actuales del feature: implementación, tests, artefactos OpenSpec/evidencia, ODD tracker y la nueva tarea futura para las 22 imágenes. Esta decisión sustituye el empaquetado de commits por Slice A/B/C+D únicamente para este commit; no autoriza push, PR ni `size:exception` para una entrega futura. No se marcaron como completas las tareas SDD 8 ni 10; la matriz de navegador está incompleta y el conteo/base exactos para una eventual entrega siguen pendientes.
