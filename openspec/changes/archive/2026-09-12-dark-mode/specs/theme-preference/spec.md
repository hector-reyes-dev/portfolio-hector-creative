## Purpose

Permitir que cada visitante use un tema claro u oscuro completo y accesible, respetando su preferencia inicial y conservando su elección manual sin depender de que el almacenamiento esté disponible.

## ADDED Requirements

### Requirement: Preferencia inicial determinista

El sitio SHALL escoger el primer tema usando el valor exacto válido `light` o `dark` de la clave localStorage `theme`; si no existe uno válido o no puede leerlo, SHALL usar `prefers-color-scheme`, con claro como fallback cuando la consulta no esté disponible o falle. Un valor inválido MUST NOT convertirse en preferencia manual ni impedir el acceso al sitio.

#### Scenario: Preferencia guardada domina al sistema
- **WHEN** el visitante carga con `theme=dark` y SO claro, o `theme=light` y SO oscuro
- **THEN** el primer tema es el guardado en cada caso, independientemente del SO.

#### Scenario: Primera visita sin preferencia
- **WHEN** no existe la clave y el SO indica oscuro o claro
- **THEN** el primer tema coincide con el SO y no se escribe una elección manual automáticamente.

#### Scenario: Valores inválidos
- **WHEN** la clave contiene un valor distinto de los dos admitidos, incluyendo vacío, `DARK`, `system` o JSON
- **THEN** el sitio usa la preferencia del SO como si no hubiera elección, sin excepción visible ni cambios en claves ajenas.

#### Scenario: Lectura de storage bloqueada
- **WHEN** el acceso a localStorage o su lectura lanza una excepción y el SO indica oscuro
- **THEN** el sitio aparece oscuro, permite interacción y no falla la inicialización de otras funciones.

#### Scenario: Preferencia del sistema no disponible
- **WHEN** no hay valor guardado válido y la consulta del SO está ausente o falla
- **THEN** el sitio aparece claro y permite alternancia manual.

### Requirement: Seguimiento del sistema hasta elección manual

El sitio SHALL seguir cambios de preferencia del SO mientras no tenga una elección manual válida. Una elección guardada o realizada durante la sesión MUST impedir que cambios posteriores del SO reemplacen el tema, incluso cuando no se pudo persistir la elección.

#### Scenario: Cambio automático durante la visita
- **WHEN** no existe elección manual y el SO cambia claro a oscuro y luego a claro
- **THEN** la apariencia y el estado accesible del control siguen cada cambio sin escribir una preferencia manual.

#### Scenario: Elección guardada permanece estable
- **WHEN** se carga una elección válida y después cambia el SO
- **THEN** el tema guardado permanece activo.

#### Scenario: Elección manual vence a cambios posteriores
- **WHEN** el visitante alterna manualmente y después cambia el SO, aun si el evento estaba encolado
- **THEN** permanece el tema elegido y no se actualiza el control a un estado distinto.

### Requirement: Alternancia manual y persistencia tolerante

El dock SHALL ofrecer un control binario que cambie al tema opuesto inmediatamente y persista el valor exacto en localStorage cuando sea posible. Un error de escritura MUST NOT revertir la elección ni reactivar seguimiento del SO durante esa sesión. El sitio MUST NOT borrar preferencias ajenas ni exigir storage para funcionar.

#### Scenario: Alternar y recargar
- **WHEN** el visitante activa el control desde claro, recarga con storage disponible y después alterna desde oscuro
- **THEN** la primera activación muestra y guarda oscuro, la recarga conserva oscuro y la siguiente activación muestra y guarda claro.

#### Scenario: Escritura rechazada
- **WHEN** guardar lanza una excepción después de la activación manual y luego cambia el SO
- **THEN** la elección permanece visible y operable durante la sesión sin excepción no controlada; una recarga resuelve de nuevo con el almacenamiento realmente disponible y el SO, sin prometer la escritura fallida.

### Requirement: Tema correcto desde el primer pintado

Con JavaScript habilitado, el sitio SHALL aplicar el tema resuelto antes de pintar contenido, sin mostrar primero el tema opuesto ni esperar al bundle de interacciones. SHALL mantener sincronizados el esquema de controles nativos y el único `theme-color` con el tema efectivo: `#F9F9F9` para claro y `#020617` para oscuro.

#### Scenario: Carga oscura con bundle retrasado
- **WHEN** se carga una preferencia oscura válida con SO claro y se retrasa el bundle principal
- **THEN** el primer frame con contenido usa fondo/texto oscuros coherentes, controles nativos oscuros y theme-color oscuro, sin frame claro intermedio.

#### Scenario: Carga clara contra sistema oscuro
- **WHEN** se carga una preferencia clara válida con SO oscuro y se retrasa el bundle principal
- **THEN** el primer frame con contenido y los controles nativos son claros, sin frame oscuro intermedio.

#### Scenario: Metadatos durante cambios
- **WHEN** cambia el tema por SO o control manual
- **THEN** el esquema nativo y el único theme-color pasan al mismo tema efectivo sin esperar una recarga.

#### Scenario: JavaScript deshabilitado
- **WHEN** el visitante abre la página sin JavaScript
- **THEN** el contenido sigue siendo legible en claro y no se presenta un control de tema inerte como operable.

### Requirement: Control accesible e independiente

El control SHALL ser un botón accesible por Tab, Enter y Espacio, con nombre estable «Modo oscuro», `aria-pressed=true` exclusivamente cuando el tema oscuro esté activo y foco visible que se conserve al alternar. Iconos decorativos MUST NOT duplicar su nombre. El tema SHALL ser independiente de la sección activa, navegación, ventanas de caso y switch de experimentos.

#### Scenario: Uso por teclado y tecnología de asistencia
- **WHEN** el visitante enfoca el control con Tab y activa una vez con Enter y otra con Espacio
- **THEN** cada activación alterna exactamente una vez, el foco permanece, no navega ni desplaza la página por Espacio y el nombre/estado anunciado corresponde al tema visible.

#### Scenario: Navegación y tema no comparten estado
- **WHEN** el visitante alterna el tema con una sección activa y luego navega entre secciones
- **THEN** los enlaces mantienen su función y estado de sección, el botón no recibe estado de sección actual y navegar no cambia el tema.

#### Scenario: Switch de experimentos independiente
- **WHEN** el visitante activa el switch de experimentos, alterna tema y vuelve a activar ese switch
- **THEN** cada control modifica solo su estado; experimentos no modifica preferencia de tema y alternar tema no modifica aria-checked del switch.

#### Scenario: Ventana de caso en ambos temas
- **WHEN** se abre, recorre y cierra una ventana de caso en cada tema
- **THEN** sus controles, contenido, foco y navegación conservan su funcionamiento y apariencia legible, sin restablecer el tema.
#### Scenario: Cambiar tema con ventana abierta
- **WHEN** el visitante abre una ventana de caso, alterna el tema y vuelve a interactuar con la ventana
- **THEN** `has-window`, el bloqueo de scroll, el foco y la navegación de la ventana permanecen intactos mientras cambia la paleta.

### Requirement: Cobertura visual y contraste de ambos temas

El sitio SHALL aplicar una paleta coherente a todas las superficies estructurales existentes, incluyendo utilidades de tema y paleta legacy, textos secundarios, bordes, tarjetas, experimentos, dock, botones, ventanas, overlays, foco, selección y estados hover/pressed/activos. SHALL cubrir también fallbacks sin backdrop-filter y preservar imágenes, máscaras y colores de marca intencionales sin inversión global. Texto normal MUST alcanzar 4.5:1, texto grande 3:1 e indicadores/controles visuales necesarios 3:1 respecto a los colores adyacentes conforme a WCAG AA.

#### Scenario: Revisión completa de superficies y estados
- **WHEN** se recorre toda la página en claro y oscuro, incluyendo estados hover, pressed, foco, sección activa y ventana abierta
- **THEN** no quedan superficies estructurales del tema opuesto y el texto/controles cumplen los umbrales medidos sobre su fondo real, incluidos vidrio y badges sobre imágenes.

#### Scenario: Navegador sin desenfoque de fondo
- **WHEN** backdrop-filter no está disponible en cualquiera de los temas
- **THEN** dock, ventana y scrim usan fallbacks del mismo tema con separación y legibilidad suficientes, sin volverse blancos en oscuro por colores fijos.

### Requirement: Responsive y movimiento reducido

El dock con el nuevo control SHALL permanecer dentro del viewport desde 320 px, mantener blancos táctiles de al menos 44×44 px para el control de tema y no ocultar contenido o foco por su nueva geometría. El cambio de tema SHALL ser inmediato, sin animación global, y SHALL respetar reduced motion sin añadir movimiento innecesario.

#### Scenario: Viewports y zoom
- **WHEN** se revisa cada tema a 320, 375, 768 y 1440 px, con cada sección activa, y se prueba zoom 200%
- **THEN** el dock no produce overflow horizontal, los controles y nombres accesibles permanecen disponibles, el foco no se recorta y se respetan safe-area y espacio inferior del contenido.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** se habilita prefers-reduced-motion y se alterna el tema mediante teclado y puntero
- **THEN** el cambio funciona sin nuevas animaciones, sin destello y sin pérdida de foco o controles.
