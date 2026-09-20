/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';

// `getViteConfig` (en lugar de `defineConfig` de Vitest) añade el plugin de Vite que compila
// los `.astro`, necesario para los tests que rinden componentes reales con `astro/container`.
export default getViteConfig({
  resolve: {
    alias: {
      '@atoms': fileURLToPath(new URL('./src/components/atoms', import.meta.url)),
      '@molecules': fileURLToPath(new URL('./src/components/molecules', import.meta.url)),
      '@organisms': fileURLToPath(new URL('./src/components/organisms', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8'
    }
  }
});
