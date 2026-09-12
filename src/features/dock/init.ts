const SPY_IDS = ['trabajo', 'proyectos', 'servicios', 'experimentos', 'contacto'];

export function initDock(): void {
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
