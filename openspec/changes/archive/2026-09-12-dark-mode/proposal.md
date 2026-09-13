## Why

El portafolio tiene tokens `.dark`, pero la paleta legacy sin capas los sobreescribe y no existe un selector de tema funcional. Se necesita una apariencia oscura completa y accesible que respete la preferencia inicial del visitante y su elección manual, sin destello del tema equivocado.

## What Changes

- Agregar un botón binario de tema al dock, independiente de la navegación y del switch de experimentos.
- Resolver el primer tema antes del primer pintado: valor válido `light`/`dark` en localStorage, después `prefers-color-scheme`, finalmente claro cuando no se pueda consultar el sistema.
- Seguir cambios del sistema solamente mientras no exista una elección manual; persistir la elección y mantenerla durante la sesión aunque falle la escritura.
- Tolerar lectura/escritura bloqueadas y valores inválidos sin romper el sitio ni alterar otras preferencias.
- Consolidar tokens claros/oscuros y sustituir colores estructurales fijos en superficies, textos, controles, ventanas y fallbacks de transparencias; conservar imágenes y colores de marca intencionales.
- Sincronizar `color-scheme`, estado accesible del botón y `meta[name="theme-color"]` con el tema efectivo.
- Exigir aceptación de teclado, foco, ARIA, contraste, responsive, reduced motion, primer pintado y regresiones del dock/experimentos, además de check/build.

## Capabilities

### New Capabilities

- `theme-preference`: resolución inicial, persistencia tolerante a fallos, seguimiento del sistema y alternancia accesible con paleta completa.

### Modified Capabilities

Ninguna: `openspec list --specs` no registra capacidades existentes.

## Impact

- UI Atomic: nuevo átomo visual para el botón; composición en `src/components/organisms/Dock.astro`. La UI no importa features.
- Estado/persistencia: `src/features/theme-switcher/`, actualmente vacío; inicialización desde `src/pages/index.astro` y arranque temprano desde `src/layouts/BaseLayout.astro`.
- Estilos: `src/styles/themes/{light,dark}.css`, `portfolio/tokens.css`, `global.css` y consumidores afectados en `portfolio/` y `components/`; se mantienen los aliases y patrones existentes.
- Riesgos principales: cascada legacy sin capas frente a `@layer base`, colores claros hardcodeados, contraste sobre vidrio, crecimiento del dock en móvil y resolución inicial tardía.
- Sin dependencias nuevas, fetching, cambios de contenido, endpoints ni contratos externos.
- Fuera de alcance: tercera opción «sistema», sincronización entre pestañas, cookies/SSR personalizado, rediseño del portafolio, recolorear assets de marca, cambiar la lógica de experimentos o adoptar otro framework de estado.
- Esta fase solo produce artefactos OpenSpec; la aprobación humana del plan y una sesión apply separada son obligatorias. No autoriza implementación, commit, push, merge, archive ni publicación.
