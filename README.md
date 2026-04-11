# Portfolio Hector Creative

Base profesional para un portafolio en Astro con Tailwind CSS, GSAP y una arquitectura `Atomic Modular Stack`.

## Stack
- Astro 5
- Tailwind CSS 3
- GSAP
- TypeScript estricto
- Content Collections con `zod`

## Estructura principal
- `src/components`: UI kit en `atoms`, `molecules`, `organisms` y `templates`
- `src/features`: lógica contextual por dominio
- `src/layouts`: wrappers base de documento y app
- `src/lib`: helpers, core y servicios
- `src/content`: colecciones tipadas para contenido
- `src/styles`: entrada global, temas y capas CSS compartidas

## Comandos
```bash
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm preview
```

## Notas
- `components` debe permanecer presentacional y reutilizable.
- `features` concentra lógica de negocio, estado y flujos.
- `src/lib/core/gsap.ts` es el punto único de acceso a GSAP.
- Las colecciones `posts`, `projects`, `experiments`, `packages`, `components` y `resources` ya están definidas en `src/content/config.ts`.
