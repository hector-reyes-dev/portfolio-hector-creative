// Feature: Imágenes del footer limitadas a 1600px y fundidas con el fondo
// @vitest-environment jsdom
//
// Criterios visuales para verificar en navegador: dimensiones, recorte superior y difuminado.
// jsdom no calcula el layout ni permite comprobar el resultado visual de un degradado.
//
// Lo que sí es observable aquí es el contrato del que depende ese resultado: la cascada
// real de src/styles/portfolio/footer-cta.css sobre el arte del footer (ancho declarado,
// tope, proporción, máscara de orillas y arte por tema) y los PNG de public/assets que ese
// contrato referencia. mountFooter() reproduce el marcado que renderiza SiteFooter.astro.
//
// Scenario: las imágenes del footer se adaptan a pantallas menores de 1600px
// Given el footer visible en una ventana de 1280px de ancho
// When el visitante reduce el ancho de la ventana a 768px
// Then las imágenes se adaptan al ancho disponible sin provocar desbordamiento horizontal
// And el límite de 1600px no impone un ancho fijo que desborde la pantalla
//
// Scenario: las imágenes del footer alcanzan como máximo 1600px de ancho
// Given el footer visible con espacio suficiente para sus imágenes
// When el visitante visualiza el footer en ventanas de 1600px y 1920px de ancho
// Then el ancho renderizado de las imágenes no supera 1600px en ninguna de las ventanas
// And el límite corresponde a las imágenes y no solamente al texto del footer
//
// Scenario: ampliar la pantalla por encima de 1600px no agranda ni recorta las imágenes del footer
// Given el footer visible en una ventana de 1920px de ancho con sus imágenes en su tamaño máximo
// When el visitante amplía la ventana a 2560px y después a 3440px manteniendo la misma altura
// Then las imágenes conservan el mismo ancho y alto renderizados que tenían a 1920px
// And no se cortan en el borde superior por el crecimiento de la pantalla
//
// Scenario: las orillas de las imágenes del footer se difuminan con el color de fondo
// Given el footer visible en una ventana de 2560px con fondo alrededor de las imágenes
// When el visitante observa las orillas izquierda y derecha de las imágenes
// Then ambas orillas se desvanecen gradualmente hasta integrarse con el color de fondo del footer
// And no queda un corte lateral brusco entre las imágenes y el fondo
// And el centro de las imágenes permanece visible sin difuminarse

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// Bajo jsdom, `import.meta.url` no vale como base de URL: se normaliza a string antes
// de convertirlo en ruta.
const FEATURE_DIR = dirname(fileURLToPath(`${import.meta.url}`));
const FOOTER_STYLES = join(FEATURE_DIR, '../../styles/portfolio/footer-cta.css');
const ART_FILES = {
  light: join(FEATURE_DIR, '../../../public/assets/footer_image_light.png'),
  dark: join(FEATURE_DIR, '../../../public/assets/footer_image_dark.png')
};
const ART_MAX_WIDTH = 1600;

type Stop = { position: number; opacity: number };

function readPngSize(file: string): { width: number; height: number } {
  const png = readFileSync(file);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/** Longitud declarada en CSS resuelta contra el ancho disponible del contenedor. */
function resolveLength(value: string, basis: number): number {
  if (value.endsWith('%')) return (basis * Number.parseFloat(value)) / 100;
  // Stryker: sobreviviente equivalente — con las longitudes reales del arte (`100%` y
  // `1600px`) esta rama es la única que queda después del porcentaje; forzar la condición
  // no cambia el resultado. El throw cubre unidades que este harness no sabe resolver.
  if (value.endsWith('px')) return Number.parseFloat(value);
  throw new Error(`El harness no sabe resolver la longitud "${value}"`);
}

/** Igual que resolveLength, pero un tope ausente no limita nada. */
function resolveLimit(value: string, basis: number): number {
  if (!value || value === 'none') return Number.POSITIVE_INFINITY;
  return resolveLength(value, basis);
}

/** Ancho renderizado del arte: su ancho declarado acotado por su tope. */
function effectiveWidth(styles: CSSStyleDeclaration, viewportWidth: number): number {
  return Math.min(resolveLength(styles.width, viewportWidth), resolveLimit(styles.maxWidth, viewportWidth));
}

/** Caja renderizada del arte: el alto sale de su proporción intrínseca. */
function renderedSize(styles: CSSStyleDeclaration, viewportWidth: number, ratio: number): { width: number; height: number } {
  const width = effectiveWidth(styles, viewportWidth);
  return { width, height: width / ratio };
}

/**
 * Parada de la máscara: solo hay tramos transparentes (orilla) y opacos (centro).
 * jsdom serializa los colores de la máscara como `transparent` o `rgb(...)`, así que la
 * comparación literal alcanza: si algún día apareciera un `rgba(…, 0)`, ese tramo se
 * leería como opaco y el escenario de las orillas fallaría en rojo, nunca en falso verde.
 */
function parseStop(part: string): Stop {
  // Stryker: sobreviviente equivalente — las variantes de anclaje y espaciado de estos dos
  // patrones, y la guarda defensiva, no cambian el resultado: cada parada trae un único
  // porcentaje al final y ninguna máscara real llega sin él.
  const position = /(-?[\d.]+)%$/.exec(part);
  if (!position) throw new Error(`Parada de degradado sin posición explícita: "${part}"`);
  const color = part.replace(/\s*-?[\d.]+%\s*$/, '');
  return { position: Number.parseFloat(position[1]), opacity: color.toLowerCase() === 'transparent' ? 0 : 1 };
}

function parseMask(value: string): { axis: string; stops: Stop[] } {
  const inner = value.slice(value.indexOf('(') + 1, -1);
  const [axis, ...parts] = inner.split(/,(?![^()]*\))/).map((part) => part.trim());
  return { axis, stops: parts.map(parseStop) };
}

// Stryker: sobrevivientes equivalentes — `light` es el tema por defecto del CSS (solo
// `:root.dark` cambia el arte), así que montar sin clase pinta lo mismo; y el encoding de
// readFileSync da igual porque el Buffer se serializa a la misma hoja de estilos.
function mountFooter(theme: 'light' | 'dark' = 'light'): { art: HTMLElement; inner: HTMLElement } {
  document.documentElement.className = theme;
  document.body.innerHTML = `
    <footer class="footer">
      <div class="container footer__inner">
        <p>© 2026 Héctor Reyes</p>
      </div>
      <div class="footer__art" aria-hidden="true"></div>
    </footer>`;
  const style = document.createElement('style');
  style.textContent = readFileSync(FOOTER_STYLES, 'utf8');
  document.head.append(style);
  return {
    art: document.querySelector<HTMLElement>('.footer__art')!,
    inner: document.querySelector<HTMLElement>('.footer__inner')!
  };
}

// Aislamiento defensivo: hoy mountFooter() reescribe todo lo que esta limpieza deshace,
// así que Stryker la reporta como sobreviviente equivalente; sostiene a la primera prueba
// que lea estilos sin montar el footer.
afterEach(() => {
  document.head.querySelectorAll('style').forEach((style) => style.remove());
  document.body.innerHTML = '';
  document.documentElement.className = '';
});

// Stryker deja vivos aquí dos grupos que ninguna prueba puede matar. Los mutantes que
// borran una aserción o vacían el cuerpo de un `it` son inmatables por construcción: el
// código mutado es la prueba misma. Y los estáticos (constantes de módulo, nombres de
// `describe`/`it`) el vitest-runner nunca llega a activarlos — comprobado a mano con
// FEATURE_DIR: aplicado de verdad deja los 4 escenarios en rojo, pero Stryker lo reporta
// como sobreviviente.
describe('Imágenes del footer', () => {
  it('las imágenes del footer se adaptan a pantallas menores de 1600px', () => {
    // Scenario: las imágenes del footer se adaptan a pantallas menores de 1600px
    const { art } = mountFooter();
    const styles = getComputedStyle(art);

    expect(effectiveWidth(styles, 1280)).toBe(1280);
    expect(effectiveWidth(styles, 768)).toBe(768);
    // En ningún tamaño por debajo del tope el ancho renderizado excede al viewport.
    for (const viewport of [320, 768, 1280, 1599]) {
      expect(effectiveWidth(styles, viewport)).toBeLessThanOrEqual(viewport);
    }
  });

  it('las imágenes del footer alcanzan como máximo 1600px de ancho', () => {
    // Scenario: las imágenes del footer alcanzan como máximo 1600px de ancho
    const { art, inner } = mountFooter();
    const styles = getComputedStyle(art);

    expect(effectiveWidth(styles, 1600)).toBe(ART_MAX_WIDTH);
    expect(effectiveWidth(styles, 1920)).toBe(ART_MAX_WIDTH);
    // El tope vive en el elemento que pinta la imagen, no en el texto del footer,
    // que sí puede ocupar más de 1600px.
    expect(styles.backgroundImage).toBe('url("/assets/footer_image_light.png")');
    expect(resolveLimit(getComputedStyle(inner).maxWidth, 1920)).toBeGreaterThan(ART_MAX_WIDTH);
  });

  it('ampliar la pantalla por encima de 1600px no agranda ni recorta las imágenes del footer', () => {
    // Scenario: ampliar la pantalla por encima de 1600px no agranda ni recorta las imágenes del footer
    const { art } = mountFooter();
    const styles = getComputedStyle(art);
    const [ratioWidth, ratioHeight] = styles.aspectRatio.split('/').map((side) => Number.parseFloat(side));
    const ratio = ratioWidth / ratioHeight;
    const maxed = renderedSize(styles, 1920, ratio);

    expect(maxed.width).toBe(ART_MAX_WIDTH);
    for (const viewport of [2560, 3440]) {
      expect(renderedSize(styles, viewport, ratio)).toEqual(maxed);
    }
    // La proporción declarada es la real de los PNG, y en el tope el alto renderizado sale
    // de esa proporción: el arte no se estira ni se recorta.
    for (const file of [ART_FILES.light, ART_FILES.dark]) {
      const png = readPngSize(file);
      expect(ratio).toBeCloseTo(png.width / png.height, 5);
      expect(maxed.height).toBeCloseTo((png.height * ART_MAX_WIDTH) / png.width, 5);
    }
    // Nada recorta el arte por arriba: sin límite de alto ni desbordamiento oculto.
    expect(resolveLimit(styles.maxHeight, 1920)).toBe(Number.POSITIVE_INFINITY);
    expect(styles.overflow).not.toBe('hidden');
  });

  it('las orillas de las imágenes del footer se difuminan con el color de fondo', () => {
    // Scenario: las orillas de las imágenes del footer se difuminan con el color de fondo
    const { art } = mountFooter();
    const { axis, stops } = parseMask(getComputedStyle(art).maskImage);
    const opaque = stops.filter((stop) => stop.opacity === 1);
    const firstOpaque = opaque[0];
    const lastOpaque = opaque[opaque.length - 1];

    // Stryker: sobreviviente equivalente — quitar las anclas de este patrón no cambia nada
    // con un eje real; la alternancia es deliberada, cualquier eje horizontal sirve.
    expect(axis).toMatch(/^(90deg|270deg|to (right|left))$/);
    // Las dos orillas llegan a transparente: por ahí asoma el fondo del footer.
    expect(stops[0]).toEqual({ position: 0, opacity: 0 });
    expect(stops[stops.length - 1]).toEqual({ position: 100, opacity: 0 });
    // El borde entra en degradado, no en corte: hay una rampa hasta el tramo opaco.
    expect(firstOpaque.position).toBeGreaterThan(0);
    expect(lastOpaque.position).toBeLessThan(100);
    // Y el centro queda fuera de esa rampa, sin difuminarse.
    expect(firstOpaque.position).toBeLessThanOrEqual(50);
    expect(lastOpaque.position).toBeGreaterThanOrEqual(50);
    // Cada tema pinta su propio arte, así que la orilla se funde con su fondo.
    expect(getComputedStyle(art).backgroundImage).toBe('url("/assets/footer_image_light.png")');
    expect(getComputedStyle(mountFooter('dark').art).backgroundImage).toBe('url("/assets/footer_image_dark.png")');
  });
});
