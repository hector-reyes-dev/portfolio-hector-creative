# Guía de Trabajo - Portfolio Hector Creative

Este documento define las reglas de oro para mantener la integridad de la arquitectura **Atomic Modular Stack** en este proyecto Astro.

## 🏗️ Reglas de Arquitectura

1. **Atomic Design Estricto (`src/components/`):**
  - **Atoms:** Componentes mínimos (Botones, Inputs, Iconos). **Prohibido** importar lógica de `features/` o realizar fetching de datos.
  - **Molecules:** Grupos de átomos. Lógica visual mínima.
  - **Organisms:** Secciones complejas (Header, Hero, Grids). Pueden recibir datos de `content/` pero no lógica pesada de `features/`.
  - **Templates:** Layouts de contenido específicos.
2. **Lógica de Negocio (`src/features/`):**
  - Todo componente que dependa de un estado complejo, persistencia (localStorage) o lógica específica (filtros de búsqueda, blog, switch de tema) **debe** vivir aquí.
  - Las `features` consumen componentes del UI Kit (`src/components/`), nunca al revés.
3. **Núcleo Técnico (`src/lib/`):**
  - `api/`: Solo servicios de fetching (CMS).
  - `**core/**`: Inicializaciones pesadas (GSAP, configuraciones globales).
  - `**utils/**`: Funciones puras y deterministas.
4. **Estilos y Temas (`src/styles/`):**
  - No usar `@apply` indiscriminadamente en componentes. Preferir clases de Tailwind en el HTML.
  - Las variables de diseño (colores, radios) se definen en `global.css` y se usan mediante clases de utilidad o variables CSS.

## 🛠️ Flujo de Desarrollo

- **Aliases:** Usar siempre los prefijos `@atoms`, `@molecules`, `@organisms`, `@features`, `@layouts` y `@lib` para evitar paths relativos profundos.
- **GSAP:** No importar `gsap` directamente en componentes si requieren configuración previa. Usar el inicializador en `@lib/core/gsap.ts`.
- **Content Collections:** Cualquier nuevo tipo de contenido debe ser definido primero en `src/content/config.ts` usando esquemas de `zod`.

## 📌 Principio de Desacoplamiento

> "La UI (`src/components/`) es un cascarón tonto; la inteligencia reside en `src/features/`; la infraestructura reside en `src/lib/`."

Cualquier cambio que rompa esta jerarquía se considera una deuda técnica inmediata.

<!-- flujo-orca-openspec:start -->
Lee docs/flujo-orca-openspec.md para los roles, autorizaciones y procedimiento de Orca + OpenSpec.
Antes de despachar un hijo, sincroniza la configuración desde el coordinador con
`pnpm agents:sync --target <ruta-hijo> --apply` y comprueba con `--check`.
<!-- flujo-orca-openspec:end -->
