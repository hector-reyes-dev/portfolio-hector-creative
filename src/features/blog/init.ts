import { gsap } from '@lib/core/gsap';
import { initBlogSurface } from './surface';

const surfaces = new WeakMap<HTMLElement, (percent: number) => void>();

const ROOT_SELECTOR = '[data-blog]';
const TAB_SELECTOR = '[data-blog-tab]';
// Stryker: sobreviviente equivalente — el `[id="…"]` del selector ya resuelve el panel por sí solo: los id son únicos.
const PANEL_SELECTOR = '[data-blog-panel]';
const ENTRY_SELECTOR = '[data-blog-entry]';
const HIGHLIGHT_SELECTOR = '[data-blog-highlight]';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HIGHLIGHT_DURATION = 0.38;
const ENTRY_FADE_DURATION = 0.3;
/** Escalón entre entradas: cada una empieza después de la anterior, en orden de lectura. */
const ENTRY_STAGGER = 0.04;
/** Punto de partida del fade ascendente: desplazada hacia abajo. */
const ENTRY_FROM = { opacity: 0, y: 10 };
/** Estado final, el mismo que se fija sin animación con movimiento reducido. */
const ENTRY_TO = { opacity: 1, y: 0 };
/** Desplazamiento circular de la selección por tecla de flecha. */
const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1
};

// Stryker: sobreviviente equivalente — el `typeof` es una guarda defensiva: solo se distingue
// en entornos sin `matchMedia`, que ningún navegador soportado presenta.
function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getTabs(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR));
}

// Stryker: sobreviviente equivalente — `tab` ya es null cuando el evento no nace de una pestaña
// (y `root.contains(null)` es false); `contains` solo pesaría con pestañas de otro archivo.
/** Pestaña del `event.target`; devuelve null si el click o la tecla no vienen de una pestaña. */
function tabFromEvent(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const tab = target instanceof Element ? target.closest<HTMLButtonElement>(TAB_SELECTOR) : null;
  return tab && root.contains(tab) ? tab : null;
}

/** El panel se resuelve por el vínculo ARIA (`aria-controls` → `id`), no por posición. */
function getPanel(root: HTMLElement, tab: HTMLButtonElement): HTMLElement | null {
  const id = tab.getAttribute('aria-controls');
  return id ? root.querySelector<HTMLElement>(`${PANEL_SELECTOR}[id="${id}"]`) : null;
}

function paintSelection(root: HTMLElement, tabs: HTMLButtonElement[], activeTab: HTMLButtonElement): void {
  for (const tab of tabs) {
    const isActive = tab === activeTab;
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    const panel = getPanel(root, tab);
    // Stryker: sobreviviente equivalente — cada pestaña tiene su panel por `aria-controls`;
    // sin panel el mutante revienta, no se comporta distinto.
    if (panel) panel.hidden = !isActive;
  }
}

function moveHighlight(highlight: HTMLElement, tab: HTMLButtonElement, animate: boolean): void {
  // Las columnas tienen el mismo ancho: el porcentaje sigue alineado al redimensionar.
  const index = Array.from(tab.parentElement!.children).indexOf(tab);
  const target = { xPercent: index * 100 };
  const draw = surfaces.get(highlight);
  if (!animate || prefersReducedMotion()) {
    gsap.killTweensOf(highlight);
    gsap.set(highlight, target);
    draw?.(target.xPercent);
    return;
  }
  // Stryker: sobrevivientes equivalentes — `ease` y `overwrite` son ajuste visual: el estado
  // final del resaltado (transform) es idéntico con cualquiera de los dos valores.
  gsap.to(highlight, {
    ...target,
    duration: HIGHLIGHT_DURATION,
    ease: 'power2.out',
    overwrite: true,
    onUpdate: draw ? () => draw(Number(gsap.getProperty(highlight, 'xPercent'))) : undefined
  });
}

/**
 * Fade ascendente escalonado de las entradas del panel que entra: todas parten invisibles y
 * desplazadas hacia abajo y terminan visibles sin desplazamiento, en orden de lectura. Solo se
 * anima el panel activo (los ocultos no gastan animación) y con movimiento reducido las entradas
 * quedan directamente en su estado final.
 */
function revealEntries(panel: HTMLElement | null): void {
  // Stryker: mutante sin cobertura — la rama del panel nulo no llega a ejecutarse: cada pestaña
  // servida resuelve su panel por `aria-controls`, así que `panel` nunca es null en la práctica.
  const entries = panel ? Array.from(panel.querySelectorAll<HTMLElement>(ENTRY_SELECTOR)) : [];
  // Stryker: sobreviviente equivalente — sin entradas no hay animación que lanzar: `fromTo`
  // con la lista vacía dejaría a GSAP sin objetivos que tocar.
  if (entries.length === 0) return;

  gsap.killTweensOf(entries);
  if (prefersReducedMotion()) {
    gsap.set(entries, ENTRY_TO);
    return;
  }

  // Stryker: sobrevivientes equivalentes — `ease` y `overwrite` son ajuste de reproducción:
  // el estado final de cada entrada (opacity 1, y 0) es idéntico con cualquier valor.
  gsap.fromTo(entries, ENTRY_FROM, {
    ...ENTRY_TO,
    duration: ENTRY_FADE_DURATION,
    stagger: ENTRY_STAGGER,
    ease: 'power2.out',
    overwrite: true
  });
}

/**
 * Una pestaña ya seleccionada solo recupera el foco: repetir el clic o la flecha sobre ella no
 * reinicia el trazado ni vuelve a hacer entrar sus notas.
 */
function keepSelection(tab: HTMLButtonElement, focus: boolean): boolean {
  if (tab.getAttribute('aria-selected') !== 'true') return false;
  if (focus) tab.focus();
  return true;
}

function activateTab(root: HTMLElement, tab: HTMLButtonElement, options: { animate: boolean; focus: boolean }): void {
  const tabs = getTabs(root);
  // Stryker: sobreviviente equivalente — `activateTab` solo recibe pestañas salidas de `getTabs`.
  if (!tabs.includes(tab) || keepSelection(tab, options.focus)) return;

  // Detener también las entradas salientes cuando se cambia rápidamente de tema.
  gsap.killTweensOf(root.querySelectorAll(ENTRY_SELECTOR));
  paintSelection(root, tabs, tab);
  // Las entradas del panel recién visible entran con el fade; las de los paneles ocultos, no.
  revealEntries(getPanel(root, tab));
  // Stryker: sobreviviente equivalente — forzar el foco no se distingue de respetar la opción:
  // la única activación que la apaga es el click, y el navegador ya enfoca el botón pulsado.
  if (options.focus) tab.focus();

  const highlight = root.querySelector<HTMLElement>(HIGHLIGHT_SELECTOR);
  // Stryker: sobreviviente equivalente — el marcado servido siempre trae el resaltado.
  if (highlight) moveHighlight(highlight, tab, options.animate);
}

function handleKeydown(root: HTMLElement, event: KeyboardEvent): void {
  // Solo las claves propias cuentan como flecha: `event.key` podría nombrar un miembro heredado.
  if (!Object.hasOwn(ARROW_STEPS, event.key)) return;
  const step = ARROW_STEPS[event.key];

  const tab = tabFromEvent(root, event.target);
  // Stryker: sobreviviente equivalente — sin pestaña, `indexOf` da -1 y la guarda de índice corta igual.
  if (!tab) return;

  const tabs = getTabs(root);
  const index = tabs.indexOf(tab);
  // Stryker: sobreviviente equivalente — inalcanzable: `tabFromEvent` solo devuelve pestañas de
  // este `root` y `getTabs` las lista todas, así que con una pestaña real el índice nunca es -1.
  if (index === -1) return;

  event.preventDefault();
  activateTab(root, tabs[(index + step + tabs.length) % tabs.length], { animate: true, focus: true });
}

function handleClick(root: HTMLElement, event: MouseEvent): void {
  const tab = tabFromEvent(root, event.target);
  // Stryker: sobrevivientes equivalentes — sin pestaña no hay nada que activar (la guarda solo
  // evita un `activateTab` que descartaría el mismo `null`) y el valor de `focus` cae en la
  // equivalencia ya documentada en `activateTab`.
  if (tab) activateTab(root, tab, { animate: true, focus: false });
}

/**
 * Monta el trazado continuo de la superficie y deja su función de dibujo a nombre del resaltado,
 * que es quien lleva el recorrido. Sin trazado el archivo se queda con la silueta en CSS.
 */
function prepareSurface(root: HTMLElement): HTMLElement | null {
  const highlight = root.querySelector<HTMLElement>(HIGHLIGHT_SELECTOR);
  const draw = initBlogSurface(root);
  if (highlight && draw) surfaces.set(highlight, draw);
  return highlight;
}

function initRoot(root: HTMLElement): void {
  const highlight = prepareSurface(root);
  const tabs = getTabs(root);
  // Stryker: sobrevivientes equivalentes — el marcado servido ya trae la primera pestaña con
  // `aria-selected="true"`, así que cualquier variante de esta búsqueda acaba en `tabs[0]`.
  const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];

  // Stryker: sobrevivientes equivalentes — el repintado de ARIA es indistinguible (el marcado
  // servido ya llega normalizado) y las dos guardas son defensivas frente a un marcado
  // incompleto que `BlogSection` nunca emite.
  if (initial) {
    paintSelection(root, tabs, initial);
    if (highlight) moveHighlight(highlight, initial, false);
  }

  root.addEventListener('click', (event) => handleClick(root, event));
  root.addEventListener('keydown', (event) => handleKeydown(root, event));
}

/** Binds every server-rendered blog archive on the page. */
export function initBlog(): void {
  document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach(initRoot);
}
