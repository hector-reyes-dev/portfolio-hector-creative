const ROUTE_PATTERN = /^#\/caso\/([a-z0-9-]+)/;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
    if (nav) history.replaceState(null, '', location.pathname + location.search);
  }

  function openCase(slug: string): void {
    const template = findTemplate(slug);
    if (!template) return;
    winBody.replaceChildren(template.content.cloneNode(true));
    winBody.scrollTop = 0;
    if (!isOpen) openWindow();
    const title = document.getElementById('windowTitle');
    title?.focus({ preventScroll: true });
  }

  function applyRoute(): void {
    const match = (location.hash || '').match(ROUTE_PATTERN);
    if (match && findTemplate(match[1])) {
      openCase(match[1]);
      return;
    }
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
    const focusables = Array.from(win.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (node) => node.offsetParent !== null || node === document.activeElement
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;
    if (focusables.indexOf(active) === -1) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  applyRoute();
}
