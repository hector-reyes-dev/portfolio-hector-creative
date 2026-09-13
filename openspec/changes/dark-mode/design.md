## Context

Ver `proposal.md` para motivación y alcance. Inspección del repositorio:

- `BaseLayout.astro` importa CSS global y no ejecuta resolución temprana; `index.astro` declara un `theme-color` fijo `#F9F9F9` e inicializa features mediante script Astro.
- `features/theme-switcher/` solo contiene `.gitkeep`. No hay persistencia de tema existente que migrar.
- `Dock.astro` compone `DockItem.astro`; `features/dock/init.ts` selecciona todos los `.dock__item` y asigna `aria-current` por `data-section`.
- `features/switch-toggle/init.ts` alterna `aria-checked` sobre cualquier `.switch`; el botón de tema no debe usar esa clase.
- `themes/light.css` y `themes/dark.css` definen `--app-*` en `@layer base`. `portfolio/tokens.css` redefine los seis tokens sin capa y añade la paleta legacy: gana frente a ambos temas. `global.css` declara además `color-scheme: light dark`.
- Hay blancos/fondos/hover/sombras literales en `buttons.css`, `cards.css`, `base.css`, `experiments.css` y `dock-window.css`, incluidos fallbacks sin backdrop-filter. `motion.css` ya aplica reduced motion globalmente.
- No existe suite unitaria/e2e de producto; `pnpm check` analiza Astro/TypeScript y `pnpm build` compila. La prueba funcional debe ejercitar el navegador real.

## Goals / Non-Goals

**Goals:** Una sola resolución inicial y un solo controlador de estado, paleta semántica común a utilidades y CSS legacy, integración nativa Astro sin hidratación de framework y sin dependencia de red para escoger tema.

**Non-Goals:** No añadir selector de tres estados, sincronización entre pestañas, persistencia del switch de experimentos, cambios de contenido ni infraestructura de pruebas. La aprobación descrita en el encargo es de comportamiento; no sustituye el recibo humano `review.json` del plan.

## Decisions

### 1. Resolución temprana compartida con el controlador

Crear `src/features/theme-switcher/bootstrap.js` como entrada JavaScript autocontenida, sin imports ni exportaciones runtime. Desde el frontmatter de `BaseLayout.astro`, importar su texto mediante `?raw` y emitirlo con `<script is:inline set:html={...}>` en head, antes del contenido pintable. Es código local de confianza, nunca contenido de usuario. El script no consulta DOM del dock ni depende del bundle diferido, estilos computados o fetching. Documentar sus tipos mediante JSDoc y declarar el contrato de consumo TypeScript en la feature; no añadir un compilador ni una dependencia para este arranque pequeño.

La resolución, aplicación y persistencia viven únicamente en esa feature. El bootstrap expone un controlador tipado mínimo en `window.__portfolioTheme` con `getTheme(): 'light' | 'dark'`, `toggle(): void` y suscripción al tema efectivo para actualizar UI; `init.ts` consume ese controlador sin volver a leer storage ni resolver por segunda vez. Declarar su contrato TypeScript en la feature y ampliar Window allí. La inicialización del controlador y el binding del botón deben ser idempotentes; no duplicar listeners al reinicializar.

Alternativas: un script Astro procesado sería más simple pero puede llegar después del primer pintado; duplicar un resolver en head y otro en la feature introduce divergencia. Se elige una sola entrada temprana reutilizada por el adaptador visual, sin store genérico ni eventos globales ajenos al tema.

### 2. Estado y límites de errores

Clave local `theme`, valores exactos `light` y `dark` (sin normalizar mayúsculas, espacios, JSON o valores arbitrarios). Mantener `effectiveTheme` y `manualPreference` en memoria; origen manual incluye una preferencia persistida válida.

| Entrada/evento | Resultado | Seguimiento de SO | Escritura |
| --- | --- | --- | --- |
| Storage válido | Valor guardado | No | Ninguna |
| Storage ausente, inválido o lectura fallida | Oscuro si media query coincide; claro en otro caso | Sí, si API disponible | Ninguna |
| matchMedia ausente o falla | Claro, salvo preferencia válida | No disponible | Ninguna |
| Cambio de SO sin elección manual | Valor actual de media query | Sí | Ninguna |
| Activación del botón | Inverso del tema efectivo | No desde ese instante | Intentar `setItem('theme', valor)` |
| Escritura fallida | Mantener elección manual en memoria | No | No reintentar ni revertir |
| Recarga tras escritura fallida | Resolver nuevamente con los datos realmente disponibles | Según resolución | Ninguna |

Proteger acceso a localStorage, getItem/setItem y consulta de media query por separado. No borrar storage ni claves ajenas; un valor inválido no cuenta como elección. Crear listener del SO cuando sea posible y retirarlo o ignorarlo tras elección manual, incluyendo eventos encolados. Sin preferencias válidas, una transición del sistema entre head y montaje del dock debe reflejarse al montar mediante `getTheme()`. Fallos de storage no interrumpen las demás features. No se promete persistencia donde el navegador la prohíbe.

### 3. Un único estado DOM y metadatos

Usar `html.dark` como señal oscura y `html.light` como clara, mutuamente excluyentes. Aplicar y retirar esas clases con `classList.add`/`classList.remove`; nunca asignar `document.documentElement.className`, para preservar clases ajenas como `has-window`, usada por la ventana de caso para bloquear el scroll. Ausencia de JS: claro legible por CSS y botón oculto hasta enlazarlo, sin presentar un control inerte. `:root` es fallback claro; `:root.dark` debe ganar la cascada sin `!important`. Fijar `color-scheme` a `light` o `dark`, no `light dark`, para que controles nativos sigan la selección manual.

Mover el único meta `theme-color` de `index.astro` a `BaseLayout.astro`, antes del bootstrap, con fallback `#F9F9F9`. El controlador lo actualiza en la misma aplicación que las clases: claro `#F9F9F9`, oscuro `#020617` (superficie `2 6 23` existente). No crear metas duplicados ni confiar únicamente en atributos media, que ignorarían la preferencia manual. No animar el cambio global de tema ni el arranque.

### 4. UI Atomic y convivencia con el dock

Nuevo átomo `src/components/atoms/ThemeToggle.astro`: botón `type="button"`, atributo exclusivo `data-theme-toggle`, nombre accesible estable «Modo oscuro» y `aria-pressed` que expresa si está activo. Icono decorativo con `aria-hidden="true"`; puede usar SVG local sin ampliar un sprite ajeno. La elección de icono no sustituye el nombre. Sin imports de features, storage ni listeners en el átomo.

`Dock.astro` compone el átomo después de los enlaces. Clase exclusiva `.dock__theme-toggle`, nunca `.dock__item`, `.switch` ni `data-section`; conservar separados el estado de sección y el tema. `index.astro` llama `initThemeSwitcher()` desde `@features/theme-switcher/init` con el resto de inicializadores. El adaptador muestra el botón solo después de sincronizarlo y enlazarlo, actualiza `aria-pressed` en cambios de SO y mantiene el foco al alternar. Teclado nativo Enter/Espacio, sin keydown duplicado.

En `dock-window.css`, compartir presentación mediante lista de selectores, no fingir que el botón es enlace del scrollspy. Mantener área táctil mínima 44×44 y ancho del dock dentro del viewport a 320 px. En móvil, permitir ocultar visualmente la etiqueta del enlace activo conservando su nombre accesible antes que reducir blancos táctiles; conservar safe-area y espacio inferior del contenido. Sin nuevas animaciones; respetar las reglas existentes de reduced motion.

### 5. Fuente de tokens y cutover de la paleta legacy

Concentrar valores cromáticos en `themes/light.css` (`:root`, `:root.light`) y `themes/dark.css` (`:root.dark`) dentro de la misma capa base. Quitar todas las redefiniciones cromáticas competidoras sin capa en `portfolio/tokens.css`; conservar ahí fuentes, tamaños, radios, blur y easing. Definir aliases legacy que referencien tokens semánticos donde el rol coincide, sin una segunda paleta divergente. Conservar `@theme inline` como puente Tailwind y hacer que `--shadow-soft` responda al tema si se utiliza.

El tema claro parte de los valores efectivos de `portfolio/tokens.css`, no de los antiguos valores claros sobrescritos; así se preserva la apariencia actual. El oscuro conserva la base de `themes/dark.css` (`--app-surface/elevated/text/muted/accent/border`) y añade roles faltantes. Ajustar tonos únicamente si lo exige contraste medido. Cobertura obligatoria:

| Roles | Tokens/consumidores |
| --- | --- |
| Fondo, superficie elevada y relleno | `--app-surface`, `--app-elevated`, `--bg`, `--bg-soft`, `--fill`; body, cards, experimentos y skip-link |
| Texto y descripción | `--app-text`, `--app-muted`, `--ink`, `--ink-2`, `--ink-3`, `--desc` |
| Bordes y separación | `--app-border`, `--card-border`, `--line`, `--line-strong` |
| Acento y estados | `--app-accent`, `--accent`, `--accent-ink`, `--accent-soft`, más roles para texto sobre acento, hover, pressed y foco |
| Cristal y fallback | `--glass-nav`, `--glass-window`, `--glass-scrim`, más sus variantes opacas sin backdrop-filter y cabecera de ventana |
| Elevación | `--card-shadow`, `--shadow-sm`, `--shadow-md`, `--shadow-window`, `--shadow-dock`, sombras de botones |
| Controles y overlays | Fondo inactivo del switch, perilla, badges sobre media, hover/cierre de ventana, selección de texto |

Reemplazar literales que representan esos roles en `components/buttons.css`, `components/cards.css`, `portfolio/base.css`, `portfolio/experiments.css` y `portfolio/dock-window.css`; revisar `global.css` para fondo radial y sombras. Corregir el orden de los fallbacks `@supports not` si las reglas posteriores los pisan. No basta con cambiar `--app-*`.

Conservar deliberadamente gradientes ilustrativos de proyectos en `cards.css`, logos de Kavak/Chedraui en `experience.css`, imágenes, colores propios de marca y negro de las máscaras (no es una superficie). No invertir imágenes globalmente. Sobre gradientes, medir badges y controles con su fondo real. El stroke fijo de marca en `IconSprite.astro` solo requiere ajuste si falla su legibilidad funcional; no recolorear marcas por uniformidad.

### 6. Evidencia de aceptación

En apply, usar servidor local con puerto libre y navegador real. Registrar resultados y capturas en `openspec/changes/dark-mode/`, con navegador, viewport, emulación, pasos y resultado; no declarar navegación/contraste probados con check/build. Cubrir los escenarios de `specs/theme-preference/spec.md`, recargas con bundle retrasado y capturas del primer frame para ambos valores guardados opuestos al SO. Bloquear storage antes de navegar para ejercitar SecurityError y fallo de escritura; verificar que experimentos y navegación siguen operando.

Medir contraste WCAG AA: 4.5:1 texto normal, 3:1 texto grande e indicadores/controles necesarios contra colores adyacentes; en vidrio incluir composición real, no solo hex nominal. Revisar foco, hover, pressed, activos, ventanas abiertas/cerradas y fallbacks sin backdrop-filter. Capturas a 320, 375, 768 y 1440 px en ambos temas, más zoom 200% y reduced motion. Una prueba temporal de comportamiento para las transiciones puede complementar, no reemplazar, el navegador; conservar regresión solo para un fallo plausible como storage bloqueado o manual frente a evento de SO. No incorporar una suite nueva por trámite.

## Risks / Trade-offs

- Cascada sin capas puede neutralizar `.dark` → eliminar las definiciones cromáticas duplicadas y verificar colores computados tanto legacy como Tailwind.
- Vidrio y acento cian pueden reducir contraste de blancos fijos → texto sobre acento es un rol propio, contrastar estados y fondos reales antes de aceptar.
- Script temprano bloquea brevemente parsing → mantener entrada pequeña, síncrona y sin imports/red; no esperar al bundle.
- Storage bloqueado impide recordar entre cargas → conservar elección en memoria, explicar el límite en evidencia sin prometer persistencia imposible.
- Dock más ancho → comprobar todas las secciones activas a 320 px; ocultar etiquetas visuales en breakpoint compacto, no controles ni nombres accesibles.
- JS deshabilitado no resuelve preferencias → fallback claro usable, control oculto, sin ampliar alcance a CSS automático divergente.

## Migration Plan

1. Revisión humana y `pnpm agent:approve dark-mode`; apply separado en este mismo worktree.
2. Implementar controlador temprano y adaptador visual; después realizar cutover completo de tokens/consumidores sin compatibilidad duplicada.
3. Ejercitar aceptación de navegador, corregir hallazgos y registrar evidencia; completar tareas solo tras observar sus resultados.
4. Cerrar con `pnpm agent:verify dark-mode`, revisión del diff y aceptación funcional. Archive/sync corresponde al cierre coordinado posterior, no a esta propuesta.
5. Si se requiere rollback, revertir conjuntamente integración de bootstrap, botón y paleta tras autorización; la clave `theme` remanente es inocua y no se borran preferencias ajenas.
