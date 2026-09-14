## Why

La foto del Hero es estática y no ofrece la interacción expresiva solicitada para el portafolio. Una ráfaga decorativa bajo demanda añade personalidad sin alterar el contenido ni la navegación, con acceso equivalente por mouse, touch y teclado.

## What Changes

- Convertir la foto en un control accesible: una ráfaga por entrada de hover con mouse, una por tap y una por activación con Enter/Espacio, sin emisión continua ni duplicados por eventos sintéticos.
- Fijar el tamaño exterior visible de la imagen en 120 × 120 px desde 768 px de viewport y 90 × 90 px hasta 767 px, conservando borde circular, recorte, sombra y separación del Hero.
- Emitir partículas exclusivamente de este conjunto: 💻🛒🔍🤖📊🏗️🐕🏘️💰📝🇲🇽⚙️🧩📈🗂️🚀🧠📱💼🌐. Nacen detrás de la imagen, crecen, ascienden y desaparecen, variando tamaño, trayectoria, rotación, duración y retraso en cada emisión.
- Mantener la capa decorativa fuera del flujo, del hit-testing y del árbol accesible. Limpiar las partículas al terminar y al activar movimiento reducido.
- Con `prefers-reduced-motion: reduce`, conservar la foto y el foco pero no emitir partículas ni sustituirlas por otro movimiento.
- Validar en apply con check/build y evidencia real de navegador desktop, mobile, teclado y reduced motion.

## Capabilities

### New Capabilities

- `hero-emoji-burst`: fotografía responsive del Hero con ráfagas decorativas accesibles y movimiento reducido.

### Modified Capabilities

Ninguna. No cambia el contrato de `theme-preference`.

## Impact

- Atomic Modular Stack: `Hero.astro` sigue siendo el organism; una molecule `HeroPortrait.astro` agrupa imagen, botón y capa decorativa. El inicializador visual se ubica en `src/lib/core/hero-emoji-burst.ts`, sin imports de features desde UI ni estado de producto/persistencia.
- Estilos acotados a `src/styles/portfolio/hero.css`, reutilizando `--line-strong`, `--shadow-sm` y el foco global con `--accent`. Sin dependencias adicionales, cambios de contenido, APIs, layouts, tema ni otros efectos.
- Exclusiones: emisión automática, seguimiento del cursor, sonido, analítica, configuración pública del efecto, cambios al copy/CTA, nuevos assets y refactor del sistema de animación existente.
- Riesgos a cubrir: doble ráfaga touch/click, foco perdido, partículas sobre la foto por stacking incorrecto, overflow horizontal, acumulación en activaciones rápidas y animaciones que ignoren reduced motion.
- Esta entrega es únicamente propuesta: revisión técnica externa y aprobación humana preceden a apply; no autoriza implementación, commit ni publicación.
