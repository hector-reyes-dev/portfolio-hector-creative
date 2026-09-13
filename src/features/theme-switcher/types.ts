export type Theme = 'light' | 'dark';

/**
 * Contrato publicado por `bootstrap.js` antes del primer pintado.
 * La resolución, la persistencia y el seguimiento del sistema viven solo ahí:
 * los consumidores leen el tema efectivo y alternan, sin volver a consultar storage.
 */
export interface ThemeController {
  getTheme(): Theme;
  toggle(): void;
  subscribe(listener: (theme: Theme) => void): () => void;
}

declare global {
  interface Window {
    __portfolioTheme?: ThemeController;
  }
}
