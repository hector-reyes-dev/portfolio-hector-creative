export function initMagneticHover(): void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!canHover.matches || reduceMotion.matches) return;

  document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((btn) => {
    btn.addEventListener('pointermove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      btn.style.transform = `translate(${(x * 6).toFixed(2)}px,${(y * 6).toFixed(2)}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
}
