# Revisión técnica — hero-emoji-burst

- **Hash revisado (`pnpm agent:ready hero-emoji-burst`):** `cf02b62bfe401b9b63b71754f25aae1c573c14a1fe34c58efae12d1c6fdfab62`
- **Resultado de validación:** `Change 'hero-emoji-burst' is valid` — `Propose válido: hero-emoji-burst. Pendiente revisión humana.`
- **Modelo de esta revisión:** `anthropic/claude-sonnet-5`
- **Fecha:** 2026-09-13
- **Dictamen: sin bloqueos**

Artefactos revisados: `proposal.md`, `design.md`, `specs/hero-emoji-burst/spec.md`, `tasks.md`, contrastados contra `src/components/organisms/Hero.astro`, `src/styles/portfolio/hero.css`, `src/styles/portfolio/base.css`, `src/styles/portfolio/motion.css`, `src/pages/index.astro`, `src/features/*/init.ts`, `src/types/site.ts`, `tsconfig.json` y `.omp/AGENTS.md`.

## Coherencia y alcance

- `proposal.md` → `design.md` → `spec.md` → `tasks.md` son trazables 1:1: cada uno de los siete requisitos de `spec.md` (fotografía responsive, hover, touch, teclado, ráfaga decorativa, reduced motion, recursos acotados) tiene decisión de diseño correspondiente y al menos una tarea con criterio de evidencia explícito (grupos 1–3 de `tasks.md`).
- El conjunto de 20 emojis es idéntico y literal en `proposal.md` (What Changes) y `design.md` (Decisión 4); conté 20 miembros, incluida la bandera 🇲🇽 (secuencia de indicadores regionales) y los glifos con selector de variación (🏗️, 🏘️, 🇲🇽… vía `\uFE0F`/secuencia). El riesgo de fragmentar codepoints está identificado explícitamente en Decisión 4 y en Risks.
- `Impact` en `proposal.md` declara el diff a cuatro archivos (`HeroPortrait.astro`, `hero-emoji-burst.ts`, `Hero.astro`, `hero.css`) y tasca 3.3 exige revisar que el diff final no se salga de ese alcance — coherente.
- `HeroContent` (`src/types/site.ts`: `{ role, bio }`) no tiene campo de imagen; el asset/alt del Hero ya están hardcodeados en `Hero.astro` actual. La afirmación de `design.md` de "preservar el contrato `HeroContent`" es verificable y no requiere tocar `site-content.ts`, tal como dice el propio documento.
- Breakpoint reutilizado: `hero.css` ya usa `@media (max-width: 767px)` para el tamaño móvil actual (96/72 px). El cambio a 120/90 px reutiliza el mismo breakpoint sin introducir uno nuevo; no hay ambigüedad de límite en 767/768.

## Contrato Atomic Modular Stack (`.omp/AGENTS.md`)

- Capas respetadas: `HeroPortrait.astro` es molecule (agrupa átomos/markup con lógica visual mínima), el inicializador vive en `src/lib/core/hero-emoji-burst.ts` (no en `src/features/`), y `design.md` es explícito en que no debe importar features ni tocar estado de producto/persistencia — correcto según `lib/core` para "inicializaciones/configuración" vs. `features/` para "estado complejo, persistencia y lógica específica de producto". El efecto es puramente visual y efímero, por lo que la ubicación en `core` es defendible y no en `features`.
- Reutilización de tokens: `--line-strong`, `--shadow-sm`, `--accent`, `--accent-soft` existen en `src/styles/tokens.css` y ya se consumen en `hero.css`/`base.css`; el plan no introduce tokens nuevos.
- **Hallazgo no bloqueante — patrón de inicialización nuevo.** Revisé todo `src/` (`grep <script`): los únicos `<script>` existentes son el bootstrap inline de tema en `BaseLayout.astro` y el bloque único de `src/pages/index.astro` que importa y llama a los nueve `initX()` de `src/features/*/init.ts`. Ningún componente (atom/molecule/organism) embebe hoy un `<script>` propio. `design.md` (Decisión 1) propone un `<script>` dentro de `HeroPortrait.astro` que importa `@lib/core/hero-emoji-burst` y lo invoca ahí mismo, sin tocar `index.astro`. Es arquitectónicamente coherente con las capas de `AGENTS.md` (no es una feature) y el propio diseño ya descarta las alternativas (organism mezclado, o feature para estado puramente visual), pero es el primer precedente de script a nivel de componente en el repo y cambia el patrón "un solo script centralizado" que sigue todo el resto del sitio. No es un requisito verificable incumplido ni bloquea la revisión; señalo el punto para que apply lo implemente de forma consciente (incluida la guarda de inicialización por raíz que el propio diseño ya exige para idempotencia) y para que quede documentado si en el futuro se generaliza este patrón.

## Precisión 120px/90px

- `design.md` Decisión 2 fija `box-sizing: border-box` explícito en la imagen para que el borde (`border: 1px solid var(--line-strong)`, ya existente) quede incluido en la caja de 120/90 px, y no aplica `padding`/`border` extra al wrapper ni al botón. `base.css` ya resetea `button { border: 0; padding: 0; }` globalmente, así que el botón no añade caja extra — no hay gap entre lo que pide `spec.md` ("SHALL medir exactamente 120 × 120 CSS px de caja exterior, incluido su borde") y lo que el diseño puede producir.
- `box-shadow` no participa en el box model de layout, por lo que no afecta la medición con `getBoundingClientRect()` propuesta en tarea 1.2.
- El margen inferior se traslada del `.hero__logo` actual al wrapper (Decisión 2), evitando doble margen tras envolver la imagen — correcto.
- Cobertura de evidencia: tarea 1.2 exige medir en 320/390/767/768/1280 px; escenarios de `spec.md` cubren exactamente los mismos límites. Coincide.

## Eventos hover/touch/teclado sin duplicados

- Decisión 3 de `design.md` separa las tres rutas por tipo de evento (no por heurística de SO), y contempla explícitamente los casos de colisión: hover persistente + click posterior (sin doble emisión), tap con eventos de compatibilidad mouse (ignorados), scroll/cancelación táctil (sin emisión), `event.repeat` en teclado (sin flujo continuo), y clicks sin `pointerType` originados por teclado/tecnología asistiva (`detail === 0`). Cada uno de estos casos tiene un escenario Given/When/Then correspondiente en `spec.md` y una verificación de conteo en tareas 2.2/3.2.
- Riesgo real y ya reconocido: distinguir "click de mouse sin hover real" vs. "click sintético de touch" vs. "click de teclado" en una sola ruta de emisión es la parte más delicada de la implementación; `design.md` lo deja como decisión de alto nivel (filtrar por `pointerType`/origen registrado) sin pseudocódigo exacto, lo cual es apropiado para un documento de diseño pero exige atención fina en apply. Ya está identificado como riesgo principal en `Risks / Trade-offs` ("Tap + hover sintético + click") y como tarea de verificación explícita (2.2, 3.1, 3.2) con exigencia de "conteo de emisiones observado en navegador" — cobertura adecuada, no requiere más detalle a nivel de spec.

## Stacking detrás de la foto

- Decisión 2: wrapper con `position: relative; isolation: isolate` crea un contexto de apilamiento local; capa decorativa `z-index: 0`, botón/imagen `z-index: 1`, sin z-index negativo (evita que el fondo de página tape el efecto). El recorte circular vive en la imagen, no en el wrapper, para permitir que las partículas salgan del área circular sin quedar recortadas por un `overflow: hidden` del contenedor. Es coherente con el requisito "Ráfaga decorativa aleatoria detrás del retrato" y con el riesgo "Partículas tapan la foto o quedan escondidas permanentemente".
- Verificación en frame intermedio (no solo resultado final) está explícita en Decisión 4 y en tarea 2.3 ("capturar fases inicial/intermedia/final") — cubre el riesgo de que una revisión solo mire el estado final y no detecte partículas asomando por encima de la foto durante el tránsito.
- No hay `overflow-x: hidden` global en `base.css`/`hero.css` (confirmado por grep), así que nada evita estructuralmente un desbordamiento horizontal si las trayectorias no se acotan al viewport en tiempo de emisión; `design.md` lo resuelve midiendo límites una vez por emisión (Decisión 4) y lo lista como riesgo con verificación explícita a 320 px (tarea 2.4, escenario "Tamaño mobile y límite inferior" en `spec.md`). Cobertura adecuada.

## Web Animations API

- Decisión 4 usa `Element.animate` exclusivamente sobre `transform`/`opacity`, justifica no usar GSAP (módulo `@lib/core/gsap.ts` existente pero innecesario para una animación aislada) ni keyframes CSS (la regla global de `motion.css` fuerza `animation-duration: .01ms` bajo reduce pero no cancela `Element.animate`, que corre fuera del sistema de animaciones CSS). Confirmé en `motion.css` que su bloque `@media (prefers-reduced-motion: reduce)` solo toca `animation-duration`/`transition-duration` de CSS, no Web Animations — el diseño identifica correctamente esta laguna y por eso exige cancelación explícita del controlador (Decisión 5), no solo depender de CSS.
- Guardar referencias a las animaciones para cancelarlas y retirar nodos al completar/cancelar está explícito, con manejo de promesas rechazadas no capturadas — cubre limpieza determinista antes de 1.6 s (tarea 2.4, escenario "Activaciones rápidas y reposo").

## Reduced motion dinámico

- Decisión 5 usa `matchMedia('(prefers-reduced-motion: reduce)')` con listener `change` para cancelar/limpiar de inmediato al pasar a reduce durante una ráfaga activa, y exige que volver a no-preference no reanude ni autoemita — coincide exactamente con el escenario "Cambio dinámico de preferencia" de `spec.md`.
- Nota de coherencia interna (no bloqueante): ningún inicializador existente en `src/features/*/init.ts` (revisé `magnetic-hover`, `spotlight`, `case-window`) escucha `change` en `matchMedia`; todos comprueban una sola vez al montar. El requisito de reduced motion dinámico de `hero-emoji-burst` es una necesidad genuina del propio spec (una ráfaga puede seguir viva cuando cambia la preferencia del SO) y no una inconsistencia de diseño; simplemente no hay precedente de código para copiar, así que apply deberá escribir este listener desde cero con cuidado de no dejarlo huérfano (debe removerse si el nodo/instancia se destruye, aunque en este sitio sin `ClientRouter` no hay navegación SPA que desmonte el Hero).

## Límite de partículas

- Tope de 12 partículas vivas sin colas, sustitución de la ráfaga anterior al recibir una nueva activación (cancelar + retirar antes de emitir la nueva) — declarado en Decisión 3 y 4, requerido en `spec.md` ("Recursos acotados y mejora progresiva") y verificado en tarea 2.4 con "diez activaciones rápidas... nunca hay más de 12 partículas". Coherente y sin cabos sueltos: la decisión de sustituir en vez de encolar está justificada explícitamente como intencional en `Risks / Trade-offs` y no contradice el requisito de "una emisión por acción" porque sustituye la ráfaga, no la cuenta de eventos de entrada.

## Requisitos verificables y cobertura de validación

- Los siete requisitos `spec.md` usan lenguaje SHALL/SHALL NOT con escenarios Given/When/Then medibles (píxeles exactos, conteos de emisión, límites de tiempo, presencia/ausencia de nodos), sin frases vagas tipo "debería verse bien". Aptos para verificación en navegador según exige `agent:verify`.
- `tasks.md` grupo 3 exige evidencia real de navegador (desktop 1280×900, mobile 390×844, 320 px, límites 767/768, teclado, reduce inicial/dinámico, degradación sin JS) y obliga a declarar explícitamente qué emulación se usó y qué escenario no se ejecutó (tarea 3.2) — evita que se dé por probada tecnología asistiva real solo con inspección de DOM, alineado con la sección "Validación" de `.omp/AGENTS.md" ("Check/build no cubren interacción ni apariencia").
- Tarea 3.4 secuencia correctamente el cierre: marcar la casilla justo antes de `pnpm agent:verify` (que exige todas las tasks completas) y revertirla si falla, sin declarar cierre sin éxito observado — coincide con el flujo de `agent-pipeline.md`.
- No se pide (ni se necesita) instalar un framework e2e; la evidencia manual es proporcional a que "No existe suite unitaria/e2e del sitio" (contexto de `design.md`, confirmado por ausencia de dependencias de testing en el repo).

## Riesgos y no-objetivos

- La sección `Risks / Trade-offs` de `design.md` cubre los seis riesgos más probables del efecto (doble activación, oclusión incorrecta, overflow, movimiento no cancelado, sustitución de ráfaga, variación de glifo por fuente/SO) y cada uno tiene mitigación y verificación asociada en `tasks.md`. No detecté un riesgo material identificado en el código actual que falte en esta lista.
- Non-Goals de `design.md` (sin feature de producto, sin motor genérico de partículas, sin nuevo atom envolviendo solo `<img>`, sin dependencia de animación, sin configuración pública, sin nuevo sistema de navegación) son consistentes con las exclusiones de `proposal.md` y evitan scope creep.

## Conclusión

Sin bloqueos. El plan es coherente internamente, coherente con el código actual y con `.omp/AGENTS.md`, y cubre con requisitos verificables y tareas de evidencia los seis puntos de atención señalados (exactitud 120/90 px, deduplicación de hover/touch/teclado, stacking detrás de la foto, Web Animations, reduced motion dinámico, límite de partículas). El único punto señalado (patrón de `<script>` embebido en la molecule, primero de su tipo en el repo) es una observación arquitectónica para que apply lo ejecute con intención, no un hallazgo que requiera otra ronda de propose/review.
