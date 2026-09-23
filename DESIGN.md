---
version: alpha
name: Hector Creative Portfolio
description: Sistema de diseño del portafolio creativo de Héctor — tokens normativos para claro y oscuro y la racional de su aplicación.
colors:
  primary: "#00747F"
  primary-hover: "#006873"
  primary-pressed: "#00535B"
  on-primary: "#FFFFFF"
  accent-soft: "#E6F3F4"
  canvas: "#F9F9F9"
  elevated: "#FFFFFF"
  fill: "#F4F4F5"
  ink: "#202020"
  ink-muted: "#646464"
  body-text: "#4F4F4F"
  border: "#EAEBEE"
  glass-window: "rgba(255, 255, 255, 0.72)"
  primary-dark: "#22D3EE"
  primary-dark-hover: "#67E8F9"
  primary-dark-pressed: "#0891B2"
  on-primary-dark: "#020617"
  accent-soft-dark: "#12333F"
  canvas-dark: "#050B1A"
  elevated-dark: "#0F172A"
  fill-dark: "#1E293B"
  ink-dark: "#E2E8F0"
  ink-muted-dark: "#94A3B8"
  body-text-dark: "#CBD5E1"
  border-dark: "#334155"
  glass-window-dark: "rgba(15, 23, 42, 0.82)"
typography:
  display:
    fontFamily: "Eudoxus Sans"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: "Eudoxus Sans"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.03em
  headline-md:
    fontFamily: "Eudoxus Sans"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.028em
  headline-sm:
    fontFamily: "Eudoxus Sans"
    fontSize: 25px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  title-md:
    fontFamily: "Eudoxus Sans"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.015em
  title-serif:
    fontFamily: "Iowan Old Style, Georgia, serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.01em
  body:
    fontFamily: "Iowan Old Style, Georgia, serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  lead:
    fontFamily: "Iowan Old Style, Georgia, serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Eudoxus Sans"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1
  caption:
    fontFamily: "Eudoxus Sans"
    fontSize: 12.5px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.04em
  button:
    fontFamily: "Eudoxus Sans"
    fontSize: 14.5px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.005em
  chip:
    fontFamily: "Eudoxus Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: 8px
  md: 12px
  tile: 14px
  lg: 16px
  xl: 20px
  2xl: 32px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 48px
  col: 520px
  wide: 69rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: 12px
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: 12px
    typography: "{typography.button}"
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary-dark}"
    rounded: "{rounded.full}"
    padding: 12px
    typography: "{typography.button}"
  button-primary-dark-hover:
    backgroundColor: "{colors.primary-dark-hover}"
  button-primary-dark-pressed:
    backgroundColor: "{colors.primary-dark-pressed}"
  chip:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 32px
    typography: "{typography.chip}"
  chip-dark:
    backgroundColor: "{colors.fill-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.full}"
    height: 32px
    typography: "{typography.chip}"
  card:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    typography: "{typography.title-serif}"
  card-dark:
    backgroundColor: "{colors.elevated-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.2xl}"
    typography: "{typography.title-serif}"
  icon-tile:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.tile}"
  icon-tile-dark:
    backgroundColor: "{colors.accent-soft-dark}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.tile}"
  case-window:
    backgroundColor: "{colors.glass-window}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  case-window-dark:
    backgroundColor: "{colors.glass-window-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.xl}"
motion:
  feedback: 150ms
  release: 180ms
  card-hover: 450ms
  easing-out: "cubic-bezier(.2, .8, .2, 1)"
  easing-in: "cubic-bezier(.4, 0, 1, 1)"
  easing-spring: "cubic-bezier(.34, 1.56, .64, 1)"
  easing-card: "cubic-bezier(.22, 1, .36, 1)"
---
# DESIGN.md — Portfolio Hector Creative

## Overview

El portafolio se concibe como **el escritorio de un estudio de diseño boutique**: una mesa de
trabajo digital, luminosa y ordenada, sobre la que se abren "ventanas de caso" de vidrio
esmerilado y un dock flotante da acceso a las secciones. La referencia no es una landing de
startup ni un portfolio-magazine; es el espacio de trabajo personal de un diseñador que enseña
su oficio con calma.

El público son clientes potenciales, reclutadores y colaboradores que evalúan criterio y oficio,
no volumen de efectos. La interfaz debe sentirse **precisa, serena y táctil**: profundidad sutil
(vidrio, sombras por capas), un solo acento que señala lo interactivo y nada estridente.

La voz combina dos registros: la **serif cursiva** firma (títulos de proyectos y notas) y la
**sans geométrica** ejecuta (titulares de sección, etiquetas, controles). El canvas es off-white
nunca blanco puro; el modo oscuro es azul noche profundo nunca negro puro. Si un elemento no
sabe qué color usar, hereda el rol del tema; si no sabe qué forma usar, pertenece a la escala de
radios del sistema.

## Colors

La paleta son neutros de alto contraste con **un único acento teal** como conductor de la
interacción. Los tokens `*-dark` son el intercambio completo del tema oscuro: cada rol claro se
sustituye por su contraparte oscura, nunca se re-mezcla a mano.

- **Primary (#00747F):** teal profundo y el único color que manda en interacción — botón de
  acento, foco visible, selección de texto y estados activos. Hover `#006873`, pressed `#00535B`.
- **On primary (#FFFFFF):** texto sobre acento; en oscuro el acento se invierte y su texto pasa a
  `#020617`.
- **Accent soft (#E6F3F4):** tinte de acento para fondos de icon-tile y selección; en oscuro es
  `#12333F`.
- **Canvas (#F9F9F9):** el off-white de página — más cálido que el blanco puro. Oscuro:
  `#050B1A`, azul noche.
- **Elevated (#FFFFFF):** tarjetas y superficies que se separan del canvas. Oscuro: `#0F172A`.
- **Fill (#F4F4F5):** relleno neutro de chips, botones secundarios y media de tarjeta. Oscuro:
  `#1E293B`.
- **Ink (#202020) / Ink muted (#646464) / Body text (#4F4F4F):** texto principal, metadata y
  prosa, en ese orden de jerarquía. Oscuro: `#E2E8F0`, `#94A3B8`, `#CBD5E1`.
- **Border (#EAEBEE):** filetes y bordes de tarjeta apenas visibles. Oscuro: `#334155`.
- **Glass window (rgba(255, 255, 255, 0.72)):** vidrio de la ventana de caso y el dock, siempre
  acompañado de backdrop-filter. Oscuro:
  `rgba(15, 23, 42, 0.82)` con variante sólida
  `#0d1424` cuando no hay backdrop-filter disponible.

El acento es escaso por diseño: una pantalla debería tener **una** acción teal. Los gradientes
solo viven en las miniaturas de proyecto (fondos de marca de cada caso), nunca en la chrome de la
interfaz.

## Typography

La estrategia es **dos familias locales, contraste editorial**. No se usa Google Fonts: ambas
se sirven desde el propio dominio.

- **Eudoxus Sans** (200–800, woff2 local) es la voz de ejecución: display del hero a 56px con
  tracking -0.035em, titulares de sección en peso 600 con tracking negativo (-0.02em a
  -0.03em), y toda la UI —botones 14.5px/500, chips 14px/500, etiquetas 13px/600, captions
  12.5px/600 con tracking 0.04em en versalitas de índice.
- **Iowan Old Style / Georgia (serif)** es la voz de firma: cuerpo de texto a 16px con interlínea
  1.7 para lectura cómoda, y los títulos de tarjeta y nota en **cursiva 18px** —el gesto
  editorial que identifica las piezas de autor.
- La jerarquía se construye con tamaño y tracking, no con peso extra: la interfaz opera en tres
  pesos (400 cuerpo, 500 controles, 600 titulares) aunque la familia cargue de 200 a 800.
- En móvil la escala display baja a 40px y el título de sección a 22px; la proporción entre
  niveles se conserva, no se aplana.

## Layout

El sitio es una **página única** con dos anchuras de contenido y ritmo vertical fluido:

- **Columna de lectura (`col`, 520px):** todo el contenido textual se centra en esta columna
  (`width: min(520px, 100% - 2 * gutter)`).
- **Superficie ancha (`wide`, 69rem):** reservada a superficies que necesitan imagen y datos
  juntos —solo la ventana de caso la usa—. Ninguna columna de lectura crece hasta aquí.
- **Gutter fluido:** `clamp(20px, 5vw, 48px)`; el token `gutter` registra su máximo.
- **Ritmo de secciones:** `clamp(72px, 9vw, 112px)` entre secciones,
  `clamp(40px, 5vw, 64px)` entre subsecciones, con sub-escala para encabezados. La base de
  espaciado es de 4/8/16/24/32px (`xs`…`xl`).
- **Breakpoints:** un solo corte de escritorio en 768px (móvil ≤767px). El dock reserva
  `92px + safe-area-inset-bottom` para no tapar contenido.

No hay rejilla multicolumna compleja: las tarjetas usan rejillas de 1–2 columnas según
breakpoint, y la jerarquía la define el ritmo vertical, no la retícula.

## Elevation & Depth

La profundidad se construye por **capas nominales**, cada rol con su sombra propia —no hay una
sombra global reutilizada:

- **Card:** anillo de 4px (`0 0 0 4px`) casi transparente más una sombra baja; la tarjeta se
  separa por borde y tono, no por drop-shadow pesada.
- **Window:** sombra alta y difusa (`0 24px 64px`) porque la ventana de caso flota sobre la
  página.
- **Dock:** sombra media más highlight interior que simula el canto superior del vidrio.
- **Glass:** dock y ventanas usan `backdrop-filter` con blur 22–24px y saturación elevada; el
  tema oscuro añade equivalentes sólidos para contextos sin backdrop-filter.
- **Glow:** un radial-gradient del acento al 10–12% de opacidad corona la parte superior del
  canvas y da calidez sin convertirse en color de sección.

En conjunto el sistema es de **elevación media**: nada plana, nada dramática. Si un elemento
necesita destacar, primero cambia de superficie (canvas → elevated), después sombra, nunca a
inversión de color.

## Shapes

El lenguaje de formas es **suave y consistente**: esquinas generosas con una escala fija, sin
mezclar familias de radio en el mismo grupo.

- **Píldora (`full`, 999px):** botones, chips, skip-link —todo lo que se pulsa es una píldora.
- **Tarjeta (`2xl`, 32px):** tarjetas de proyecto y su media, ventanas y superficies grandes.
- **Escala (`sm` 8 / `md` 12 / `tile` 14 / `lg` 16 / `xl` 20):** controles e interiores; el
  icon-tile mantiene 14px en sus 44×44.
- La media de tarjeta respeta `aspect-ratio: 1.65/1` con `object-fit: cover`; la forma del
  contenido nunca deforma la forma del sistema.

## Components

Los componentes se definen por rol y estado; los estados hover/pressed son variantes del mismo
componente, no componentes nuevos:

- **Button primary:** píldora de acento con sombra sólida de 3px que simula una tecla física; al
  pulsar se hunde 3px y la sombra colapsa. El hover sube 1px y aclara el teal. Es la única
  acción teal por pantalla.
- **Button secondary:** píldora neutra sobre `fill`, misma altura mínima (44–46px) y tipografía
  de botón; no compite con el acento.
- **Chip:** píldora de 32px sobre `fill` para filtros y metadatos; etiqueta sans 14px/500.
- **Card:** superficie `elevated`, radio 32px, media 1.65:1 y título serif cursiva; hover
  desplaza 2px con `easing-card`. El cuerpo lleva padding 18/20/14 y el índice en caption teal.
- **Icon tile:** cuadrado 44×44 de tinte `accent-soft` con icono en acento; el color de acento
  aquí es decorativo, no interactivo.
- **Case window / Dock:** las superficies de vidrio del sistema; el contenido dentro hereda
  siempre `ink` sobre el glass para conservar el contraste.

## Motion

El movimiento es **respuesta, no espectáculo**: el feedback interactivo dura 150ms con
`easing-out`, la liberación de botón 180ms, y el hover de tarjeta es la transición más lenta del
sistema a 450ms con `easing-card`. La curva `easing-spring` queda reservada para momentos de
desvelado y deleite —nunca para controles.

- GSAP se consume **solo** por su punto único de acceso (`@lib/core/gsap.ts`); ningún componente
  importa la librería directamente.
- El burst del hero usa Web Animations API de forma deliberada: es una emisión única y no
  justifica el peso de GSAP en ese camino.
- `prefers-reduced-motion` desactiva las animaciones no esenciales (release, burst, reveals);
  la interfaz debe ser completa sin movimiento.

## Do's and Don'ts

- **Do** usar el teal solo para la acción principal de cada pantalla; el foco visible hereda el
  mismo acento.
- **Don't** pintar texto corrido, fondos de sección ni bordes generales con el acento; su
  escasez es lo que lo hace legible.
- **Do** firmar las piezas de autor —tarjetas de proyecto y notas— con el título serif cursiva.
- **Don't** usar la cursiva serif en botones, etiquetas ni títulos de sección; esos niveles son
  sans 600.
- **Do** partir del canvas off-white y la tinta `#202020`, y elevar a `elevated` cuando algo
  necesite separarse.
- **Don't** usar blanco puro de fondo de página ni negro puro de texto; y no mezclar los tokens
  `*-dark` con claros dentro del mismo componente.
- **Do** respetar la escala de radios: píldora para lo pulsable, 32px para superficies, la
  escala intermedia para el resto.
- **Don't** inventar radios, sombras ni duraciones fuera de las de este documento; si el sistema
  no lo define, no existe.
- **Do** animar solo con las curvas y tiempos definidos arriba y desactivar lo no esencial con
  `prefers-reduced-motion`.
- **Don't** añadir un segundo acento cromático ni gradientes en la chrome de la interfaz; los
  gradientes viven únicamente en las miniaturas de caso.
