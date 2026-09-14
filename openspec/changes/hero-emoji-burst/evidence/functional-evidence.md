# Evidencia funcional — hero-emoji-burst (apply)

- **Change:** `hero-emoji-burst`
- **Plan aprobado:** `cf02b62bfe401b9b63b71754f25aae1c573c14a1fe34c58efae12d1c6fdfab62` (`review.json`)
- **Fecha:** 2026-09-13
- **Build validada:** `pnpm build` sobre el worktree `hero-emoji-burst`
- **Servidor:** `astro preview` en `http://127.0.0.1:4332` (build estático)
- **Navegador:** Chromium en modo headless administrado por Orca (Chromium 140+, sin emulación de tecnologías asistivas reales)
- **Entorno:** la pestaña inicia como "hidden"; se activó con `Emulation.setFocusEmulationEnabled` + `Page.setWebLifecycleState(active)` para que las Web Animations progresaran. Sin esa activación el reloj del documento queda congelado y ninguna animación avanza (limitación del entorno headless, no del código).

> Nota metodológica: el harness evalúa JavaScript en un mundo aislado respecto de la página; los parches de prototipo hechos desde ese mundo no afectan al mundo principal (esto explica hallazgos aparentemente contradictorios al aislar `Element.prototype.animate`). Los parches al mundo principal se hicieron inyectando un `<script>` inline en el DOM. Los eventos de puntero/toque se despacharon como `PointerEvent` con `pointerType` real cuando la entrada física resultó impracticable (el transporte de ratón/CDP tarda ~5 s por evento); "mouse real" y "teclado real" sí se ejecutaron con `page.mouse`/`page.keyboard`.

## 1. Geometría y stacking

Medición de `getBoundingClientRect()` de `.hero-portrait`, `.hero-portrait__trigger` y `.hero-portrait__image` (caja exterior, borde incluido):

| Viewport | portrait | trigger | image |
|---|---|---|---|
| 320 px | 90 × 90 | 90 × 90 | 90 × 90 |
| 390 px | 90 × 90 | 90 × 90 | 90 × 90 |
| 767 px | 90 × 90 | 90 × 90 | 90 × 90 |
| 768 px | 120 × 120 | 120 × 120 | 120 × 120 |
| 1280 px | 120 × 120 | 120 × 120 | 120 × 120 |

- Stacking: `layer` `z-index: 0`, `trigger` `z-index: 1`, wrapper `overflow: visible` e `isolation: isolate`. `elementFromPoint` en el centro de la capa devuelve `hero-portrait__image`.
- Capa: `pointer-events: none`, `aria-hidden="true"`; partículas no enfocables.
- Estabilidad: rects de nombre, bio y CTA idénticos antes / durante / después de una ráfaga (1280 × 900).
- `scrollWidth === innerWidth` en 320, 390, 767, 768 y 1280 durante la ráfaga (sin scroll horizontal).

## 2. Una ráfaga por acción (mouse, click, reentrada, rápidas)

Conteo por `MutationObserver` sobre `[data-hero-emoji-layer]` (nodos añadidos) y `.hero-portrait__particle`:

| Escenario | Nodos añadidos | Partículas |
|---|---|---|
| Entrada de hover (mouse real `page.mouse.move`) | +12 | 12 |
| Permanencia > 1.6 s y movimiento interno | +0 | 0 tras limpieza |
| Click de mouse con hover presente | +0 | — |
| Salida + reentrada | +12 | 12 |
| 10 reentradas rápidas | máximo 12 simultáneas, +120 acumuladas | 0 tras 1.7 s |
| Total de emisiones observadas | 12 × 12 = 144 nodos | — |

Una activación = 12 nodos; sin dobles emisiones por eventos de compatibilidad.

## 3. Parámetros aleatorios y conjunto de emojis

- Unión de 40 ráfagas consecutivas: **20/20** miembros exactos del conjunto permitido, incluida `🇲🇽` sin fragmentar y los glifos con selector de variación (`🏗️`, `🏘️`, `🗂️`, `⚙️`).
- Rango observado por partícula (muestra de una ráfaga): tamaño 18.7–31.9 px; duración 941–1375 ms; retraso 38–155 ms; rotación inicial −29.2°…+27.6°; desplazamiento lateral y ascenso distintos por partícula; origen dentro de ±10 % del diámetro.

## 4. Oclusión, crecimiento y desaparición

- A 60 ms de la emisión: **12/12** centros de partícula dentro del rect de la foto y `elementFromPoint` central = `hero-portrait__image` (origen ocluido, opacidad inicial 0, escala 0.2).
- A ~560 ms: **12/12** partículas por encima del borde superior de la foto (ascenso).
- Limpieza: 0 partículas a los ~1550 ms y sin animaciones residuales (`document.getAnimations()` vacío tras reduce).
- Capturas secuenciales: `desktop-light-start.png`, `desktop-light-mid.png`, `desktop-light-end.png`, `desktop-light-rest.png` (origen oculto → ascenso → desaparición).

## 5. Teclado y semántica

- Secuencia de Tab: `skip-link` → `hero-portrait__trigger` (button) → CTA → tarjetas.
- Control: `role=button` (nativo), `aria-label="Mostrar emojis sobre la fotografía de Héctor Reyes"`, `tabIndex=0`.
- Foco visible: `:focus-visible` → `outline: solid 2px rgb(0, 116, 127)` (token `--accent`), foco retenido tras Enter, Espacio y tecla sostenida.
- Enter (real): +12 nodos (una ráfaga). Espacio (real): +12. `window.scrollY` = 0 antes y después de Espacio.
- Tecla sostenida: 6 `keydown` con `repeat=true` → `defaultPrevented=true` en los 6; el ciclo real down/up produjo una única emisión.
- Activación tipo tecnología asistiva (`click` con `detail=0`): +12 en una emisión.
- Capa `aria-hidden`; partículas sin `tabIndex` y fuera del árbol anunciado.

## 6. Touch y límites responsive

- Mobile 390 × 844 (touch): tap → 12 nodos (una ráfaga); segundo tap → +12; `scrollWidth == innerWidth`.
- Touch scroll iniciado sobre la foto (CDP `Input.dispatchTouchEvent` start/move×4/end): 0 emisiones y página desplazada a 318 px (scroll normal conservado).
- 320 px: foto 90 × 90, sin overflow horizontal durante la ráfaga (`mobile-320-mid.png`).
- 767 px = 90; 768 px = 120.

## 7. Reduced motion

- Reduce inicial (emulación `prefers-reduced-motion: reduce`, desktop y mobile): hover/tap/click/Enter → **0 nodos**, capa `display: none`, foto 120 × 120 y foco intactos (`desktop-reduce-rest.png`).
- Cambio dinámico: con una ráfaga activa, pasar a reduce elimina las partículas de inmediato (0 nodos, 0 animaciones). Volver a no-preference **no** autoemite; la siguiente activación vuelve a funcionar (+12).
- El controlador cancela y limpia explícitamente; el CSS de la capa añade protección adicional.

## 8. Mejora progresiva

- Sin JavaScript: foto presente con `alt`, 120 × 120, CTA "Ver proyectos", nombre y capa vacía; 0 partículas.
- Sin API de animación (parche al mundo principal `Element.prototype.animate = undefined` vía script inline): activaciones → **0 nodos**, foto 120 × 120 y CTA intactos, sin errores de consola.
- Sin errores de consola en ninguna corrida (`console.error` / `pageerror` vacíos).

## 9. Tema

- Claro: Hero intacto fuera del retrato. Oscuro: `window.__portfolioTheme.toggle()` → `html.dark`, ráfaga y foto correctas (`desktop-dark-mid.png`, `desktop-dark-rest.png`), sin cambios en el tema.

## Limitaciones declaradas

- No se ejecutaron lector de pantalla ni tecnología asistiva real: la verificación de accesibilidad es por árbol accesible/rol/nombre y activación `detail=0`, no por AT física.
- El dispositivo híbrido no pudo emularse variando la media query `(hover: hover)` (el harness no soporta `Emulation.setMediaFeatures` para `hover`). Se cubrió por rutas separadas: con hover real (desktop) un tap táctil emite una ráfaga y el click de mouse no duplica; sin hover (mobile) el click emite y el `pointerenter` táctil se ignora.
- El auto-repeat de teclado del sistema operativo no es generable vía CDP; se simuló con `keydown` `repeat=true` sobre la ruta nativa.
- La ráfaga se verificó en Chromium; la variación de glifos entre SO/fuentes queda fuera de alcance (riesgo ya documentado en `design.md`).
