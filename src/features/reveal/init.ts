export function initReveals(): void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!nodes.length) return;

  nodes.forEach((node) => {
    const siblings = Array.from(node.parentElement?.querySelectorAll<HTMLElement>('[data-reveal]') || []);
    if (siblings.length > 1) {
      const index = siblings.indexOf(node);
      node.style.setProperty('--d', `${Math.min(index, 5) * 40}ms`);
    }
  });

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
  );

  nodes.forEach((node) => observer.observe(node));
}
