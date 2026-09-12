export function initSpotlight(): void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!canHover.matches || reduceMotion.matches) return;

  document.querySelectorAll<HTMLElement>('[data-spot]').forEach((spot) => {
    spot.addEventListener('pointermove', (event) => {
      const rect = spot.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) / rect.width) * 100;
      const my = ((event.clientY - rect.top) / rect.height) * 100;
      spot.style.setProperty('--mx', `${mx.toFixed(1)}%`);
      spot.style.setProperty('--my', `${my.toFixed(1)}%`);
    });
  });
}
