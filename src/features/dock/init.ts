export function initDock(): void {
  const dockItems = Array.from(document.querySelectorAll<HTMLAnchorElement>('.dock__item'));

  /** Destino real de un item del dock: el id de la sección a la que apunta su enlace. */
  function targetOf(item: HTMLAnchorElement): string | null {
    const href = item.getAttribute('href') ?? '';
    return href.startsWith('#') && href.length > 1 ? href.slice(1) : null;
  }

  /**
   * Las secciones vigiladas son exactamente los destinos de los enlaces renderizados del dock, en
   * su orden: la lista sale del `href` de cada item —la misma fuente que usa el visitante— en vez
   * de repetirse aquí, para que homologar la navegación no deje al scroll-spy siguiendo secciones
   * que ya no están en ella ni ignorando las que se añadan.
   */
  const spyIds = dockItems.map(targetOf).filter((id): id is string => Boolean(id));
  let activeSection: string | null = null;

  function setActiveSection(section: string | null): void {
    if (section === activeSection) return;
    activeSection = section;
    dockItems.forEach((item) => {
      const isActive = targetOf(item) === section;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  }

  function computeSpy(): void {
    const probe = window.scrollY + window.innerHeight * 0.42;
    let current: string | null = null;
    for (const id of spyIds) {
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
