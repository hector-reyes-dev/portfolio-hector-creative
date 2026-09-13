import type { Theme } from './types';

/**
 * Adaptador visual del controlador temprano: sincroniza el estado accesible del
 * botón y lo enlaza. Sin controlador o sin botón no hay nada que presentar.
 */
export function initThemeSwitcher(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  const controller = window.__portfolioTheme;
  if (!button || !controller || button.dataset.themeBound === 'true') return;

  const sync = (theme: Theme): void => {
    button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  };

  sync(controller.getTheme());
  controller.subscribe(sync);
  button.addEventListener('click', () => controller.toggle());
  button.dataset.themeBound = 'true';
  button.hidden = false;
}
