# Exploración — hero-name-image-hover

> Fase: explore (read-only sobre código de producción). No decide implementación; enumera
> evidencia, restricciones, enfoques factibles e incertidumbres para la propuesta.

## 1. Objetivo observado

En el Hero, el nombre «Héctor Reyes» debe comportarse como el tratamiento letra→imagen
descrito por el usuario (referencia: blog de OpenAI):

- al pasar el puntero sobre una letra, esa letra se sustituye visualmente por una imagen;
- al salir el puntero, la letra vuelve con un retardo intencional leve (no instantáneo);
- cada carácter tiene **dos variantes visuales** y se muestra **una variante aleatoria** a la vez;
- si no hay una ruta de generación de imágenes, se usan **placeholders de color reemplazables**.

## 2. Estado actual (evidencia)

### 2.1 Marcado

- `src/components/organisms/Hero.astro:17` — `<h1 class="hero__name">Héctor Reyes</h1>`, texto
  plano, sin spans ni datos por carácter. El nombre está literal en el componente (no viene de
  `site-content.ts`; ese archivo no define el nombre del Hero).
- `src/components/molecules/HeroPortrait.astro` — precedente arquitectónico directo: molecule de
  presentación con `<script>` que importa `@lib/core/hero-emoji-burst` y llama al inicializador.
  El efecto visual del Hero vive en `src/lib/core/`, **no** en `src/features/`.
- No hay uso de `astro:assets` ni de `<Image>` en el repo; los assets son estáticos en
  `public/assets/` (`branding/hector-reyes.png`, `branding/logo.png`, `footer_image_*.png`).

### 2.2 Estilos

- `src/styles/portfolio/hero.css:59` — `.hero__name { font-size: 56px; letter-spacing: -0.035em;
  line-height: .98; }`; móvil ≤767px baja a `40px` (línea 80) y ≤430px tracking `-0.03em`
  (línea 89). Sin `transition`, sin `:hover`, sin posicionamiento interno.
- `src/styles/portfolio/tokens.css` — `--ease-out: cubic-bezier(.2,.8,.2,1)`,
  `--ease-in`, `--ease-spring`, `--accent`, `--accent-soft`, `--line-strong`, `--shadow-sm`,
  escala `--r-sm…--r-pill`, `--col: 520px`, `--gutter: clamp(20px, 5vw, 48px)`.
- `DESIGN.md` (motion): `feedback 150ms`, `release 180ms`, `card-hover 450ms`,
  `easing-out`, `easing-card`, `easing-spring` reservado a deleite. Regla explícita:
  «Don't inventar radios, sombras ni duraciones fuera de las de este documento».
- `src/styles/portfolio/motion.css` — bajo `prefers-reduced-motion: reduce` aplica
  `transition-duration: .01ms !important` y `animation-duration: .01ms !important` a todo, y
  desactiva reveals/marquee/cards. Un efecto CSS puro queda neutralizado por esta regla global.
- Tipografía display: Eudoxus Sans 600, 56px/0.98, tracking -0.035em (DESIGN.md).

### 2.3 Arquitectura y herramientas

- Astro 7 + TS estricto + Tailwind 4 + GSAP + pnpm. Alias `@atoms/@molecules/@organisms/
  @features/@layouts/@lib` (`vitest.config.ts`, `tsconfig`).
- `.dependency-cruiser.cjs` prohíbe `src/components/** → src/features/**` (severity error).
  Un efecto del Hero debe vivir en `src/lib/core/` o resolverse por prop/callback.
- `openspec/config.yaml` — `test_command: pnpm agent:test` (`pnpm check && pnpm build`); no hay
  suite unitaria/e2e; cambios visuales/interactivos exigen evidencia de accesibilidad,
  responsive y navegador. Propose solo escribe artefactos de planeación.

### 2.4 Tests que restringen el cambio (contratos vivos)

- `src/features/projects/navigation-semantics.test.ts:585-586` — renderiza `index.astro` con
  `AstroContainer` y extrae el outline por regex: exige **exactamente un h1** cuyo `text` sea
  exactamente `'Héctor Reyes'`. El extractor (`outlineOf`, líneas 287-318) hace
  `raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()`, es decir **elimina los tags**.
  Consecuencia: si se parten las letras en `<span>` y se pierde el espacio entre palabras, el
  texto pasa a `HéctorReyes` y el test rompe; y si se añade texto sr-only **dentro** del h1 se
  duplica el nombre. El espacio y la ausencia de texto extra son condiciones duras.
- `src/features/projects/portfolio-consistency.test.ts:492` — `.hero__section-title` no debe
  tener `font-size` propio; el archivo `hero.css` se lee y se asertan contratos de escala.
- `src/features/complexity-contracts.test.ts:525+` — contrato jsdom del `hero-emoji-burst`:
  estado a nivel de módulo, `init` idempotente, `matchMedia` de hover/reduced, limpieza de
  animaciones. Marca el patrón esperado para cualquier inicializador nuevo del Hero.
- `src/features/projects/ssr-safety.test.ts` — módulos importados no deben tocar `document`
  durante el render de servidor.
- `vitest.config.ts` incluye `src/**/*.test.ts` y usa `getViteConfig` (compila `.astro`).

## 3. Restricciones y consideraciones

### 3.1 Accesibilidad

- El h1 debe seguir exponiendo **el nombre como texto accesible único**. Envolver letras en
  spans inline no rompe el nombre accesible, pero las imágenes de reemplazo **no** deben entrar
  al árbol accesible: si se usa `<img>` por letra, `alt=""` + `aria-hidden="true"`; si se usa
  `background-image` sobre el span, el texto de la letra permanece como nombre accesible.
- Evitar tab stops por letra: el efecto es de puntero, no una acción de teclado. No añadir
  `tabindex`, botones ni `role` nuevos.
- La copia/selección del nombre (`Ctrl+C` → «Héctor Reyes») debería seguir funcionando; los
  spans no lo impiden si se conservan los nodos de texto.
- Contraste: durante el estado hover el nombre deja de ser texto visible; el estado base debe
  conservar el contraste actual. Los placeholders deben respetar el sistema (canvas/elevated/
  fill/accent-soft) y no introducir un segundo acento cromático (regla de DESIGN.md).

### 3.2 Touch y puntero

- `:hover` en táctil es «pegajoso»: un tap deja la letra en imagen sin `pointerleave` que
  dispare el retorno → riesgo de letra congelada. Es imprescindible gatear el efecto con
  `@media (hover: hover) and (pointer: fine)` (o `matchMedia` equivalente), patrón ya usado en
  `features/magnetic-hover/init.ts` y `features/spotlight/init.ts`.
- `hero-emoji-burst.ts` usa además `pointerenter` con `event.pointerType === 'mouse'` como
  filtro; referencia directa para no activar con hover sintético de touch.

### 3.3 Reduced motion

- `motion.css` neutraliza transiciones CSS globalmente bajo reduce (`.01ms !important`), lo que
  deja el reemplazo prácticamente instantáneo. Hay que decidir explícitamente entre:
  (a) desactivar el efecto bajo reduce —precedente de `hero-emoji-burst`, que no emite nada—,
  (b) conservar el reemplazo sin animación. El proyecto tiende a (a) por consistencia.
- El retardo de retorno es parte del efecto: bajo reduce no debería existir demora perceptible.

### 3.4 Responsive

- Escala del nombre: 56px desktop / 40px ≤767px; el efecto debe escalar en unidades relativas
  (`em`/`ch`), no px fijos, para no romper el breakpoint.
- Sin reflow: la letra sustituida debe ocupar la **misma caja** que la letra original
  (superposición absoluta dentro de un span con `position: relative` y ancho reservado) para no
  mover el resto del Hero ni provocar CLS/salto de línea.
- Riesgo de kerning: separar el texto en elementos inline puede alterar el par kerning del
  texto plano; el tracking negativo (-0.035em / -0.03em) aplica uniforme pero el resultado
  visual debe validarse a 320/390/768/1280 px.
- La columna de lectura es 520px; «Héctor Reyes» cabe a 56px, pero la suma de spans con
  imágenes no debe ampliar la caja ni generar scroll horizontal.

### 3.5 Assets e imágenes

- **No existe pipeline de generación de imágenes** en el repo (sin `astro:assets`, sin scripts
  de generación, sin servicio externo). Por tanto el escenario por defecto es **placeholder
  reemplazable**.
- Cómputo de caracteres: «Héctor Reyes» = 11 letras (H,é,c,t,o,r,R,e,y,e,s) + 1 espacio.
  2 variantes × 11 letras = **22 imágenes/placeholders**. El espacio no requiere variantes.
- 22 imágenes cargadas eagerly serían coste innecesario: solo se muestran al hover. Definir
  carga diferida o `background-image` por CSS.
- Si el usuario aporta imágenes reales, falta definir convención de nombres/rutas/escala y
  si se sirven desde `public/` (sin optimización) o con el pipeline de assets (no usado hoy).

## 4. Enfoques factibles (no se decide aquí)

1. **CSS puro** — spans generados en el `.astro`, cada uno con letra + capa de imagen; `:hover`
   revela la imagen y el retorno usa `transition-delay` al salir.
   *Límite:* CSS no tiene azar; la «variante aleatoria» habría que fijarla por letra (build) o
   alternar con `:nth-child`. No cumple «aleatoria a la vez» si eso significa por hover.
2. **JS mínimo en `src/lib/core/`** (patrón `hero-emoji-burst`) — el marcado (spans + datos de
   variantes) se genera en Astro; al `pointerenter` de cada letra se sortea la variante y se
   aplica clase/atributo; al `pointerleave` se revierte con retardo. Respeta hover/reduce con
   `matchMedia` y permite azar real por activación.
3. **Híbrido** — Astro compone spans y variantes, CSS gestiona transición y retorno, JS solo
   elige la variante aleatoria. Menor superficie JS que (2) si el retorno es puramente CSS.

Punto de decisión clave: si «una variante aleatoria a la vez» es **por hover** (necesita JS) o
**por carga de página** (basta azar en build dentro del `.astro`). El enunciado sugiere por
activación.

## 5. Incertidumbres concretas para proposal

1. **Alcance del azar**: ¿variante aleatoria en cada hover (JS) o fija por carga (build)?
   Determina si el cambio es CSS-only o incluye un módulo en `src/lib/core/`.
2. **Assets**: ¿placeholders de color como entrega final o contrato de imágenes reemplazables
   (rutas, nombres, escala, origen)? ¿Los aporta el usuario?
3. **Variantes por carácter**: ¿solo las 11 letras o también el espacio? ¿Tratamiento de «é»
   acentuada?
4. **Reduce motion**: ¿desactivar el efecto (precedente `hero-emoji-burst`) o reemplazo sin
   animación ni retardo?
5. **Touch**: ¿desactivar por completo en `(hover: none)` o permitir tap con retorno
   temporizado? ¿Cómo evitar la letra congelada?
6. **Retardo de retorno**: valor exacto y si reutiliza tokens existentes (`release 180ms`,
   `feedback 150ms`) o introduce un delay nuevo (DESIGN.md prohíbe inventar duraciones).
7. **Alcance del efecto**: ¿solo el h1 del Hero o también otras apariciones del nombre?
8. **Semántica**: confirmar que el h1 conserva el texto accesible exacto «Héctor Reyes»
   (contrato de `navigation-semantics.test.ts`) y que las imágenes son decorativas.
9. **Presupuesto de revisión (400 líneas)**: 22 placeholders + CSS + posible JS pueden acercarse
   al límite; decidir si un solo PR o chained (requiere decisión humana `ask-on-risk`).
10. **Testabilidad**: si se añade módulo JS, ¿se define contrato jsdom como el de
    `hero-emoji-burst` (con `vi.spyOn(Math,'random')`)? ¿O queda como efecto solo visual sin
    tests nuevos?
11. **Serving de imágenes reales**: `public/` estático vs pipeline de assets (no usado hoy).
12. **Zoom/selección**: comportamiento a 200% de zoom y al copiar el nombre.

## 6. Validación esperada (para proposal/apply)

- `pnpm check` + `pnpm build` (`pnpm agent:test`).
- Evidencia real de navegador: desktop hover (entrada, retorno con retardo, dos variantes),
  touch en 390/320 px, reduced motion, 767/768 px de breakpoint, sin reflow/CLS ni overflow.
- Outline del h1 intacto y nombre accesible único.

## 7. Fuera de alcance sugerido

Generación de imágenes por IA, cambio de copy/contenido, cambios en otros encabezados, nuevas
dependencias, refactor del sistema de motion, y cualquier alteración del contrato
`HeroContent`.
