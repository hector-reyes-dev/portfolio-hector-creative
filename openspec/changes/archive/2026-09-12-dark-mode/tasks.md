## 1. Arranque y estado de tema

- [x] 1.1 Antes de editar código, comprobar `review.json` mediante el launcher apply del pipeline y que corresponde a este plan y worktree; registrar modelo e IDs reales de la sesión apply en el handoff sin fabricar aprobación.
- [x] 1.2 Crear `features/theme-switcher/bootstrap.js` y su contrato tipado según design: resolver storage válido, SO y fallback; controlar elección manual, suscripción, fallos de lectura/escritura y eventos de SO sin duplicar inicialización. Verificar con una ejecución temporal del controlador los valores válidos/invalidos, APIs fallidas, cambio automático y elección manual que vence a eventos posteriores incluso si falla setItem.
- [x] 1.3 Integrar bootstrap inline de fuente local en `BaseLayout.astro` y mover allí el único theme-color desde `index.astro`; verificar en navegador con bundle retrasado que ambas preferencias guardadas opuestas al SO producen primer frame correcto, clases excluyentes, color-scheme y meta sincronizados, sin solicitar un script externo para resolver tema.

## 2. Paleta coherente

- [x] 2.1 Consolidar colores claros/oscuros y roles de la tabla de design en `themes/light.css` y `themes/dark.css`; retirar redefiniciones cromáticas competidoras de `portfolio/tokens.css` y ajustar global.css sin alterar tipografía, radios o contenido. Verificar colores computados de fondo, texto y superficie elevada tanto mediante utilidades Tailwind como consumidores legacy en ambos temas, conservando la base clara actual.
- [x] 2.2 Sustituir colores estructurales hardcodeados en buttons.css, cards.css, base.css, experiments.css y dock-window.css por roles de tema para superficies, bordes, sombras, perilla, hover, pressed, texto sobre acento y overlays; verificar visualmente todas las secciones, controles y ventana en ambos temas, conservando gradientes ilustrativos, logos, imágenes y máscaras intencionales.
- [x] 2.3 Corregir los fallbacks sin backdrop-filter del dock, ventana y scrim y su orden en cascada; verificar la rama sin soporte en ambos temas mediante navegador o emulación CSS temporal que reproduzca esas reglas y registrar el método y sus límites.

## 3. Control del dock

- [x] 3.1 Crear `@atoms/ThemeToggle.astro` sin dependencia de features, con botón nativo, nombre estable, icono decorativo, aria-pressed y selector exclusivo; componerlo en Dock.astro sin `.dock__item`, `.switch` ni data-section. Verificar árbol accesible, independencia del scrollspy y ausencia de botón inerte cuando JavaScript está deshabilitado.
- [x] 3.2 Crear `@features/theme-switcher/init` e inicializar desde index.astro usando el controlador temprano sin segunda resolución; verificar activación por puntero, Enter y Espacio exactamente una vez, foco conservado, sincronización al cambiar SO antes/después del montaje y ausencia de listeners duplicados al reinicializar. Con una ventana de caso abierta, alternar el tema y verificar que `has-window`, el bloqueo de scroll, el foco y la navegación sobreviven al cambio.
- [x] 3.3 Adaptar estilos del dock y foco para ambos temas manteniendo área de tema 44×44, safe-area y ancho móvil; verificar a 320, 375, 768 y 1440 px cada sección activa, zoom 200% y reduced motion sin overflow, foco recortado, nombres perdidos ni animación global al alternar.

## 4. Aceptación integrada en navegador

- [x] 4.1 Ejecutar todos los escenarios de preferencia inicial, seguimiento de SO y persistencia de `specs/theme-preference/spec.md`: storage ausente, `light`, `dark`, inválido, acceso/getItem bloqueado, setItem rechazado, matchMedia ausente/fallido, recarga y eventos después de elección manual. Registrar pasos, navegador y resultado real en evidencia del change; no marcar completo solo con mocks o check/build.
- [x] 4.2 Capturar primer pintado claro y oscuro con bundle retrasado y SO opuesto, además de cambios de meta/color-scheme y fallback sin JS; registrar capturas o filmstrip que permitan distinguir el primer frame de una captura posterior al montaje.
- [x] 4.3 Recorrer página y ventana en ambos temas midiendo contraste real de texto normal ≥4.5:1, texto grande ≥3:1 y controles/indicadores necesarios ≥3:1; incluir vidrio, badges, foco, hover, pressed y sección activa, corregir fallos y guardar pares de colores/ratios y capturas responsive con reduced motion.
- [x] 4.4 Verificar por teclado y árbol accesible nombre/estado del botón, navegación entre secciones, apertura/cierre y foco de ventanas e independencia bidireccional del switch de experimentos; guardar resultados de esos recorridos y confirmar que errores de storage no rompen las otras features.

## 5. Cierre de apply

- [x] 5.1 Con evidencia funcional completa, revisar el diff del cambio contra propuesta/diseño/specs y registrar la aceptación o correcciones resueltas junto al handoff; comprobar que no hubo cambios fuera de alcance y que cada tarea marcada tiene evidencia observable.
- [x] 5.2 Ejecutar `pnpm agent:verify dark-mode` como comprobación final del código vigente y registrar su salida y verification.json: exige tasks completas, aprobación vigente y OpenSpec válido, y ejecuta `pnpm check && pnpm build`. Por el gate de tasks, marcar este último checkbox al iniciar ese cierre con las demás tareas ya acreditadas y conservarlo marcado únicamente si el comando termina con éxito; desmarcarlo inmediatamente ante fallo y corregir antes de repetir. La aceptación funcional de 4.1–4.4 es obligatoria además del comando; entregar al coordinador sin commit/push/merge y sin autoaprobar ni archivar desde esta tarea.
