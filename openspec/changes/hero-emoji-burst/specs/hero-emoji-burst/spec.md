## Purpose

Ofrecer una interacción decorativa accesible en la fotografía del Hero mediante ráfagas de emojis bajo demanda, preservando el diseño del portafolio y las preferencias de movimiento de cada visitante.

## ADDED Requirements

### Requirement: Fotografía responsive sin regresión visual

La fotografía del Hero SHALL medir exactamente 120 × 120 CSS px de caja exterior, incluido su borde, en viewports de ancho igual o mayor a 768 px, y 90 × 90 CSS px hasta 767 px. SHALL conservar asset, texto alternativo, borde circular, recorte, sombra y separación adaptable respecto al nombre. El resto del contenido, estilos y navegación del Hero SHALL permanecer sin cambios, salvo el desplazamiento natural por el tamaño nuevo. El efecto SHALL NOT provocar cambios de layout o scroll horizontal.

#### Scenario: Tamaño desktop y límite superior
- **WHEN** se muestra el Hero a 1280 px o exactamente 768 px de ancho de viewport
- **THEN** la caja exterior de la imagen mide 120 × 120 CSS px y conserva su apariencia circular

#### Scenario: Tamaño mobile y límite inferior
- **WHEN** se muestra el Hero a 390 px, 320 px o exactamente 767 px de ancho de viewport
- **THEN** la caja exterior de la imagen mide 90 × 90 CSS px sin desbordamiento horizontal, también durante una ráfaga

#### Scenario: Estabilidad durante animación
- **WHEN** se emite una ráfaga con movimiento permitido
- **THEN** las posiciones del nombre, bio y CTA no cambian por la presencia de partículas, y el CTA mantiene su navegación

### Requirement: Una ráfaga por entrada de hover

Con movimiento permitido, el control SHALL emitir una sola ráfaga al entrar un mouse con capacidad hover en la fotografía. SHALL NOT emitir al cargar, enfocar, mover el cursor dentro, mantener el hover o hacer click con ese mouse mientras permanece encima.

#### Scenario: Hover persistente y click
- **WHEN** un mouse entra en la fotografía, permanece más allá de la duración de la ráfaga, se mueve dentro y hace click sin salir
- **THEN** se produce exactamente una emisión en la entrada y ninguna emisión adicional por esas acciones

#### Scenario: Salida y reentrada
- **WHEN** el mouse sale de la fotografía y vuelve a entrar
- **THEN** se produce una nueva ráfaga, incluso si la anterior aún no había terminado

### Requirement: Activación touch sin duplicados

Con movimiento permitido, el control SHALL emitir una sola ráfaga por tap válido, incluido un dispositivo híbrido con mouse conectado. Los eventos hover o mouse de compatibilidad derivados del mismo tap SHALL NOT producir otra ráfaga. Un gesto de scroll o cancelado SHALL NOT activar el efecto. El tamaño visual SHALL depender del viewport y no del tipo de entrada.

#### Scenario: Tap y eventos de compatibilidad
- **WHEN** una persona toca y suelta la fotografía en mobile o en una pantalla táctil híbrida
- **THEN** aparece exactamente una ráfaga aunque el navegador también produzca eventos de compatibilidad

#### Scenario: Scroll iniciado en la foto
- **WHEN** la persona inicia un desplazamiento táctil sobre la foto o cancela el gesto sin completar una activación
- **THEN** no se produce ninguna ráfaga y la interacción no impide el scroll normal

### Requirement: Acceso por teclado y semántica

El control SHALL ser un botón con nombre accesible que describa la acción asociada a la fotografía, foco visible y activación por Enter/Espacio. Con movimiento permitido SHALL emitir una ráfaga por activación, sin duplicarla entre eventos de teclado y click. Mantener una tecla SHALL NOT generar emisión continua. La acción SHALL conservar el foco y no desplazar la página al usar Espacio sobre el botón. Las partículas SHALL ser decorativas, no anunciadas ni enfocables.

#### Scenario: Enter y Espacio
- **WHEN** la persona llega con Tab al control y activa Enter, luego suelta la tecla y activa Espacio
- **THEN** cada activación produce una sola ráfaga, el foco permanece visible en el botón y Espacio no desplaza la página

#### Scenario: Tecla sostenida
- **WHEN** la persona mantiene Enter o Espacio y el navegador produce repetición de teclado
- **THEN** la pulsación sostenida produce como máximo una ráfaga, no un flujo repetido

#### Scenario: Tecnología asistiva
- **WHEN** se inspecciona el árbol accesible y se activa el botón con tecnología asistiva
- **THEN** existe un control con rol y nombre de acción comprensibles, su activación produce una sola ráfaga si se permite movimiento y ningún emoji aparece como contenido anunciado

### Requirement: Ráfaga decorativa aleatoria detrás del retrato

Cada ráfaga SHALL utilizar exclusivamente miembros completos del conjunto 💻🛒🔍🤖📊🏗️🐕🏘️💰📝🇲🇽⚙️🧩📈🗂️🚀🧠📱💼🌐. Las partículas SHALL nacer en una zona ocluida detrás de la fotografía, crecer, ascender con desplazamientos laterales y rotación, y desaparecer por completo. Tamaños, trayectorias, rotaciones, duraciones y retrasos SHALL sortearse por partícula en cada emisión; no se exige una secuencia única ni agotar el conjunto. La capa SHALL permanecer no interactiva y fuera del flujo.

#### Scenario: Secuencia visible
- **WHEN** se observa una emisión en sus fases inicial, intermedia y final
- **THEN** el origen queda oculto por la imagen, los emojis emergen creciendo y subiendo con variaciones laterales y de rotación, y al final desaparecen sin cubrir la cara al atravesar su área

#### Scenario: Conjunto permitido y variación
- **WHEN** se inspeccionan varias ráfagas y sus parámetros de movimiento
- **THEN** todos los glifos son miembros completos del conjunto permitido, incluida la bandera mexicana sin fragmentar, y cada una de las seis dimensiones aleatorias se obtiene de un rango, no de un valor único para toda emisión

#### Scenario: Capa no interactiva
- **WHEN** partículas cruzan una zona sobre un control o el cursor sale de la fotografía por un área con partículas
- **THEN** no interceptan taps, clicks o foco ni extienden el área hover de la fotografía

### Requirement: Movimiento reducido sin partículas

Con `prefers-reduced-motion: reduce`, el efecto SHALL NOT crear partículas ni movimiento alternativo para hover, tap o teclado. SHALL mantener fotografía, dimensiones y acceso al foco. Al cambiar a reduce durante una ráfaga SHALL detener el movimiento y retirar las partículas inmediatamente. Al volver a no-preference SHALL esperar una nueva activación.

#### Scenario: Preferencia activa desde carga
- **WHEN** el Hero carga con reduce y se usa hover, tap o Enter/Espacio, en desktop o mobile
- **THEN** no hay partículas ni animación y la imagen conserva su tamaño y control accesible

#### Scenario: Cambio dinámico de preferencia
- **WHEN** una ráfaga está activa y se cambia a reduce, luego se vuelve a no-preference
- **THEN** la ráfaga se cancela y desaparece al activar reduce, no se reanuda automáticamente y la siguiente activación con movimiento permitido funciona

### Requirement: Recursos acotados y mejora progresiva

Una nueva activación SHALL sustituir la ráfaga anterior sin colas, manteniendo como máximo 12 partículas simultáneas. Las partículas SHALL retirarse al finalizar o cancelar; una emisión no interrumpida SHALL quedar limpia antes de 1.6 segundos. El efecto SHALL NOT producir errores de consola ni dejar trabajo recurrente en reposo. Sin JavaScript o sin soporte de animación, la fotografía y contenido del Hero SHALL seguir disponibles sin depender del efecto.

#### Scenario: Activaciones rápidas y reposo
- **WHEN** se realizan diez activaciones válidas rápidas y luego se espera 1.6 segundos desde la última
- **THEN** cada activación sustituye la anterior, nunca hay más de 12 partículas, al final no queda ninguna y no hay errores de consola

#### Scenario: Sin capacidad de ejecutar el efecto
- **WHEN** JavaScript está deshabilitado o la API de animación no está disponible
- **THEN** el retrato mantiene tamaño, apariencia y texto alternativo, el contenido y CTA son utilizables y no aparece un error que interrumpa la página
