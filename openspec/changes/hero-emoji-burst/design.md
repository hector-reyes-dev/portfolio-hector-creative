## Context

Ver `proposal.md` para motivación y alcance. El Hero actual (`src/components/organisms/Hero.astro`) coloca una imagen estática antes del nombre, con asset `/assets/branding/hector-reyes.png`, alt descriptivo y atributos intrínsecos 500 × 500. `src/styles/portfolio/hero.css` la presenta a 96 × 96 px y 72 × 72 px bajo `max-width: 767px`, con borde, recorte circular, `object-position: center 28%`, sombra y margen inferior adaptable.

`src/styles/portfolio/base.css` ya resetea botones y ofrece `:focus-visible` con `--accent`; `motion.css` reduce animaciones CSS, pero no cancela Web Animations. `BaseLayout.astro` no utiliza ClientRouter. `index.astro` inicializa features existentes; no es necesario alterar esos inicializadores. No existe suite unitaria/e2e del sitio: check/build y navegador son la validación aplicable.

## Goals / Non-Goals

**Goals:** encapsular el control visual, preservar el contrato `HeroContent`, reservar geometría estable y mantener estado efímero acotado a la vida de las partículas. Hacer explícitas las reglas para dispositivos híbridos, teclado y preferencia dinámica de movimiento.

**Non-Goals:** crear una feature de producto, un motor genérico de partículas, un nuevo atom envolviendo solamente `<img>`, una dependencia de animación, configuración editable del efecto o un nuevo sistema de navegación/lifecycle.

## Decisions

### 1. Molecule de presentación e inicializador visual

- Crear `src/components/molecules/HeroPortrait.astro` con wrapper posicionado, `<button type="button">` e imagen, más una capa hermana decorativa. Asset y alt permanecen iguales. Nombre accesible del botón: acción de mostrar emojis asociada a la fotografía de Héctor Reyes; no `aria-pressed` ni live region porque no hay estado conmutado o información nueva.
- `Hero.astro` importa la molecule mediante `@molecules/HeroPortrait.astro` y sustituye únicamente la imagen. El contenido y el resto del markup no cambian.
- Crear `src/lib/core/hero-emoji-burst.ts` con `initHeroEmojiBurst(): void`; un `<script>` procesado de la molecule lo importa mediante `@lib/core/hero-emoji-burst` y lo invoca. Selectores `data-hero-portrait`, `data-hero-portrait-trigger` y `data-hero-emoji-layer` delimitan cada instancia. Consultas tipadas, ausencia de nodos = no-op; marca de inicialización por raíz evita duplicar listeners.
- El controlador guarda solo partículas/animaciones activas y origen de la interacción. No importa features, no modifica globals del tema y no persiste datos. No se necesita cambiar `index.astro` ni `site-content.ts`.

Alternativas: incrustar todo en el organism mezcla composición con efectos; ponerlo en `features/` obliga a coordinar UI y entrada de página para un estado puramente visual. La molecule con inicializador en core respeta las capas sin crear abstracciones reutilizables ficticias.

### 2. Tamaño exterior exacto y stacking local

Modificar únicamente los selectores de foto y nuevos elementos en `src/styles/portfolio/hero.css`. Wrapper, botón e imagen reservan 120 × 120 CSS px; en el breakpoint existente hasta 767 px reservan 90 × 90. Aplicar `box-sizing: border-box` explícito a la imagen para que el borde quede incluido. Imagen `display: block`; mantener atributos intrínsecos 500 × 500 y `object-fit`, `object-position`, borde con `--line-strong`, radio y `--shadow-sm` actuales.

Trasladar el margen inferior actual de la imagen al wrapper, sin duplicarlo. Sin transforms de escala sobre la propia fotografía. Mantener el foco global visible sobre el botón circular. Resto del Hero intacto, salvo el desplazamiento natural causado por el nuevo tamaño.

Wrapper con `position: relative`, `isolation: isolate` y overflow visible. Capa absoluta de igual tamaño con z-index 0; botón/imagen delante con z-index 1. No usar z-index negativo: podría esconder el efecto detrás del fondo. Capa `pointer-events: none`, `aria-hidden="true"`, partículas sin foco y fuera del flujo. El recorte circular pertenece a la imagen, no al wrapper, para dejar salir partículas. Limitar horizontalmente los destinos al viewport con margen para el glifo rotado más grande; no ocultar globalmente el overflow de la página ni recortar el foco.

### 3. Disparadores sin dobles emisiones

El tamaño depende del viewport, pero el modo de entrada depende del evento, no de detectar un sistema operativo:

- `pointerenter` de mouse con capacidad hover: una emisión. Ni `pointermove`, ni permanecer encima, ni click posterior de ese mouse generan otra. Salir y reentrar sí genera otra.
- Touch/pen sin hover: emitir por click de activación válido después del tap; no escuchar `touchstart` ni emitir en `pointerup`. Así un scroll/cancelación no dispara el efecto y el click de compatibilidad no lo duplica. Ignorar las entradas hover producidas por touch.
- Enter/Espacio: usar la activación nativa del botón y su click de teclado/tecnología asistiva, sin un segundo emisor en keyup. Si se filtra mouse por `pointerType`, contemplar los clicks sin pointerType mediante el origen registrado y `detail === 0`. Prevenir repetición de keydown (`event.repeat`) para que mantener Enter no produzca un flujo; no cancelar la primera activación ni robar el comportamiento nativo de Espacio.
- Click de mouse en dispositivo realmente sin hover puede usar la ruta de activación por click. En híbridos, un tap sigue funcionando incluso si existe mouse conectado.

Todos llaman al mismo emisor, que consulta reduced motion antes de crear nodos. No emitir al enfocar, montar o cargar la página. No cooldown que descarte la siguiente acción: una nueva activación sustituye la ráfaga anterior, cancelándola y retirándola antes de emitir la nueva. Es una decisión local de contención: hasta 12 partículas vivas, sin colas.

### 4. Web Animations API con azar acotado

Preferir `Element.animate` frente a GSAP (innecesario para una animación aislada) o keyframes CSS (la regla global de movimiento reducido altera duraciones sin asegurar limpieza). No agregar dependencias. Si se eligiera GSAP en una revisión futura, usar el módulo core existente, no configurarlo aparte.

Por activación, crear 12 spans con `textContent` elegido de un array explícito de 20 strings: `💻`, `🛒`, `🔍`, `🤖`, `📊`, `🏗️`, `🐕`, `🏘️`, `💰`, `📝`, `🇲🇽`, `⚙️`, `🧩`, `📈`, `🗂️`, `🚀`, `🧠`, `📱`, `💼`, `🌐`. No dividir una cadena por codepoint: rompería la bandera y los selectores de variación. Selección con reemplazo; no se exige que cada ráfaga use todo el conjunto ni diferencias garantizadas entre sorteos.

Parámetros propuestos, sorteados por partícula en cada emisión:

| Parámetro | Rango |
|---|---|
| Tamaño base | 18–32 px |
| Origen | zona central oculta por la fotografía, ±10% de su diámetro |
| Destino horizontal | −80 a +80 px, ajustado al viewport y al ancho de la foto |
| Ascenso final | 110–190 px sobre el origen |
| Desvío horizontal intermedio | −24 a +24 px respecto a la trayectoria, también acotado |
| Rotación inicial / final | −30° a +30° / −100° a +100° |
| Duración | 850–1400 ms |
| Retraso | 0–160 ms |

Animar exclusivamente transform y opacity: escala inicial 0.2, crecimiento hasta 1 al salir del retrato, ascenso siempre hacia arriba con desplazamiento lateral interpolado y desvanecimiento final a 0. Las partículas retrasadas quedan invisibles hasta su inicio. La foto ocluye físicamente el origen; verificar un frame intermedio, no solo el resultado final.

Guardar referencias a animaciones para cancelarlas. Completar/cancelar retira cada nodo y su referencia; tratar la cancelación sin promesas rechazadas no manejadas. Una ráfaga sin interrupciones queda limpia antes de 1.6 s. No timers recurrentes, listeners por partícula ni lecturas de layout por frame; medir límites una vez al emitir.

### 5. Reduced motion y degradación

Consultar `matchMedia('(prefers-reduced-motion: reduce)')` al inicializar y en cada emisión; su listener `change` cancela y limpia inmediatamente cuando pasa a reduce. Volver a no-preference habilita la siguiente activación, sin emisión automática. El CSS de la capa también la oculta bajo reduce como protección, pero no sustituye la limpieza del controlador. El botón y su foco permanecen estables.

Sin JavaScript, o si Web Animations no existe, la foto conserva dimensiones, aspecto y texto alternativo sin errores ni contenido obligatorio perdido; el efecto es progresivo. No incorporar fallback animado. La página actual navega con documentos completos; no introducir hooks de ClientRouter inexistente.

## Risks / Trade-offs

- [Tap + hover sintético + click] → separar origen y ruta única de activación; evidencia en emulación touch y dispositivo híbrido simulado.
- [Partículas tapan la foto o quedan escondidas permanentemente] → contexto local de apilamiento y captura de fase inicial/intermedia/final.
- [Desbordamiento por glifos y rotación] → limitar destinos y puntos intermedios según viewport; comprobar ancho desplazable a 320 px y durante la animación.
- [Movimiento activo al cambiar preferencias] → cancelar Web Animations explícitamente, no confiar únicamente en `motion.css`.
- [Reentrada rápida corta la ráfaga anterior] → decisión intencional para responder siempre a la acción más reciente sin acumulación; no altera el conteo de una emisión por acción.
- [Emoji varía por SO/font] → exigir miembros del conjunto y movimiento, no igualdad pixel-perfect del glifo.

## Migration Plan

Después de revisión técnica y aprobación humana, agregar molecule/controlador y sustituir el nodo de foto/estilos en un mismo cambio, sin compatibilidad con selectores de efectos antiguos porque no existen. Validar antes del cierre. Rollback acotado: restaurar imagen y estilos previos y retirar los dos archivos nuevos; no hay migraciones de datos.

### Evidencia de aceptación en apply

Usar servidor local en puerto libre del worktree y navegador real; registrar navegador, viewport, modalidad de entrada, preferencia, resultado y capturas/frame secuenciales en evidencia del change. No instalar un framework e2e para esta tarea.

1. Desktop 1280 × 900: medir imagen 120 × 120 incluyendo borde; entrada, permanencia por más de 1.6 s, click sin nueva emisión, salida/reentrada; secuencia visual origen oculto, crecimiento, ascenso y desaparición. Comparar Hero antes/después fuera del retrato, también en tema oscuro sin modificarlo.
2. Mobile touch 390 × 844 y ancho 320 px: imagen 90 × 90; un tap = una emisión, segundo tap = nueva emisión, scroll iniciado en foto no emite, sin doble activación ni overflow horizontal durante ráfaga. Comprobar 767 px = 90 y 768 px = 120.
3. Teclado: Tab/foco visible, Enter y Espacio individualmente generan una ráfaga, mantener tecla no causa emisión continua; no desplazamiento por Espacio sobre botón, foco retenido y CTA accesible. Inspeccionar nombre/rol del botón y ausencia de emojis en árbol accesible.
4. Reduce desde carga en desktop y mobile: hover/tap/teclado no crean movimiento. Cambiar a reduce durante emisión cancela y elimina partículas; volver a no-preference no autoemite y próxima acción funciona.
5. Ráfagas rápidas y varios ciclos: hasta 12 nodos decorativos, limpieza al finalizar, sin errores de consola, capa no intercepta control/CTA y Hero no salta durante la animación. Sin JS conserva imagen y contenido.
6. Marcar tasks solo con evidencia. Cerrar con `pnpm agent:verify hero-emoji-burst`, que ejecuta `pnpm check` y `pnpm build`; conservar el recibo y referenciar la evidencia funcional, sin repetir checks si no hay cambios posteriores.

### Handoff de propuesta

Modelo de esta sesión: `openai-codex/gpt-6-astra`. Rama y change: `hero-emoji-burst`. Worktree: `/Users/hectorreyes/orca/workspaces/portfolio-hector-creative/hero-emoji-burst`. Coordinador: `term_59f10d37-2224-4373-85d3-6693d1981b86`; worker: `term_b999e7eb-42cc-4d6f-b92f-1045a4d73b27`; task: `task_a47bf810955a`; dispatch: `ctx_29a50cfb3fb0`. El hash final y resultado de `agent:ready` se entregan por Orca para evitar autorreferencia en archivos hasheados. Siguiente fase: revisión técnica en terminal propia; no hay aprobación ni implementación en esta entrega.
