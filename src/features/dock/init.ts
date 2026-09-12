import { interpolatePath, tokenizePath, tokensCompatible } from '../../lib/utils/svg-path-morph';

const MORPH_MS = 320;
const SPY_IDS = ['trabajo', 'proyectos', 'servicios', 'experimentos', 'contacto'];

const runIds = new WeakMap<SVGPathElement, number>();

function morphPath(path: SVGPathElement | null, target: string | null, animate: boolean): void {
  if (!path || !target) return;
  const from = tokenizePath(path.getAttribute('d'));
  const to = tokenizePath(target);
  const compatible = tokensCompatible(from, to);

  if (!animate || !compatible) {
    path.setAttribute('d', target);
    return;
  }

  const runId = (runIds.get(path) || 0) + 1;
  runIds.set(path, runId);
  const start = performance.now();

  function frame(now: number) {
    if (runIds.get(path as SVGPathElement) !== runId) return;
    const progress = Math.min(1, (now - start) / MORPH_MS);
    path!.setAttribute('d', interpolatePath(from, to, progress));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function initDock(): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dockItems = Array.from(document.querySelectorAll<HTMLAnchorElement>('.dock__item'));
  let activeSection: string | null = null;

  function setActiveSection(section: string | null): void {
    if (section === activeSection) return;
    activeSection = section;
    dockItems.forEach((item) => {
      const isActive = item.dataset.section === section;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
      const path = item.querySelector<SVGPathElement>('.dock__path');
      const target = path?.getAttribute(isActive ? 'data-active' : 'data-idle') ?? null;
      morphPath(path, target, !reduceMotion.matches);
    });
  }

  function computeSpy(): void {
    const probe = window.scrollY + window.innerHeight * 0.42;
    let current: string | null = null;
    for (const id of SPY_IDS) {
      const node = document.getElementById(id);
      if (node && node.offsetTop <= probe) current = id;
    }
    setActiveSection(current);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      computeSpy();
    });
  }, { passive: true });

  window.addEventListener('resize', computeSpy);
  window.addEventListener('load', computeSpy);
  computeSpy();
}
