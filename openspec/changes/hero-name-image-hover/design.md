# Diseño — hover letra→tile del nombre del Hero

## Decisión y alcance

El `h1.hero__name` conserva **un solo nombre accesible, «Héctor Reyes»**, aunque su texto se reparta entre once spans de letra y un nodo de texto real con el espacio. El efecto se limita al mouse con hover fino: dos tiles decorativos por letra, variante sorteada en cada entrada, superposición sin reflow y restauración cancelable tras 180 ms. Sin JS, en touch o con movimiento reducido, queda el nombre estático. Los tiles de color son el visual entregado; las imágenes reales son una sustitución posterior. No cambiar `HeroContent`, retrato, otros encabezados ni superficies animadas.

La frase del spec «un único nodo de texto accesible» se interpreta como **un único nombre accesible del único h1**, no un único `Text` DOM: ambas condiciones literales serían incompatibles con spans por carácter. La extracción del HTML quitando etiquetas y `h1.textContent` deben dar exactamente `Héctor Reyes`, incluyendo un solo espacio ASCII entre palabras y sin textos decorativos adicionales.

**Corrección observada en navegador real (Orca, `http://localhost:4321/`):** la suposición original de que los spans inline aplanan de forma natural a un único nombre era falsa. Con los spans `inline-block` por letra, el navegador calcula el nombre accesible del h1 letra a letra —`H é c t o r R e y e s`— aunque `textContent` siga siendo exactamente `Héctor Reyes`. Una sonda runtime-only con `aria-label="Héctor Reyes"` (sin tocar fuente) restauró el nombre exacto del h1 en el snapshot de accesibilidad sin alterar `textContent`. Corrección de fuente adoptada: el h1 lleva un `aria-label` explícito **derivado de la misma lista de letras** (no un literal aparte), byte a byte igual al texto visible, lo que satisface Label in Name (WCAG 2.5.3) por coincidencia exacta y evita la divergencia entre nombre y DOM.

## Contratos de marcado y datos

En `src/components/organisms/Hero.astro`, definir una lista local, estática y ordenada de once registros `{ slot, glyph }`; `slot` es una clave estable de dos dígitos y no el glifo (las dos `e` se distinguen). No derivar el título de `HeroContent`, ni partir una cadena Unicode en bytes. El contrato completo es:

| slot | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| glyph | H | é | c | t | o | r | R | e | y | e | s |

Renderizar los primeros seis spans, **un espacio real** (`{' '}` emitido como texto, no margen CSS ni `&nbsp;`), y los cinco spans restantes. Ejemplo estructural; comprobar el HTML compilado para que no se agregue whitespace de formato:

```astro
<h1 class="hero__name" data-hero-name aria-label={heroName}>
  {letters.slice(0, 6).map(({ slot, glyph }) => (
    <span class="hero__name-letter" data-hero-name-letter data-slot={slot}>{glyph}</span>
  ))}{' '}{letters.slice(6).map(({ slot, glyph }) => (
    <span class="hero__name-letter" data-hero-name-letter data-slot={slot}>{glyph}</span>
  ))}
</h1>
```

`heroName` se deriva de la misma lista de letras —`[letters.slice(0, 6).map(glyph).join(''), letters.slice(6).map(glyph).join('')].join(' ')`— para que el `aria-label` no pueda divergir del texto servido. Ejemplo:

```astro
const heroName = [
  letters.slice(0, 6).map(({ glyph }) => glyph).join(''),
  letters.slice(6).map(({ glyph }) => glyph).join('')
].join(' ');
```

El `<script>` procesado sigue el patrón de `HeroPortrait.astro`:

```astro
<script>
  import { initHeroNameHover } from '@lib/core/hero-name-hover';
  initHeroNameHover();
</script>
```

El ejemplo fija el contrato, no promete que el formateador de Astro conserve el espacio: probar **HTML renderizado** y nodos `childNodes`, no solo el fuente. Cada letra sigue siendo texto normal seleccionable. Sin `sr-only`, `role`, `tabindex`, botón ni control de teclado. El nombre accesible del h1 es el `aria-label` explícito derivado de la lista (corrección observada arriba): **no se considera «duplicador»** porque coincide byte a byte con el texto visible —un `aria-label` divergente del texto sí estaría prohibido—. Sin `aria-labelledby` ni texto oculto adicional no hay nombre duplicado. No insertar texto visible/oculto adicional al cambiar de estado. El script procesado sigue el patrón de `HeroPortrait.astro`, pero no modifica esa molecule ni reutiliza su botón.

Los tiles se crean **perezosamente en la primera activación permitida de cada letra**, no en SSR ni en carga con reduce: dos `<span class="hero__name-tile" data-variant="0|1" aria-hidden="true">` vacíos, hijos de la letra, con `pointer-events: none` y `user-select: none`. Así hay exactamente 2 variantes definidas por cada uno de los 11 slots (22 combinaciones), pero como máximo dos elementos decorativos por letra activada. El JS solo conmuta `data-active-variant="0|1"` y `data-active` en el span padre; **nunca reemplaza su nodo de texto**. Ambos tiles quedan invisibles en reposo. No `<img>` ni URL todavía.

## Estilo: 22 combinaciones explícitas, sin otro acento

Definir en `src/styles/portfolio/hero.css` una matriz de reglas para `[data-slot="NN"] > [data-variant="0|1"]`. Cada celda fija `--tile-surface` y `--tile-mark` usando exclusivamente roles ya definidos; esto permite diferenciar las 22 combinaciones sin duplicar lógica de eventos. La notación `superficie/marca` de la tabla se traduce a `background: var(--tile-surface)` y a una marca geométrica CSS sin contenido textual (`::after { background: var(--tile-mark) }`). Para variar el dibujo de las dos variantes, la 0 usa una marca centrada redondeada y la 1 una franja diagonal recortada dentro de la caja; radio `var(--r-sm)` en contenedor, sin sombras ni gradientes nuevos. La marca no es un segundo acento.

| Letra (slot) | variante 0: superficie/marca | variante 1: superficie/marca |
|---|---|---|
| H (00) | `--accent-soft` / `--accent` | `--fill` / `--ink` |
| é (01) | `--fill` / `--accent` | `--accent-soft` / `--ink` |
| c (02) | `--bg-soft` / `--accent` | `--fill` / `--accent` |
| t (03) | `--accent-soft` / `--ink` | `--bg-soft` / `--accent` |
| o (04) | `--fill` / `--ink` | `--accent-soft` / `--accent` |
| r (05) | `--bg-soft` / `--ink` | `--fill` / `--accent` |
| R (06) | `--accent-soft` / `--accent` | `--bg-soft` / `--ink` |
| e (07) | `--fill` / `--accent` | `--accent-soft` / `--ink` |
| y (08) | `--bg-soft` / `--accent` | `--fill` / `--ink` |
| e (09) | `--accent-soft` / `--ink` | `--bg-soft` / `--accent` |
| s (10) | `--fill` / `--ink` | `--accent-soft` / `--accent` |

La identidad de cada variante es **slot + índice**, no se exige que los 22 dibujos sean cromáticamente únicos. `--bg-soft`, `--fill`, `--ink`, `--accent` y `--accent-soft` ya cambian con tema claro/oscuro en `tokens.css` y `themes/`; no modificar tokens ni `DESIGN.md`. Revisar contraste de marca/tile en ambos temas. Nada de tonos hardcodeados, radios, sombras, timings o dependencias nuevos.

Cada `.hero__name-letter` ocupa solo el ancho tipográfico natural de su glifo (`display: inline-block; position: relative; vertical-align: baseline`); los hijos tile son `position: absolute; inset: 0`, caja y recorte locales sin padding, tamaño mínimo, transform externo ni ancho adicional. Dimensiones internas de la marca en `em`/proporción de la caja, limitadas por `inset`, para escalar 56px/40px sin generar overflow. Respetar el `letter-spacing` heredado (-.035em / -.03em ≤430px), line-height y salto entre palabras; separar spans puede perder kerning entre glifos, por lo que **comparar visualmente texto antes/después** y corregir solo si las medidas lo justifican, sin añadir spacing artificial ni alterar el tamaño del título. No forzar `white-space: nowrap` en todo el h1: el espacio original conserva el punto de salto. En estado activo, la letra conserva su texto accesible y su caja pero su tinta pasa a transparente; el tile seleccionado cruza su opacidad de 0 a 1, y el anterior de 1 a 0. Color/opacidad duran `feedback` 150ms con `var(--ease-out)`; el delay de 180ms es previo a la restauración, **no** una nueva duración de transición. No cambiar motion de otras superficies.

Bajo `(hover: none)`, `(pointer: coarse)` o `prefers-reduced-motion: reduce`, CSS fuerza las capas a invisibles y el texto al color heredado sin transición como respaldo frente a un cambio de media query antes del cleanup JS. No usar `:hover` para activar tiles, ya que un tap híbrido podría dejarlos pegados.

## Inicializador, interrupción y ciclo de vida

Crear `src/lib/core/hero-name-hover.ts`, exportando `initHeroNameHover(): () => void` (el script puede ignorar el retorno). Al importar, nada accede a `document`/`window`; al invocar en SSR o sin `matchMedia`, retornar un cleanup inocuo. Buscar `[data-hero-name]` y sus once letras; raíz incompleta = no-op, sin listeners parciales. Guardar estado por raíz con `WeakMap<HTMLElement, Controller>`: una segunda llamada no agrega listeners y devuelve el mismo cleanup. Cada controller posee sus pares de tiles creados, hasta once temporizadores de restore, listeners por letra y dos `MediaQueryList` con sus `change` handlers. No tocar el inicializador `hero-emoji-burst`; esta raíz no implica registros globales permanentes.

- Consultas: `'(hover: hover) and (pointer: fine)'` y `'(prefers-reduced-motion: reduce)'`. Solo entrar con `event.pointerType === 'mouse'`, hover fino activo y reduce inactivo. No click/touch/keyboard listeners. Para cada `pointerenter` válido, cancelar el timer de esa letra, crear sus dos tiles si aún no existen, seleccionar **una** variante mediante `Math.floor(Math.random() * 2)` y fijar `data-active`/`data-active-variant`. Selecciones independientes: no alternar obligatoriamente ni reutilizar un sorteo global.
- En `pointerleave` de una letra activa, programar `setTimeout(..., 180)` una sola vez. La letra/tile permanecen visibles durante esa espera. Al expirar, retirar `data-active`; la opacidad cruza de vuelta durante 150ms. Guardar el identificador por letra y anularlo en nueva entrada, deshabilitación o cleanup. Un enter antes de 180ms **no** quita `data-active` ni muestra texto entre variantes; solo cruza las opacidades de los dos tiles si el sorteo cambió. CSS puede revertir una transición en curso si se reentra después de expirar el timer, partiendo del valor actual.
- `change` a reduce o pérdida de hover fino: cancelar todos los timers, retirar `data-active`/selección, y retirar los tiles ya creados de cada letra de forma inmediata; la protección CSS de media query evita una transición intermedia. Volver a no-preference/hover fino no autoactiva ninguna letra aunque el mouse siga encima: esperar nuevo `pointerenter` válido.
- Cleanup: cancelar timers, retirar listeners de las once letras y ambos media queries, remover tiles/atributos efímeros y borrar la raíz del WeakMap; idempotente incluso si se llama dos veces, permitiendo reinit posterior en DOM nuevo/reemplazado. Si se incorpora navegación cliente en el futuro, llamar cleanup antes de desmontar la raíz; hoy no existe ClientRouter, por lo que no agregar hooks de navegación. El mismo reset inmediato cubre raíz retirada explícitamente.

No delegación global de `pointerenter` (no burbujea), intervalos ni dependencias externas. El estado no toca el texto de las letras, retrato, tema ni CTA.

## Contrato para imágenes posteriores

Cuando existan assets reales, conservar `data-slot` 00–10 y `data-variant` 0/1; proponer archivos estáticos `/public/assets/hero-name/00-0.webp` … `/public/assets/hero-name/10-1.webp` (URL `/assets/hero-name/NN-V.webp`). Cambiar **solo** las 22 reglas visuales de `hero.css` para usar `background-image: url(...)`, `background-size: cover`, `background-position: center` y conservar el tile absoluto recortado, dimensiones relativas/porcentaje y fallback de `--tile-surface`. No modificar markup, selección, timers ni listeners. Las URL se cargarán solo cuando se cree el tile de una letra activada; al hacerlo se crean sus dos variantes y el navegador podría pedir ambas: si se requiere cargar solo la seleccionada, introducir la URL al activar cada variante en esa entrega, sin cargar 22 imágenes al inicio. No añadir assets, pipeline `astro:assets` ni descarga anticipada en este cambio.

## Archivos, verificación y entrega

| Archivo | Acción prevista en apply |
|---|---|
| `src/components/organisms/Hero.astro` | Lista fija, spans + espacio literal, script procesado. |
| `src/lib/core/hero-name-hover.ts` (nuevo) | Controller por raíz, azar, gates, timers y cleanup. |
| `src/styles/portfolio/hero.css` | Caja superpuesta, matriz de 22 variantes, fades y salvaguardas media. |
| `src/features/hero-name-hover.test.ts` (nuevo) | Pruebas jsdom/SSR aisladas del controller, fake timers y media queries. |
| `src/features/projects/navigation-semantics.test.ts`, `portfolio-consistency.test.ts` | **Ejecutar sin relajar aserciones**; el primero comprueba un h1 y texto exacto. |
| `tokens.css`, `motion.css`, `DESIGN.md`, `HeroPortrait.astro`, `hero-emoji-burst.ts` | Solo referencia; sin cambios previstos. |

Pruebas del módulo: import en entorno node sin DOM e invocación no-op; init repetido = una selección/listener por enter; once slots con dos tiles vacíos cada uno después de su primera activación y `textContent` exacto; `Math.random` stub 0 y valor cercano a 1 para forzar 0/1 en la misma letra, reentrada sin frame de texto, múltiples letras con timers independientes; fake timers 179/180ms y fade; reduce al cargar/dinámico, pérdida y recuperación de hover, pointerType touch/pen en híbrido, cleanup repetido y reinit sin estados/listeners duplicados. El azar independiente **no garantiza matemáticamente** que diez activaciones reales muestren ambas variantes; el escenario del spec de «diez» se interpreta como comprobación observacional, mientras el test determinista fuerza los dos resultados sin falsear la independencia. Si se exige garantía absoluta de ambos en diez, habría que cambiar antes el spec porque contradice la selección independiente con `Math.random`.

Comandos de apply: `pnpm test -- src/features/hero-name-hover.test.ts src/features/projects/navigation-semantics.test.ts src/features/projects/portfolio-consistency.test.ts`, `pnpm check:boundaries`, `pnpm agent:test` (`pnpm check && pnpm build`); después `pnpm dev -- --host 127.0.0.1` y verificar en navegador real. Matriz/evidencia a registrar: desktop 1280 y 768px, hover de todas las letras incluido `é` y ambas `e` con cada una de sus variantes, salida 179/180ms y reentrada en demora, cajas del resto del Hero/bio/CTA estables y `scrollWidth <= clientWidth`; 390/320px touch con taps/scroll sin tile, título 40px; 200% zoom y copia exacta del nombre; árbol accesible (un h1, nombre único, cero tiles anunciados/tab stops); reduce activo al cargar y cambio dinámico con tile visible, recuperación sin autoactivar; tema claro/oscuro, 767/768px, sin errores de consola. La suite no sustituye esta evidencia de navegador.

Despliegue como cambio local al Hero tras revisión de artefactos: sin migraciones ni flag, fallback estático por defecto. Rollback: restaurar h1 plano y retirar import/script, módulo y bloque CSS/test del hover; verificar `pnpm agent:test` y que el nombre estático conserva accesibilidad y layout. Contar líneas antes de delivery: si supera o amenaza las 400 cambiadas, **pausar y preguntar** al humano por estrategia de cadena; no inferir `size:exception` ni crear PR/commit/publicar desde esta fase. Modelo global asignado: `openai-codex/gpt-6-sol`; sin routing local por proyecto.
