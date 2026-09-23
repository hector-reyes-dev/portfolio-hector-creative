# Evidencia de validación en navegador — hero-name-image-hover

Matriz de evidencia de la Unidad D (tarea 8). Todo lo registrado aquí distingue explícitamente entre
**observado en primera persona**, **observado por el parent** (navegador real de Orca, registrado, no
re-verificado íntegro), **sintético** (instrumentación etiquetada) y **no verificado**. Nada de lo no
observado se reclama como verificado; la suite determinista no sustituye evidencia de navegador.

Entorno: navegador integrado de Orca (pestaña activa del worktree, `browserPageId`
`e6791c9c-2c6a-4f15-aaab-e06d7c1b3deb`), URL `http://localhost:4321/` contra el servidor dev
**ya existente** (escucha en localhost/IPv6; NO se detuvo, reinició ni relanzó — la tarea pedía
`pnpm dev -- --host 127.0.0.1`, pero un segundo intento en 127.0.0.1 falló y no era necesario).
Viewport real del navegador durante toda la verificación: **856×1221 CSS px**, que NO es
1280/768/390/320. Comandos usados (interfaz documentada de `orca`): `tab list`, `snapshot`,
`hover`, `click`, `eval`, `console`. Fecha de verificación: sesión de apply de tareas 7–10.

## Matriz resumida

| # | Ítem de la tarea 8 | Estado | Detalle |
|---|---|---|---|
| 1 | Árbol accesible: un único `h1`, nombre «Héctor Reyes», cero tiles anunciados | **verified** (observado) | Snapshot Orca: un solo heading level 1 «Héctor Reyes»; tiles nunca anunciados (letras visibles como StaticText; slot 08 aparece como `generic > StaticText "y"` por sus tiles lazy, sin contenido de tile anunciado) |
| 2 | `textContent` y nombre accesible exactos, sin duplicación | **verified** (observado) | `textContent === "Héctor Reyes"`; `aria-label === "Héctor Reyes"`; sin `aria-labelledby` (eval en reposo y durante hover activo) |
| 3 | Hover real de letra con tile superpuesto, sin reflow | **verified — parcial por glifo** (observado; solo slot 08) | Hover real de puntero Orca sobre el h1 activa exactamente 1 letra (slot 08), `data-active-variant` sorteado, ambos tiles `aria-hidden="true"`, exactamente una opacidad computada `1` y la otra `0`, `scrollWidth 841 === clientWidth 841`. Solo slot 08 recibió hover real; los otros 10 glifos **not verified** en navegador |
| 4 | Ambas variantes por letra en activaciones repetidas | **verified — parcial** (observado parent + esta sesión, solo slot 08) | Slot 08 mostró variante 0 (tema claro, parent) y variante 1 (temas claro y oscuro, parent y esta sesión). El resto de letras y la estadística «diez activaciones» **not verified** en navegador |
| 5 | Salida con demora visible ~180 ms | **verified** (observado; instrumentación sintética etiquetada) | Parent: 182.8 ms (una salida real). Esta sesión: movimiento real de puntero (`hover` → `hover` a otro elemento) con listeners/observer sintéticos: `pointerleave` 655183.5 ms → retiro de `data-active` 655364.8 ms = **181.3 ms**. Ambos consistentes con el objetivo de 180 ms |
| 6 | Reentrada durante la demora sin parpadeo de texto | **not verified** | Ninguna reentrada real durante la demora fue observada en navegador (solo cubierta por el test determinista) |
| 7 | bio/CTA/cajas estables, `scrollWidth <= clientWidth` | **verified — solo a 856px; visual (emulado) en otros anchos** | `scrollWidth === clientWidth` (841) en reposo y con tile activo, en ambos temas. A 1280/768/390/320: **observación visual** Chrome (parent, 2026-09-23) — título en una línea sin recorte aparente — sin métricas DOM extraídas → **partial** en esos anchos (ver sección Chrome) |
| 8 | Touch 390/320: taps/scroll sin tile ni letra pegada, nombre a 40px | **not verified** | La interfaz documentada del navegador de Orca no expone emulación táctil/viewport; no se usó el emulador ni se inventaron comandos. **Chrome (parent, 2026-09-23):** a 390/320 el título aparece en una línea, pero es emulación de viewport únicamente — sin entrada táctil ni hardware probados, y el 40px **no** es una métrica computada → el criterio táctil del ítem sigue **not verified** (ver sección Chrome) |
| 9 | 200 % de zoom | **not verified** | Sin control de zoom en la interfaz documentada; no observado |
| 10 | Copia exacta del nombre | **partial** | El texto DOM/copiable es exacto «Héctor Reyes» (nodos de texto preservados, verificado por eval y por `navigation-semantics.test.ts`), pero la acción real de portapapeles (Ctrl/Cmd+C) **no fue ejercida** |
| 11 | Sin tab stops nuevos | **partial** | DOM verificado: 0 letras con `tabindex`/`role`, 0 focusables, h1 sin `tabindex`/`role`; snapshot sin destinos nuevos. El recorrido real con Tab **no se realizó** |
| 12 | reduce activo al cargar y cambio dinámico con tile visible | **not verified** | La preferencia del navegador no se puede fijar/cambiar con la interfaz documentada; no observado (solo cubierto por tests deterministas con `matchMedia` stub) |
| 13 | Tema claro/oscuro con hover | **verified — parcial** | Hover real y contraste medidos en **ambos** temas (oscuro nativo de la sesión + claro vía toggle real y restitución exacta del estado oscuro). Solo slot 08; el toggle se dejó en su estado original (`dark`, `aria-pressed="true"`, localStorage `dark`) |
| 14 | Frontera 767/768 px | **partial — visual (emulado)** | Viewport fijo 856×1221 en Orca; no verificable con esa interfaz. **Chrome (parent, 2026-09-23):** capturas a 767 y 768 (DevTools Responsive, viewport emulado) muestran visualmente la transición de tamaño del heading; sin métrica computada de `font-size` ni de ancho → frontera observada solo visualmente (ver sección Chrome) |
| 15 | Sin errores de consola | **partial** (state at check) | `orca console --limit 50`: 16 mensajes, **todos debug de vite** (connecting/connected/hot-updated), 0 errores y 0 warnings en el momento de la verificación. No se reclama cobertura continua de la sesión. **Chrome (parent, 2026-09-23):** DevTools muestra **404s preexistentes de imágenes de proyectos** (`ikni-project.webp` —repetido—, `acabados-integrales-project.webp`, `blog-backend-image.webp`, `food-mood-project.webp`, `landing-ofera/ofera-1.webp`, `pin-estelar-project.webp`); SyntaxErrors previos de intentos de expresión en consola fueron limpiados antes del reload y los 404s persistieron tras él → **no se reporta consola limpia**; los 404s son recursos ajenos a este cambio (ver sección Chrome) |

## Medidas de primera persona (eval sobre la página viva)

| Medida | Valor observado |
|---|---|
| `h1.textContent` | `"Héctor Reyes"` (exacto, en reposo y con tile activo) |
| `aria-label` / `aria-labelledby` | `"Héctor Reyes"` / ausente |
| Letras / slots | 11; `00`–`10` (H é c t o r · R e y e s) |
| Tiles por letra tras hover previo | solo slot 08: 2 (lazy); resto 0 |
| `letter-spacing` / `line-height` / `font-size` | `-1.96px` (= −.035em × 56px, tracking heredado) / `54.88px` / `56px` (estilo desktop) |
| `white-space` del h1 | `normal` (sin `nowrap` forzado; el espacio conserva el punto de salto) |
| Coordenada y de las 11 letras | idéntica (una sola línea renderizada) |
| Opacidades computadas de los 2 tiles (hover activo) | exactamente una `1`, la otra `0` |
| `scrollWidth` / `clientWidth` | 841 / 841 (sin overflow horizontal) |
| `window.innerWidth` × `innerHeight` | 856 × 1221 (no es 1280/768/390/320) |
| Contraste activo, tema oscuro (slot 08, variante 1) | superficie `rgb(30,41,59)` / marca `rgb(226,232,240)` → **11.87:1** |
| Contraste activo, tema claro (slot 08, variante 1) | superficie `rgb(244,244,245)` / marca `rgb(32,32,32)` → **14.82:1** |
| Demora de restauración (salida real) | **181.3 ms** (parent: 182.8 ms; objetivo 180 ms) |

## Evidencia del parent registrada (navegador real de Orca, no re-verificada íntegro)

- Retiro demorado de una salida real: **182.8 ms** (instrumentado; una sola salida, sin reentrada).
- Slot 08 mostró la variante 0 (tema claro) y la variante 1 (tema oscuro); la variante oscura
  renderiza una franja diagonal visible. Las capturas usadas para esa revisión visual fueron
  temporales del parent y **no** se persisten aquí como evidencia.
- Medición de kerning antes/después del split (estilo desktop 56px): rango de texto plano
  341.05px vs run partido ~343.6px (**~2.6px más ancho**, ~0.8 %), con caja de contenido de 520px,
  una línea renderizada y sin overflow. Cambio modesto; sin corrección CSS justificada (tarea 7).
- Matriz de contraste completa (umbral WCAG texto 4.5:1), todos los pares marca/superficie de la
  tabla de `design.md`: tema claro — accent/accent-soft 4.86, accent/fill 5.02, accent/bg-soft
  5.24, ink/fill 14.82, ink/accent-soft 14.35, ink/bg-soft 15.48; tema oscuro — 7.40, 8.09, 10.87,
  11.87, 10.84, 15.93. Todos ≥ 4.5:1 en ambos temas. Los spot-checks de primera persona (11.87
  oscuro, 14.82 claro) coinciden exactamente con esta matriz.

## Chrome DevTools Responsive (parent, 2026-09-23) — viewport emulado, no dispositivo real

Registro adicional del parent contra el mismo servidor dev ya en ejecución (`http://localhost:4321/`),
usando **DevTools Responsive de Chrome** (emulación de viewport CSS, **no** un dispositivo real):
se fijó el campo width, se pulsó Return y se inspeccionaron visualmente capturas a **1280, 768,
767, 390 y 320 CSS px**.

- **Observación visual** (no métrica DOM): en todos los anchos el título completo «Héctor Reyes»
  apareció en una sola línea, sin recorte horizontal aparente.
- 767/768: las capturas muestran **visualmente** la transición de tamaño del heading propia del
  breakpoint; **no** se extrajo métrica computada de `font-size` ni `scrollWidth` (los intentos de
  expresión en consola no produjeron métricas).
- 390/320: evidencia de **emulación de viewport únicamente**; no se probó entrada táctil ni
  comportamiento de hardware, y el valor 40px **no** es una métrica computada.
- Consola Chrome: **404s preexistentes de imágenes de proyectos** (`ikni-project.webp` —repetido—,
  `acabados-integrales-project.webp`, `blog-backend-image.webp`, `food-mood-project.webp`,
  `landing-ofera/ofera-1.webp`, `pin-estelar-project.webp`); **no se reporta consola limpia**.
  Unos SyntaxErrors previos de intentos de expresión en consola fueron limpiados antes del reload;
  tras el reload los 404s persistieron. Los 404s son recursos de proyectos ajenos a este cambio.
- Sin cambios de estado por esta sección en: hover de las once letras, ambas variantes por letra,
  reentrada durante la demora, reduce (carga/cambio dinámico), zoom 200 %, portapapeles, recorrido
  Tab y métricas DOM — permanecen **partial / not verified** según la matriz de arriba.
- La evidencia previa del navegador de Orca (856×1221, primera persona) permanece sin cambios.

## Sintético etiquetado

- Único uso sintético: instrumentación de timestamps para medir la demora de restauración
  (listeners `pointerenter`/`pointerleave` + `MutationObserver` sobre `data-active`). Los
  movimientos de puntero fueron **reales** (comandos `hover` de Orca). No se dispararon eventos de
  activación sintéticos (`dispatchEvent`/`elementFromPoint` forjados) en ningún punto.

## Limitaciones honestas de esta matriz

1. **Viewport**: toda la evidencia de primera persona se recogió a 856×1221; la interfaz documentada del navegador
   integrado de Orca no expone redimensionamiento de viewport, emulación de dispositivo, zoom ni
   fijación de `prefers-reduced-motion`. Los ítems que dependen de esos controles quedan
   **not verified**; no se emularon inventando comandos. Excepción parcial y etiquetada: las
   comprobaciones **Chrome DevTools Responsive del parent (2026-09-23, sección propia arriba)**
   aportan observación visual a 1280/768/767/390/320 con viewport emulado; solo matizan las filas
   7, 8, 14 y 15 como se anota en cada fila, sin métricas DOM, entrada táctil ni hardware.
2. **Cobertura de glifos**: solo slot 08 recibió hover real de puntero; no se reclama el hover de
   las once letras ni ambas variantes por letra en navegador.
3. **Servidor**: evidencia contra el servidor dev ya en ejecución en `http://localhost:4321/`
   (localhost/IPv6); no se lanzó la variante `--host 127.0.0.1` de la tarea porque un segundo
   arranque en 127.0.0.1 falló y el servidor existente ya servía la página.
4. La suite determinista (`hero-name-hover.test.ts`, 16 tests) cubre en jsdom reentrada, reduce,
   touch/pen y cleanup, pero **no sustituye** esta evidencia de navegador; los ítems
   correspondientes del navegador permanecen con su estado de arriba.
