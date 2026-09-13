# Aceptación funcional en navegador — dark-mode

Sesión apply del pipeline OpenSpec/Orca. Worktree
`/Users/hectorreyes/orca/workspaces/portfolio-hector-creative/dark-mode`, rama `dark-mode`.
Servidor: `pnpm preview` (build estático de `dist/`) en `127.0.0.1:4399`, puerto libre asignado.

- Navegador: Chrome/150.0.7871.24 (Chromium headless controlado con CDP/Puppeteer).
- Viewport base: 1440×900; responsive: 320, 375, 768, 1440 × 760; zoom 200% emulado como
  layout de 720 px CSS con `deviceScaleFactor: 2`.
- Emulación: `prefers-color-scheme`, `prefers-reduced-motion`, storage bloqueado/fallón,
  `matchMedia` ausente/fallón/malformado, JavaScript deshabilitado, bundle retrasado por
  interceptor de peticiones y `@supports not (backdrop-filter)` reproducido con sus
  propias declaraciones.
- Artefactos: `acceptance-resolution.json`, `acceptance-interaction.json`,
  `acceptance-responsive.json`, `acceptance-fallback.json`, `acceptance-reduced-motion.json`,
  `contrast.json` y `screens/`.

## 1. Resolución inicial y tolerancia a fallos (`acceptance-resolution.json`)

| Escenario | SO | Resultado real |
| --- | --- | --- |
| Sin storage | dark | `dark`, sin escritura (`keys: ""`) |
| Sin storage | light | `light`, sin escritura |
| `theme=dark` | light | `dark` (la preferencia guardada manda) |
| `theme=light` | dark | `light` |
| `theme=""`, `DARK`, `system`, `"dark"` (JSON) | dark | `dark` por SO; el valor inválido no se reescribe y `otra` queda intacta |
| `localStorage` lanza `SecurityError` | dark | `dark`, página operable, sin excepciones |
| `localStorage.getItem` lanza | dark | `dark`, sin excepciones |
| `matchMedia` ausente | dark | `light`, botón visible y operable |
| `matchMedia` lanza | dark | `light`, botón visible y operable |
| `matchMedia` devuelve objeto sin `matches` booleano | dark | `light`, botón visible y operable |

Clases excluyentes (`html.light`/`html.dark`), `color-scheme` calculado al tema, un solo
`meta[name="theme-color"]` sincronizado y `aria-pressed` coherente en los trece escenarios.
`errors: []` (sin errores de página) en toda la matriz.

Límite observado y preexistente: si `window.matchMedia` no existe o lanza, el bundle
compartido aborta en `initCaseWindow`/`initSpotlight` (que ya usaban `matchMedia` antes de
este cambio), así que **experimentos, ventana de caso y demás features del bundle quedan
inertes**. El control de tema sí queda operativo porque `initThemeSwitcher()` se invoca
primero en el script de `src/pages/index.astro`, de modo que el tema no depende
de la salud de las demás features. No se tocaron esas features por estar fuera del plan.

## 2. Seguimiento del SO, elección manual y persistencia

- Sin elección manual, el tema sigue al SO en ambos sentidos (`light → dark → light`) y no
  escribe preferencia (`keys: ""`).
- Con `theme=system` (inválido) el sitio sigue al SO, lo que confirma que un valor inválido
  no se convierte en elección manual.
- Tras alternar manualmente, los cambios de SO posteriores no reemplazan el tema, ni
  siquiera cuando el evento compite con la activación.
- Con `theme=dark` guardado y SO claro, alternar el SO en ambos sentidos mantiene `dark`.
- Ida y vuelta con recarga: `light → clic → dark` guarda `dark`; recarga conserva `dark`;
  siguiente clic muestra y guarda `light`.
- Escritura rechazada (`Storage.prototype.setItem` lanza): la elección permanece visible y
  operable, el SO posterior no la revierte, y una recarga vuelve a resolver con el
  almacenamiento realmente disponible (`light` con SO claro). No se promete persistencia.

## 3. Primer pintado con bundle retrasado (`acceptance-interaction.json`)

Peticiones `/_astro/*.js` retrasadas 4 s; muestreo por `requestAnimationFrame` en el mundo
principal (200 muestras por escenario, hasta que el bundle se enlaza).

| Preferencia guardada | SO | Clases observadas | Fondos pintados | `theme-color` | Bundle enlazado durante el muestreo |
| --- | --- | --- | --- | --- | --- |
| `dark` | light | solo `dark` | solo `rgb(2, 6, 23)` | solo `#020617` | `false` |
| `light` | dark | solo `light` | solo `rgb(249, 249, 249)` | solo `#F9F9F9` | `false` |

Filmstrip (`screens/FP1-*`, `screens/FP2-*`): el primer frame con contenido ya es oscuro en
FP1 y claro en FP2; ningún frame muestra el tema opuesto. El primer frame de FP2 es un frame
vacío previo al pintado (negro del compositor), no el tema oscuro.

Sin JavaScript (`screens/no-js.png`): `<html lang="es-MX">` sin clase de tema (fallback claro
por CSS), un `theme-color` `#F9F9F9` y el botón presente con `hidden` — no se presenta un
control inerte.

## 4. Control accesible e independencia

- `Tab` desde el último enlace del dock enfoca el botón (orden de tabulación correcto);
  `Enter` y `Espacio` alternan exactamente una vez cada uno, conservan el foco, no navegan
  y no desplazan la página (`scrollY` 1500 antes y después).
- Árbol de accesibilidad: `role=button`, nombre estable «Modo oscuro», `focusable=true`,
  `pressed=false` en claro y `pressed=true` en oscuro; el icono es decorativo (`aria-hidden`).
- Reinicialización: se volvió a ejecutar el bundle con caché invalidada; un clic posterior
  alterna una sola vez (sin listeners duplicados) y `aria-pressed` sigue sincronizado.
- Navegación: alternar el tema no cambia `aria-current` ni `is-active` de los enlaces, y
  navegar entre secciones no cambia el tema; el botón nunca recibe estado de sección.
- Switch de experimentos: activarlo no cambia el tema, alternar el tema no cambia
  `aria-checked`, y volver a activarlo deja el tema intacto (independencia bidireccional).
- Ventana de caso: con `#/caso/ikni` abierta se mantienen `has-window`, `overflow: hidden`
  del documento, foco en el título y contenido; al alternar el tema cambia la paleta
  (`rgb(226,232,240)` → `rgb(32,32,32)`) sin perder `has-window`, foco ni bloqueo; `Tab`
  desde el botón entra a la ventana (`windowClose`); al cerrar se restaura el foco al
  disparador y se libera el scroll.
- Bloqueo de scroll medido con entrada real (rueda y `PageDown`): 1700 → 1700 con la ventana
  abierta y también tras cambiar el tema; tras cerrar, la rueda vuelve a desplazar (2400).

## 5. Movimiento reducido (`acceptance-reduced-motion.json`)

`prefers-reduced-motion: reduce`: el muestreo por frame durante la alternancia registra solo
dos fondos (`rgb(249,249,249)` y `rgb(2,6,23)`) y dos clases (`light`, `dark`), sin valores
intermedios; `document.documentElement.getAnimations()` es 0 tras asentar; `motion.css` fija
`transition-duration: 0.01ms` y la alternancia funciona con teclado y puntero sin perder foco.
En movimiento normal, `html` y `body` no tienen transición (0s) ni animación, de modo que no
hay animación global del cambio de tema.

## 6. Contraste medido sobre píxeles pintados (`contrast.json`)

Método: captura del recuadro del elemento en Chromium; fondo efectivo = mediana de los
píxeles que no coinciden con el color de texto calculado (incluye vidrio y gradientes);
controles por muestreo puntual; ratio WCAG 2.x sobre luminancia relativa. Umbrales: 4.5 texto
normal, 3 texto grande e indicadores/controles necesarios.

- Claro: 42 mediciones, 0 por debajo del umbral. Extremos: cuerpo 15.48, secundario 5.62,
  cuerpo de tarjeta 7.78, botón acento 5.52 (blanco sobre `#00747f`), dock activo 5.52,
  badge sobre gradiente 12.39, anillo de foco 5.24, perilla/pista del switch 3.44/3.13.
- Oscuro: 42 mediciones, 0 por debajo del umbral. Extremos: botón acento y dock activo 11.16
  (`#020617` sobre `#22d3ee`), secundario sobre vidrio 6.6-7.4, etiqueta `qa__label` 7.14,
  perilla inactiva vs pista 4.74, pista activa vs stage 8.09, anillo de foco ≈10.5.
- Estados hover, pressed, foco, sección activa, ventana abierta, vidrio del dock, cabecera y
  cuerpo de la ventana y badges sobre gradientes medidos en ambos temas.
- Ajuste por medición: la pista inactiva del switch pasó de `#d9d9d9` (1.41:1 contra la
  perilla blanca y 1.09:1 contra el fondo del stage) a `#8a8a8e` en claro y `#6b7c93` en
  oscuro, porque el umbral de 3:1 para el estado del control no se cumplía.
- Informativo (sin umbral WCAG): la cabecera de la ventana no se distingue por color del
  cuerpo (1.04 claro, 1.13 oscuro); la separación sigue apoyada en el borde y la sombra, como
  en el diseño previo. El cuerpo de la ventana contrasta 1.25 contra el scrim en oscuro.

## 7. Responsive y zoom (`acceptance-responsive.json`, `screens/`)

En ambos temas y en 320, 375, 768 y 1440 px, con las cinco secciones activadas por scroll
real: el dock queda dentro del viewport, el control mide 48×48 px (≥44×44), no hay overflow
horizontal (`scrollWidth === innerWidth`), el contenido del footer no queda tapado por el
dock y los nombres accesibles se conservan («Trabajo», «Proyectos», «Servicios»,
«Experimentos», «Contacto», «Modo oscuro»). En el breakpoint compacto (≤430 px) la etiqueta
del enlace activo se colapsa visualmente y el nombre accesible permanece en el árbol.
Zoom 200% (layout 720 px, DPR 2): sin overflow horizontal, dock dentro del viewport,
control de 48×48.

## 8. Fallback sin backdrop-filter (`acceptance-fallback.json`)

`@supports not` se corrigió de orden en `src/styles/portfolio/dock-window.css`: en el CSS
compilado el bloque queda después de las reglas base de `.dock`, `.scrim` y `.window`, que
antes lo pisaban. Verificación: se inyectaron como reglas activas las declaraciones de esa
rama (mismos tokens `--app-glass-*-solid`), ya que el navegador sí soporta `backdrop-filter`.
Resultado: dock `rgba(13,20,36,.97)`, ventana `#0d1424` y scrim `rgba(2,6,23,.9)` en oscuro
—sin superficies blancas—, con contraste 7.21 (ítems del dock) y 13.1 (texto de ventana);
en claro 5.87 y 16.29. Capturas `screens/*-noblur.png`.

## 9. Límites declarados

- La rama sin `backdrop-filter` se reprodujo inyectando sus declaraciones; no se desactivó el
  soporte real del navegador.
- El filmstrip se capturó con screencast de CDP; el primer frame puede ser un frame vacío
  previo al primer pintado (documentado arriba).
- La medición de contraste usa el color calculado del texto y píxeles pintados reales; no
  modela antialiasing ni corrección de gamma del sistema operativo.
- `pnpm check`/`pnpm build` no verifican interacción ni apariencia: eso lo cubre este informe.
