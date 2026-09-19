const ROUTE_PATTERN = /^#\/caso\/([a-z0-9-]+)/;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Controles elegibles con caja de layout; sin caja solo cuenta el que ya tiene el foco. */
function visibleControls(win: HTMLElement, active: Element | null): HTMLElement[] {
  const controls = Array.from(win.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return controls.filter((node) => node.offsetParent !== null || node === active);
}

/**
 * Control al que debe saltar Tab, o `null` si la navegación nativa ya es la correcta:
 * solo se envuelve en los extremos o cuando el foco está fuera de los controles,
 * entrando por el extremo que marca la dirección.
 */
function findWrapTarget(
  controls: readonly HTMLElement[],
  active: Element | null,
  shiftKey: boolean
): HTMLElement | null {
  const entry = shiftKey ? controls[controls.length - 1] : controls[0];
  const exit = shiftKey ? controls[0] : controls[controls.length - 1];
  const wraps = !controls.includes(active as HTMLElement) || active === exit;
  return wraps ? entry : null;
}

export function initCaseWindow(): void {
  const winEl = document.getElementById('window');
  const winBodyEl = document.getElementById('windowBody');
  const scrimEl = document.getElementById('scrim');
  const closeBtnEl = document.getElementById('windowClose');
  if (!winEl || !winBodyEl || !scrimEl || !closeBtnEl) return;

  const win = winEl;
  const winBody = winBodyEl;
  const scrim = scrimEl;
  const closeBtn = closeBtnEl;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isOpen = false;
  let lastTrigger: HTMLElement | null = null;
  let closeTimer: number | null = null;

  function findTemplate(slug: string): HTMLTemplateElement | null {
    return document.querySelector<HTMLTemplateElement>(`template[data-case-template="${slug}"]`);
  }

  function openWindow(): void {
    isOpen = true;
    // Stryker: sobreviviente equivalente — forzar la guardia a `true` solo añade un
    // `clearTimeout(null)` inocuo cuando no hay salida pendiente.
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    scrim.hidden = false;
    win.hidden = false;
    document.documentElement.classList.add('has-window');
    requestAnimationFrame(() => {
      scrim.classList.add('is-open');
      win.classList.add('is-open');
    });
  }

  function restoreFocus(): void {
    const target = lastTrigger && document.contains(lastTrigger)
      ? lastTrigger
      : document.querySelector<HTMLElement>('.dock__item[data-section="trabajo"]');
    lastTrigger = null;
    target?.focus({ preventScroll: true });
  }

  function closeCase(nav: boolean): void {
    if (isOpen) {
      isOpen = false;
      win.classList.remove('is-open');
      scrim.classList.remove('is-open');
      document.documentElement.classList.remove('has-window');
      closeTimer = window.setTimeout(() => {
        win.hidden = true;
        scrim.hidden = true;
      }, reduceMotion.matches ? 0 : 220);
      restoreFocus();
    }
    // Stryker: sobreviviente equivalente — el segundo argumento de `replaceState` es el
    // título heredado, que ningún navegador usa: mutarlo no cambia nada observable.
    if (nav) history.replaceState(null, '', location.pathname + location.search);
  }

  function openCase(slug: string): void {
    const template = findTemplate(slug);
    // Stryker: sobreviviente equivalente — `applyRoute` ya comprobó la plantilla antes de
    // llamar aquí, y `openCase` es privada: la rama sin plantilla es inalcanzable.
    if (!template) return;
    winBody.replaceChildren(template.content.cloneNode(true));
    winBody.scrollTop = 0;
    // Stryker: sobreviviente equivalente — `openWindow` es idempotente con la ventana ya
    // abierta, así que forzar la guardia a `true` repite un trabajo sin efecto visible.
    if (!isOpen) openWindow();
    const title = document.getElementById('windowTitle');
    title?.focus({ preventScroll: true });
  }

  function applyRoute(): void {
    // Stryker: sobreviviente equivalente — el respaldo del hash vacío solo alimenta a
    // `match`, y ningún texto que no empiece por `#/caso/` cambia el resultado.
    const match = (location.hash || '').match(ROUTE_PATTERN);
    if (match && findTemplate(match[1])) {
      openCase(match[1]);
      return;
    }
    // Stryker: sobreviviente equivalente — forzar la guardia a `true` delega en `closeCase`,
    // que vuelve a comprobar `isOpen` y no hace nada con la ventana cerrada.
    if (isOpen) closeCase(false);
  }

  document.addEventListener('click', (event) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#/caso/"]');
    if (anchor) lastTrigger = anchor;
  });

  window.addEventListener('hashchange', applyRoute);
  closeBtn.addEventListener('click', () => closeCase(true));
  scrim.addEventListener('click', () => closeCase(true));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) closeCase(true);
  });

  win.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const active = document.activeElement;
    const controls = visibleControls(win, active);
    // Stryker: sobrevivientes equivalentes — sin controles, `findWrapTarget` devuelve
    // `undefined` (no hay extremos), que la guardia siguiente trata igual que `null`.
    const target = controls.length > 0 ? findWrapTarget(controls, active, event.shiftKey) : null;
    if (!target) return;
    event.preventDefault();
    target.focus();
  });

  applyRoute();
}
