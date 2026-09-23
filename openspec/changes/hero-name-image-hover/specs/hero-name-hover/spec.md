# hero-name-hover Specification

## Purpose

Ofrecer una interacción decorativa de puntero fino sobre el nombre del Hero (“Héctor Reyes”), sustituyendo cada letra por un tile visual aleatorio mientras el cursor permanece encima, sin comprometer el nombre accesible, el layout ni las preferencias de movimiento del visitante.

## Requirements

### Requirement: Sustitución de letra por tile aleatorio en hover de puntero fino

Cada uno de los 11 caracteres del `h1.hero__name` (“é” cuenta como carácter propio, el espacio queda excluido) SHALL exponer exactamente 2 variantes visuales predefinidas. Al recibir `pointerenter` con `event.pointerType === 'mouse'` bajo `(hover: hover) and (pointer: fine)`, el sistema SHALL seleccionar una de las 2 variantes de esa letra mediante `Math.random` y mostrarla superpuesta en la misma caja del carácter, sin desplazar el texto circundante. La selección SHALL ser independiente en cada activación, de modo que hovers repetidos sobre la misma letra puedan producir cualquiera de las 2 variantes.

#### Scenario: Activación sobre una letra con mouse
- **WHEN** un puntero de tipo mouse entra en la caja de una letra del nombre bajo `(hover: hover) and (pointer: fine)`
- **THEN** aparece uno de los 2 tiles definidos para esa letra, superpuesto sobre su misma posición, sin mover las letras adyacentes

#### Scenario: Variación entre activaciones repetidas
- **WHEN** se hace hover diez veces seguidas sobre la misma letra, saliendo y reentrando cada vez
- **THEN** a lo largo de las activaciones aparecen ambas variantes de esa letra, sin que una selección determine la siguiente

### Requirement: Restauración con demora intencional al salir

Al recibir `pointerleave` sobre una letra con tile activo, el sistema SHALL iniciar la restauración del texto original tras un retraso perceptible usando el token de duración existente `release` (180ms); la restauración SHALL NOT ser instantánea. Una reentrada del puntero antes de completarse la restauración SHALL cancelar el temporizador pendiente y volver a mostrar un tile (posiblemente una nueva selección aleatoria) sin parpadeo del texto original.

#### Scenario: Salida simple
- **WHEN** el puntero sale de una letra con tile visible y no vuelve a entrar
- **THEN** el tile permanece visible durante el retraso de 180ms y luego la letra original se restaura con una transición suave, no un corte abrupto

#### Scenario: Reentrada durante la demora de restauración
- **WHEN** el puntero sale de una letra y reentra antes de que se cumplan los 180ms de retraso
- **THEN** la restauración pendiente se cancela, no se llega a mostrar el texto original entre medio, y se muestra un tile de esa letra

### Requirement: Texto semántico y espacio preservados en el h1

El `h1.hero__name` SHALL conservar un único nodo de texto accesible cuyo contenido, tras cualquier extracción que descarte etiquetas, sea exactamente “Héctor Reyes”, incluyendo el nodo de texto del espacio entre “Héctor” y “Reyes”. La división en spans por letra SHALL NOT introducir texto adicional, texto oculto (`sr-only`), ni colapsar el espacio entre palabras. El overlay de tiles SHALL NOT alterar ni duplicar el contenido textual accesible del `h1` en ningún estado de hover.

#### Scenario: Extracción de texto tras el split en spans
- **WHEN** se extrae el texto del `h1.hero__name` descartando etiquetas, en reposo y durante un hover activo sobre cualquier letra
- **THEN** el resultado es exactamente “Héctor Reyes”, con un único espacio entre ambas palabras y sin texto adicional

#### Scenario: Unicidad del h1 y ausencia de sr-only
- **WHEN** se inspecciona el árbol de accesibilidad de la sección Hero
- **THEN** existe exactamente un `h1`, su nombre accesible es “Héctor Reyes” y no contiene nodos de texto marcados como solo para lectores de pantalla

### Requirement: Tiles decorativos sin impacto en semántica ni foco

Los tiles superpuestos SHALL ser puramente decorativos: SHALL usar `aria-hidden="true"` o exponerse vía `background-image` sin elemento `<img>` con `alt` significativo, SHALL NOT llevar `role`, `tabindex` ni comportarse como control interactivo, y SHALL NOT recibir foco de teclado en ningún momento. La interacción completa SHALL ser exclusivamente por puntero; ningún atajo de teclado SHALL activar o recorrer los tiles.

#### Scenario: Tecnología asistiva ignora los tiles
- **WHEN** se recorre el Hero con un lector de pantalla o se inspecciona el árbol accesible durante un hover activo
- **THEN** los tiles no se anuncian como contenido, imagen o control, y el foco de teclado nunca se detiene en un tile

#### Scenario: Navegación por teclado sin efecto de tiles
- **WHEN** se recorre la página con Tab hasta y a través del nombre del Hero
- **THEN** ningún tile aparece, se activa ni recibe foco; el `h1` no es un destino de tabulación nuevo

### Requirement: Alcance limitado a puntero fino, sin fallback táctil

El efecto SHALL activarse únicamente bajo `(hover: hover) and (pointer: fine)` combinado con `event.pointerType === 'mouse'` en el listener. En dispositivos táctiles o con `(hover: none)` — incluidos híbridos que reciben un tap — el nombre SHALL permanecer estático en todo momento, sin mostrar tiles, sin quedar una letra “pegada” tras un tap, y sin bloquear el scroll o cualquier otra interacción de la página.

#### Scenario: Tap en dispositivo táctil
- **WHEN** una persona toca una letra del nombre en un viewport de 390px o 320px con `(hover: none)`
- **THEN** no aparece ningún tile, el nombre permanece estático y el toque no interfiere con scroll u otras interacciones

#### Scenario: Híbrido con mouse conectado
- **WHEN** un dispositivo con `(hover: hover) and (pointer: fine)` disponible recibe un evento cuyo `pointerType` no es `mouse`
- **THEN** ese evento no activa el efecto; solo un puntero de tipo mouse bajo esas media queries produce el tile

### Requirement: Movimiento reducido deshabilita el efecto por completo

Con `prefers-reduced-motion: reduce`, el sistema SHALL NOT crear tiles, transiciones ni retraso de restauración en ningún punto del ciclo de hover; el nombre SHALL permanecer estático como en el estado sin JavaScript. Un cambio dinámico a `reduce` mientras un tile está visible SHALL retirarlo de inmediato sin esperar el retraso de 180ms; al volver a `no-preference`, el efecto SHALL requerir una nueva activación de hover, sin reanudar automáticamente.

#### Scenario: Carga con preferencia reducida activa
- **WHEN** el Hero carga con `prefers-reduced-motion: reduce` y se hace hover sobre cualquier letra con mouse y puntero fino
- **THEN** ningún tile aparece, no hay transición ni retraso, y el nombre se muestra igual que sin el módulo cargado

#### Scenario: Cambio dinámico de preferencia con tile activo
- **WHEN** un tile está visible por hover y la preferencia cambia a `reduce` durante la demora de restauración
- **THEN** el tile se retira de inmediato sin esperar los 180ms, y una reactivación posterior con `no-preference` restablece el comportamiento de hover normal

### Requirement: Sin cambio de layout en ningún breakpoint

El overlay de tiles SHALL ocupar exactamente la caja de su letra (`position: relative` en el span, tile absoluto dentro), usando unidades relativas (`em`/`ch`) de modo que la escala del nombre a 56px (≥768px) y 40px (<768px) permanezca intacta. La presencia o ausencia de un tile activo SHALL NOT provocar reflow, scroll horizontal ni cambio en el ancho de columna de 520px, en ninguno de los viewports 320, 390, 768 y 1280px.

#### Scenario: Hover sin reflow en desktop
- **WHEN** se hace hover sobre varias letras consecutivas a 1280px y 768px
- **THEN** la posición del resto del nombre, la bio y el CTA no cambia, y no aparece scroll horizontal

#### Scenario: Escala mobile con nombre a 40px
- **WHEN** se revisa el Hero a 390px y 320px, incluido el estado sin hover (touch)
- **THEN** el nombre mantiene su tamaño de 40px, sin overflow horizontal y sin diferencia de layout respecto al estado antes de este cambio

### Requirement: Tiles con estilo de sistema y contrato de imágenes futuras

Las 22 variantes de tile (11 letras × 2) SHALL construirse únicamente con tokens de color existentes (`--accent`, `--accent-soft`, superficies canvas/elevated/fill), sin introducir nuevos tokens de color, radio, sombra o duración. Los tiles SHALL considerarse el visual definitivo de esta entrega, no un placeholder temporal a reemplazar en el mismo cambio; un contrato documentado (nomenclatura y ruta bajo `public/`, escalado en unidades relativas) SHALL permitir sustituir cada tile por una imagen real en una entrega posterior sin cambiar la lógica de activación, selección aleatoria ni restauración.

#### Scenario: Tiles usan solo tokens existentes
- **WHEN** se inspeccionan los estilos de las 22 variantes de tile
- **THEN** todos los colores, sombras y duraciones provienen de tokens ya definidos en `tokens.css` y `motion.css`, sin valores nuevos hardcodeados

#### Scenario: Sustitución futura por imagen real
- **WHEN** se reemplaza un tile de color por una imagen siguiendo el contrato documentado de nombre y ruta
- **THEN** el reemplazo no requiere cambios en el listener de `pointerenter`/`pointerleave`, en la selección aleatoria ni en el retraso de restauración

### Requirement: Validación cruzada visual, accesibilidad y responsive

Antes de considerarse completa, la implementación SHALL verificarse con evidencia de navegador cubriendo: hover y leave con demora visible en desktop, aparición de ambas variantes por letra en activaciones repetidas, estado táctil estático a 390/320px, estado con `prefers-reduced-motion: reduce`, y los cuatro breakpoints 320/390/768/1280px sin cambios de layout. La suite automatizada `pnpm agent:test` (`pnpm check && pnpm build`) SHALL permanecer en verde, incluyendo `navigation-semantics.test.ts` (un único `h1`, texto exacto “Héctor Reyes”) y `portfolio-consistency.test.ts`.

#### Scenario: Evidencia de navegador completa
- **WHEN** se ejecuta la matriz de verificación manual (hover/leave, ambas variantes, touch, reduced motion, 4 breakpoints)
- **THEN** cada punto de la matriz se confirma visualmente y ninguno reporta regresión respecto al comportamiento previo del Hero

#### Scenario: Suite automatizada en verde
- **WHEN** se ejecuta `pnpm agent:test` tras aplicar el cambio
- **THEN** `navigation-semantics.test.ts` y `portfolio-consistency.test.ts` pasan sin modificaciones a sus aserciones existentes
