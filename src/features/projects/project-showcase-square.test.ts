// Feature: Selectores cuadrados y continuidad del showcase de proyectos
//
// Scenario: convierte los selectores en cuadrados aumentando su alto sin reducir su ancho
// Given el componente ProjectShowcase real con los proyectos existentes y los estilos de producción
// And las medidas baseline de sus selectores al mismo ancho de viewport
// When se muestra el showcase en escritorio, tablet y móvil
// Then cada selector tiene alto igual a ancho con tolerancia de un píxel CSS
// And conserva el ancho baseline y aumenta su alto respecto al rectángulo baseline
// And conserva columnas, separación, imágenes de fondo y todos los proyectos accesibles sin desbordamiento horizontal
//
// Scenario: mantiene estable la composición al alternar textos de una y dos líneas
// Given el showcase real con títulos y descripciones que ocupan una o dos líneas al ancho probado
// When se alternan esos proyectos en ambos sentidos a viewport fijo
// Then el inicio de la descripción, el marco de imagen y los selectores conservan sus posiciones de layout con tolerancia de un píxel CSS
// And durante y después de cada transición el contenido permanece completo sin recortes, solapamientos ni elipsis
// And la continuidad visual no depende de animar el alto de las regiones de texto
//
// Scenario: adapta las regiones estables al cambiar el ancho disponible
// Given el showcase real con un proyecto de texto largo seleccionado
// When se cambia entre escritorio, tablet y móvil y se recorren todos los proyectos en cada tamaño
// Then los textos se redistribuyen y permanecen completos sin desbordamientos ni solapamientos
// And a cada ancho fijo el marco de imagen y los selectores permanecen estables entre proyectos
// And los selectores siguen siendo cuadrados respetando el ancho y las columnas correspondientes a ese viewport
//
// Scenario: conserva la última selección durante cambios rápidos y repetidos
// Given el showcase real con movimiento habilitado
// When se seleccionan varios proyectos antes de terminar cada transición y se vuelve al primero
// Then cada activación muestra inmediatamente un único selector seleccionado
// And al terminar las transiciones título, descripción, etiquetas, imagen y texto alternativo corresponden a la última selección
// And ningún cambio pendiente restaura un proyecto anterior ni deja contenido invisible o controles bloqueados
// And nuevas selecciones siguen funcionando sin saltos de layout
//
// Scenario: conserva la selección accesible y el foco al navegar con teclado
// Given el showcase real con sus botones y panel de actualización accesible
// When se recorren los selectores con Tab y se activan proyectos con Enter y Espacio durante las transiciones
// Then el foco visible permanece en el botón activado y todos los selectores conservan su nombre accesible
// And exactamente un botón tiene aria-pressed verdadero y coincide con el contenido seleccionado
// And el panel conserva aria-live polite y aria-atomic verdadero sin duplicar contenido para lectores de pantalla
// And se conservan imágenes de fondo sin nombres visibles en selectores y la imagen principal con su texto alternativo
//
// Scenario: mantiene contenido y feedback inmediato con movimiento reducido
// Given el showcase real cargado con prefers-reduced-motion reduce
// When se alternan rápidamente proyectos mediante clic y teclado
// Then se omite el movimiento espacial no esencial sin esperar una animación para actualizar la selección
// And el último proyecto queda completo y visible con su estado accesible y foco conservados
// And las regiones de texto, imagen y selectores mantienen la misma estabilidad de layout
//
// Feature: Alto natural del texto y animación del cambio de proyecto en Casos documentados
//
// Scenario: elimina el espacio reservado entre las líneas cuando el proyecto seleccionado ocupa menos alto
// Given el showcase real de Casos documentados con proyectos de distinto volumen de texto
// When el visitante selecciona el proyecto cuyo título y descripción ocupan menos alto
// Then las etiquetas, el título y la descripción quedan separados solo por el espaciado del bloque de texto
// And ninguna caja de texto reserva alto para las variantes de los demás proyectos
// And ni el CSS ni los estilos en línea fijan alto, alto mínimo o relación de aspecto a esas cajas de texto
//
// Scenario: conserva la posición de los elementos situados debajo al cambiar de proyecto
// Given el showcase real con el marco de imagen y los selectores debajo del bloque de texto
// When se alternan todos los proyectos en ambos sentidos a viewport fijo
// Then el alto del bloque de texto no depende del proyecto seleccionado sino de una medida del contenido real
// And el marco de imagen, los selectores y el resto de la página conservan su posición
// And la animación del cambio no mueve ni redimensiona la caja de ningún elemento
//
// Scenario: conserva el contenido completo de cada proyecto sin recortes ni elipsis
// Given el showcase real con los textos de producción
// When se recorre cada proyecto
// Then etiquetas, título y descripción se muestran completos e idénticos al contenido de origen
// And ninguna regla recorta, desborda ni elipsa esos textos
// And el lector de pantalla anuncia solo el proyecto seleccionado, sin duplicados
//
// Scenario: anima el cambio de proyecto con transiciones interrumpibles y movimiento reducido
// Given el showcase real con la política de movimiento de la skill animate
// When se encadenan selecciones antes de que termine la transición anterior y se repite con prefers-reduced-motion reduce
// Then el cambio se anima con transiciones interrumpibles y no con una secuencia de keyframes que reinicia
// And solo se animan propiedades que no provocan layout (opacidad y transformaciones)
// And el contenido y el estado accesible se actualizan de inmediato, sin esperar a la animación
// And con movimiento reducido la duración queda en cero sin ocultar contenido ni perder el estado seleccionado
//
// @vitest-environment node
//
// Harness: los escenarios hablan del componente real, así que se rinde
// `src/components/molecules/ProjectShowcase.astro` con la API de contenedor de Astro y los proyectos
// de producción (`siteContent.projects.slice(0, 6)`, la misma cuota que usa CasesSection). El entorno
// es `node` porque bajo jsdom el plugin de Vite sirve la variante de navegador de los `.astro` (mismo
// motivo documentado en section-swap.test.ts); el DOM del test es una instancia explícita de jsdom,
// inyectada como globales justo antes de arrancar `init.ts`.
//
// Límites declarados: jsdom no calcula layout ni anima. Lo que aquí se afirma es (a) el contrato
// estático de `projects.css` del que dependen cuadratura y estabilidad, con la aritmética explícita
// cuando aporta (mismo ancho y aspect-ratio mayor ⇒ más alto), y (b) el comportamiento real de
// `init.ts` sobre el DOM del componente real (selección, teclado, movimiento reducido, cambios
// rápidos). La comprobación de píxeles —cuadrado exacto, ausencia de salto de layout entre
// proyectos, recorte real— es la medición en navegador de la etapa, no este archivo.
//
// Sobre la segunda Feature: la historia de alto natural cambia el criterio de aceptación de cómo se
// consigue la estabilidad —antes valía reservar alto por cada línea, ahora ese hueco intercalado es
// justamente el defecto—, así que los escenarios de la primera Feature siguen vigentes pero sus
// aserciones dejaron de nombrar el mecanismo (`__region`/`__reserve`) y pasaron a afirmar lo que
// vale para cualquiera que las cumpla: la huella de alto del bloque de texto no cambia entre
// proyectos y nada de lo que hay debajo se reordena (`copyFootprint`, `belowCopyStructure`).

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import ProjectShowcase from '../../components/molecules/ProjectShowcase.astro';
import { siteContent } from '../../lib/core/site-content';
import type { Project } from '../../types/site';
import { initProjectShowcase } from './init';

/**
 * Medidas del baseline (build previo a esta historia) que el escenario pide conservar: el ancho del
 * selector lo fija la rejilla y su alto salía de `aspect-ratio: 16 / 9`. Quedan escritas aquí para
 * poder afirmar las dos mitades del escenario —el ancho no cambia, el alto crece— sin depender de
 * un artefacto externo al repo.
 */
const BASELINE = {
  selectorAspectRatio: '16 / 9',
  selectorsGridColumns: 'repeat(var(--showcase-count, 6), minmax(0, 1fr))',
  selectorsGap: 'clamp(8px, 1.2vw, 16px)',
  columnsAt900: 'repeat(3, minmax(0, 1fr))',
  columnsAt520: 'repeat(2, minmax(0, 1fr))'
} as const;

const PROJECTS: Project[] = siteContent.projects.slice(0, 6);
const REGION_TEXT: Array<(project: Project) => string> = [
  (project) => project.tags.join(' · '),
  (project) => project.full,
  (project) => project.desc
];

const css = readFileSync(new URL('../../styles/portfolio/projects.css', import.meta.url), 'utf8');

type CssRule = {
  selector: string;
  declarations: string;
  context: string[];
};

/** Índice justo después de la llave que cierra el bloque abierto en `open`. */
function blockEnd(source: string, open: number): number {
  let depth = 1;
  let end = open + 1;
  while (end < source.length && depth > 0) {
    if (source[end] === '{') depth += 1;
    else if (source[end] === '}') depth -= 1;
    end += 1;
  }
  return end;
}

/**
 * Reglas de un bloque ya delimitado: una at-rule con paradas propias se conserva entera, una
 * at-rule contenedora se recorre acumulando su prelude como contexto, y un prelude de selectores
 * se reparte en una regla por selector.
 */
function rulesOf(prelude: string, body: string, context: string[]): CssRule[] {
  if (prelude.startsWith('@keyframes') || prelude.startsWith('@font-face')) {
    return [{ selector: prelude, declarations: body, context }];
  }
  if (prelude.startsWith('@')) return parseRules(body, [...context, prelude]);
  return prelude.split(',').map((selector) => ({ selector: selector.trim(), declarations: body, context }));
}

/** Reglas planas del archivo: cada selector con su cuerpo y la cadena de at-rules que lo envuelve. */
function parseRules(source: string, context: string[] = []): CssRule[] {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: CssRule[] = [];
  let cursor = 0;

  while (cursor < clean.length) {
    const open = clean.indexOf('{', cursor);
    if (open === -1) break;
    const end = blockEnd(clean, open);
    rules.push(...rulesOf(clean.slice(cursor, open).trim(), clean.slice(open + 1, end - 1), context));
    cursor = end;
  }

  return rules;
}

function declarationsOf(body: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const chunk of body.split(';')) {
    const separator = chunk.indexOf(':');
    if (separator === -1) continue;
    declarations[chunk.slice(0, separator).trim()] = chunk.slice(separator + 1).trim();
  }
  return declarations;
}

function rulesFor(source: string, selector: string): CssRule[] {
  return parseRules(source).filter((rule) => rule.selector === selector);
}

/** Declaraciones del selector vengan de la regla que vengan (la última declarada gana). */
function allDeclarationsFor(source: string, selector: string): Record<string, string> {
  return rulesFor(source, selector).reduce(
    (merged, rule) => Object.assign(merged, declarationsOf(rule.declarations)),
    {} as Record<string, string>
  );
}

/** Declaraciones del selector en reglas de nivel superior, sin media queries que las sobreescriban. */
function baseDeclarationsFor(source: string, selector: string): Record<string, string> {
  return rulesFor(source, selector)
    .filter((rule) => rule.context.length === 0)
    .reduce(
      (merged, rule) => Object.assign(merged, declarationsOf(rule.declarations)),
      {} as Record<string, string>
    );
}

function columnsAt(source: string, maxWidth: number): string | undefined {
  const rule = parseRules(source).find(
    (item) =>
      item.selector === '.project-showcase__selectors' &&
      item.context.some((context) => context.includes(`max-width: ${maxWidth}px`))
  );
  return rule && declarationsOf(rule.declarations)['grid-template-columns'];
}

function normalize(value: string | undefined): string | undefined {
  return value?.replace(/\s+/g, '').toLowerCase();
}

/** Alto por unidad de ancho que produce un `aspect-ratio` (`alto / ancho`). */
function ratioValue(value: string): number {
  const [width, height] = value.split('/').map((part) => Number.parseFloat(part));
  return height / width;
}

/** Paradas (`from`, `50%`, `to`) de un `@keyframes` con sus declaraciones. */
function keyframeStops(source: string, name: string): Record<string, Record<string, string>> {
  const rule = parseRules(source).find((item) => item.selector === `@keyframes ${name}`);
  if (!rule) throw new Error(`Falta @keyframes ${name} en projects.css`);
  return Object.fromEntries(
    parseRules(rule.declarations).map((stop) => [stop.selector, declarationsOf(stop.declarations)])
  );
}

/** Propiedades que un `@keyframes` mueve: si anima alto, aparecen `height`/`margin`/`top`. */
function animatedProperties(source: string, name: string): string[] {
  return [...new Set(Object.values(keyframeStops(source, name)).flatMap((stop) => Object.keys(stop)))];
}

/** Propiedades cuyo cambio obliga al navegador a recalcular el layout: animarlas mueve lo de abajo. */
const LAYOUT_AFFECTING: string[] = [
  'height',
  'min-height',
  'max-height',
  'block-size',
  'min-block-size',
  'max-block-size',
  'width',
  'inline-size',
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-block',
  'margin-block-start',
  'margin-block-end',
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-block',
  'top',
  'bottom',
  'inset',
  'inset-block',
  'gap',
  'row-gap',
  'font-size',
  'line-height',
  'grid-template-rows',
  'flex-basis'
];

/** Nombres declarados en los `@keyframes` del archivo. */
function keyframeNames(source: string): string[] {
  return parseRules(source)
    .filter((rule) => rule.selector.startsWith('@keyframes'))
    .map((rule) => rule.selector.replace('@keyframes', '').trim());
}

/** Reglas del showcase que no son de los selectores: el panel, el texto y el marco de imagen. */
function panelRules(source: string): CssRule[] {
  return parseRules(source).filter(
    (rule) =>
      rule.selector.includes('project-showcase') &&
      !rule.selector.startsWith('@') &&
      !rule.selector.includes('__selector')
  );
}

/**
 * Qué pone en movimiento el panel y cómo: `transitioned` son las propiedades con `transition`
 * declarada (interrumpibles, retargetean hacia el último estado) y `keyframed` las que mueve un
 * `@keyframes` referenciado desde esas reglas (timeline fija, reinicia desde el principio).
 */
function panelMotionProperties(source: string): { transitioned: string[]; keyframed: string[] } {
  const names = keyframeNames(source);
  const transitioned = new Set<string>();
  const keyframed = new Set<string>();

  panelRules(source).forEach((rule) => {
    const declarations = declarationsOf(rule.declarations);
    const transition = declarations['transition-property'] ?? declarations.transition;
    if (transition) {
      transition.split(',').forEach((part) => {
        const property = part.trim().split(/\s+/)[0];
        if (property && property !== 'none') transitioned.add(property);
      });
    }
    const animation = [declarations.animation, declarations['animation-name']].filter(Boolean).join(' ');
    names
      .filter((name) => animation.includes(name))
      .forEach((name) => animatedProperties(source, name).forEach((property) => keyframed.add(property)));
  });

  return { transitioned: [...transitioned], keyframed: [...keyframed] };
}

/** Milisegundos de una duración CSS (`420ms`, `.4s`, `0ms`). */
function durationMs(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000;
  return Number.NaN;
}

type Mounted = {
  dom: { window: Window & typeof globalThis };
  root: HTMLElement;
  panel: HTMLElement;
  triggers: HTMLButtonElement[];
  title: HTMLElement;
  description: HTMLElement;
  tags: HTMLElement;
  image: HTMLImageElement;
  cleanup: () => void;
};

const GLOBAL_KEYS = ['window', 'document', 'HTMLElement', 'KeyboardEvent'] as const;
let previousGlobals: Record<string, unknown> = {};
let mounted: Mounted | undefined;

let showcaseHtml = '';

beforeAll(async () => {
  const container = await AstroContainer.create();
  showcaseHtml = await container.renderToString(ProjectShowcase, { props: { projects: PROJECTS } });
});

// jsdom 30 no publica tipos propios; se carga con `createRequire` para no añadir un shim de tipos
// sólo por este harness (astro/container exige entorno node, así que el entorno de vitest no basta).
const nodeRequire = createRequire(import.meta.url);
const { JSDOM } = nodeRequire('jsdom') as {
  JSDOM: new (html?: string, options?: { pretendToBeVisual?: boolean }) => Mounted['dom'];
};

function installDom(win: Window & typeof globalThis): void {
  const holder = globalThis as unknown as Record<string, unknown>;
  previousGlobals = {};
  for (const key of GLOBAL_KEYS) {
    previousGlobals[key] = holder[key];
    holder[key] = (win as unknown as Record<string, unknown>)[key];
  }
}

function restoreGlobals(): void {
  const holder = globalThis as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(previousGlobals)) {
    if (value === undefined) delete holder[key];
    else holder[key] = value;
  }
  previousGlobals = {};
}

function mountShowcase(options: { reducedMotion?: boolean } = {}): Mounted {
  const dom = new JSDOM(`<!doctype html><html><body>${showcaseHtml}</body></html>`, {
    pretendToBeVisual: true
  });
  const win = dom.window;
  // jsdom no implementa matchMedia: se declara para fijar la política de movimiento del caso.
  Object.defineProperty(win, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: options.reducedMotion === true && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    })
  });
  installDom(win);

  const root = win.document.querySelector<HTMLElement>('[data-project-showcase]');
  if (!root) throw new Error('ProjectShowcase no renderiza [data-project-showcase]');
  const query = <T extends Element>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`El showcase real no expone ${selector}`);
    return element;
  };

  const cleanup = initProjectShowcase(root);
  mounted = {
    dom,
    root,
    panel: query<HTMLElement>('[data-project-panel]'),
    triggers: [...root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]')],
    title: query<HTMLElement>('[data-project-title]'),
    description: query<HTMLElement>('[data-project-description]'),
    tags: query<HTMLElement>('[data-project-tags]'),
    image: query<HTMLImageElement>('[data-project-image]'),
    cleanup
  };
  return mounted;
}

/** Vuelve a montar el showcase con otra política de movimiento, cerrando antes el montaje vigente. */
function remountShowcase(options: { reducedMotion?: boolean } = {}): Mounted {
  const previous = mounted;
  if (previous) {
    previous.cleanup();
    restoreGlobals();
    previous.dom.window.close();
    mounted = undefined;
  }
  return mountShowcase(options);
}

function press(trigger: HTMLButtonElement, key: string): void {
  // `KeyboardEvent` es el global de jsdom, instalado por `installDom`.
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function pressed(triggers: HTMLButtonElement[]): HTMLButtonElement[] {
  return triggers.filter((trigger) => trigger.getAttribute('aria-pressed') === 'true');
}

/**
 * Huella de alto del bloque de texto: todo lo que puede decidir cuánto mide —una capa de medida
 * oculta, una medida en línea, una variable calculada— sin nombrar cuál de esos mecanismos se usa.
 * Si la huella no cambia al alternar proyectos, nada de lo que hay debajo se mueve.
 */
function copyFootprint(root: HTMLElement): string {
  const panel = root.querySelector<HTMLElement>('[data-project-panel]') ?? root;
  const copy = panel.querySelector<HTMLElement>('.project-showcase__copy') ?? panel;
  const reserved = [...panel.querySelectorAll('[aria-hidden="true"]')].map((node) => node.textContent?.trim() ?? '');
  const inline = [root, panel, copy, ...copy.querySelectorAll<HTMLElement>('*')].map(
    (element) => element.getAttribute('style') ?? ''
  );
  return JSON.stringify({ reserved, inline });
}

/**
 * Orden y clases estructurales de lo que se pinta fuera del bloque de texto (marco de imagen y
 * selectores). Las clases de tema del medio (`card__media--<slug>`) cambian con el proyecto por
 * diseño, así que no entran: lo que se compara es la composición, no el color.
 */
function belowCopyStructure(root: HTMLElement): string[] {
  const panel = root.querySelector<HTMLElement>('[data-project-panel]');
  return [...(panel?.children ?? []), ...root.children]
    .filter((node) => !node.classList.contains('project-showcase__copy'))
    .map((node) => {
      const tokens = [...node.classList].filter((token) => token.startsWith('project-showcase')).sort();
      return `${node.tagName}.${tokens.join('.')}`;
    });
}

/** Texto que un lector de pantalla recorre: fuera la capa de medida, que va `aria-hidden`. */
function accessibleText(panel: HTMLElement): string {
  const clone = panel.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  const walk = (node: Node): string =>
    [...node.childNodes]
      .map((child) =>
        child.nodeType === 3 ? (child.textContent ?? '') : `${walk(child)} `
      )
      .join('');
  return walk(clone).replace(/\s+/g, ' ').trim();
}

afterEach(() => {
  mounted?.cleanup();
  restoreGlobals();
  mounted?.dom.window.close();
  mounted = undefined;
  vi.useRealTimers();
});

describe('Selectores cuadrados y continuidad del showcase', () => {
  // Scenario: convierte los selectores en cuadrados aumentando su alto sin reducir su ancho
  it('convierte los selectores en cuadrados aumentando su alto sin reducir su ancho', () => {
    // Then cada selector tiene alto igual a ancho con tolerancia de un píxel CSS
    const aspectRatio = baseDeclarationsFor(css, '.project-showcase__selector')['aspect-ratio'];
    expect(aspectRatio).toBeDefined();
    expect(ratioValue(aspectRatio as string)).toBe(1);

    // And conserva el ancho baseline y aumenta su alto respecto al rectángulo baseline
    // El ancho del selector es el de su columna: si la rejilla, la separación y `min-width` siguen
    // iguales al baseline y sólo cambia la relación de aspecto, el ancho se conserva y el alto crece
    // (para el mismo ancho, alto = ancho / ratio: de 9/16·ancho a 1·ancho).
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selectors')['grid-template-columns'])).toBe(
      normalize(BASELINE.selectorsGridColumns)
    );
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selectors').gap)).toBe(
      normalize(BASELINE.selectorsGap)
    );
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selector')['min-width'])).toBe('0');
    expect(allDeclarationsFor(css, '.project-showcase__selector').width).toBeUndefined();
    expect(allDeclarationsFor(css, '.project-showcase__selector').height).toBeUndefined();
    expect(ratioValue(BASELINE.selectorAspectRatio)).toBeLessThan(1);
    expect(ratioValue(aspectRatio as string)).toBeGreaterThan(ratioValue(BASELINE.selectorAspectRatio));

    // And conserva columnas, separación, imágenes de fondo y todos los proyectos accesibles sin desbordamiento horizontal
    expect(normalize(columnsAt(css, 900))).toBe(normalize(BASELINE.columnsAt900));
    expect(normalize(columnsAt(css, 520))).toBe(normalize(BASELINE.columnsAt520));
    // `minmax(0, 1fr)` con `min-width: 0` impide que una columna crezca más que su fracción: la
    // fila no puede desbordar el contenedor por contenido.
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selectors')['grid-template-columns'])).toContain(
      'minmax(0,1fr)'
    );

    const { root, triggers } = mountShowcase();
    expect(triggers).toHaveLength(PROJECTS.length);
    expect(root.style.getPropertyValue('--showcase-count')).toBe(String(PROJECTS.length));
    triggers.forEach((trigger, index) => {
      expect(trigger.getAttribute('aria-label')).toBe(PROJECTS[index].full);
      expect(trigger.style.backgroundImage).toContain(PROJECTS[index].image);
      expect(trigger.querySelectorAll('img')).toHaveLength(0);
      expect(trigger.textContent?.trim()).toBe('');
    });
    expect(pressed(triggers)).toEqual([triggers[0]]);
  });

  // Scenario: mantiene estable la composición al alternar textos de una y dos líneas
  it('mantiene estable la composición al alternar textos de una y dos líneas', () => {
    const { root, triggers, title, description, tags } = mountShowcase();

    // Given el showcase real con títulos y descripciones que ocupan una o dos líneas al ancho probado
    // (proxy determinista de "volúmenes de texto distintos": en jsdom no hay líneas, y los seis
    // proyectos de producción no miden lo mismo, así que la alternancia mueve el contenido real).
    expect(new Set(PROJECTS.map((project) => project.full.length)).size).toBeGreaterThan(1);
    expect(new Set(PROJECTS.map((project) => project.desc.length)).size).toBeGreaterThan(1);
    // El panel pinta las tres regiones de texto del proyecto vigente, una sola vez cada una.
    expect([tags, title, description].map((element) => element.textContent)).toEqual(
      REGION_TEXT.map((read) => read(PROJECTS[0]))
    );

    // El texto no fija alto ni recorta: la altura sale del contenido, no de un número de líneas
    // adivinado. Cómo se estabiliza el bloque lo decide la Feature de alto natural; aquí sólo se
    // afirma lo que vale para cualquier mecanismo que la cumpla.
    ['.project-showcase__copy', '.project-showcase__region', '.project-showcase__title', '.project-showcase__description'].forEach(
      (selector) => {
        const declarations = allDeclarationsFor(css, selector);
        expect(declarations.height).toBeUndefined();
        expect(declarations['max-height']).toBeUndefined();
        expect(declarations.overflow).toBeUndefined();
        expect(declarations['overflow-y']).toBeUndefined();
        expect(declarations['text-overflow']).toBeUndefined();
        expect(declarations['-webkit-line-clamp']).toBeUndefined();
      }
    );

    // And la continuidad visual no depende de animar el alto de las regiones de texto
    const motion = panelMotionProperties(css);
    [...motion.transitioned, ...motion.keyframed].forEach((property) => {
      expect(LAYOUT_AFFECTING).not.toContain(property);
    });
    expect([...motion.transitioned, ...motion.keyframed]).toContain('opacity');

    // When se alternan esos proyectos en ambos sentidos a viewport fijo
    const footprintBefore = copyFootprint(root);
    const order = [1, 3, 0, 5, 2, 0];
    order.forEach((index) => {
      triggers[index].click();
      // And durante y después de cada transición el contenido permanece completo sin recortes, solapamientos ni elipsis
      expect(title.textContent).toBe(PROJECTS[index].full);
      expect(description.textContent).toBe(PROJECTS[index].desc);
      expect(tags.textContent).toBe(PROJECTS[index].tags.join(' · '));
      // Then el inicio de la descripción, el marco de imagen y los selectores conservan sus posiciones de layout
      // (la huella de alto del bloque de texto no depende del proyecto vigente; el píxel exacto lo
      //  mide la verificación en navegador de la etapa, porque jsdom no calcula layout).
      expect(copyFootprint(root)).toBe(footprintBefore);
    });
    expect(description.textContent).not.toContain('…');
    expect(title.textContent).not.toContain('…');
  });

  // Scenario: adapta las regiones estables al cambiar el ancho disponible
  it('adapta las regiones estables al cambiar el ancho disponible', () => {
    // Then los selectores siguen siendo cuadrados respetando el ancho y las columnas correspondientes a ese viewport
    // La cuadratura se declara una sola vez, en la regla base: ningún breakpoint la sobreescribe ni
    // fija alto/ancho, así que vale para cualquier ancho y el cuadrado mide el ancho de su columna.
    const responsiveRules = rulesFor(css, '.project-showcase__selector').filter((rule) => rule.context.length > 0);
    expect(responsiveRules.length).toBeGreaterThan(0);
    responsiveRules.forEach((rule) => {
      const declarations = declarationsOf(rule.declarations);
      expect(declarations['aspect-ratio']).toBeUndefined();
      expect(declarations.height).toBeUndefined();
      expect(declarations.width).toBeUndefined();
    });
    expect(normalize(columnsAt(css, 900))).toBe(normalize(BASELINE.columnsAt900));
    expect(normalize(columnsAt(css, 520))).toBe(normalize(BASELINE.columnsAt520));

    // And los textos se redistribuyen y permanecen completos sin desbordamientos ni solapamientos
    // La altura del texto la calcula su contenido en el ancho vigente; ninguna caja declara alto ni
    // mínimo, así que un texto que pasa de una a tres líneas al estrecharse sólo empuja el bloque,
    // nunca lo recorta ni lo solapa.
    expect(allDeclarationsFor(css, '.project-showcase__region')['min-height']).toBeUndefined();
    expect(allDeclarationsFor(css, '.project-showcase__copy')['min-height']).toBeUndefined();
    // La proporción del marco es la vigente (4:3, ancho:alto) y se declara una sola vez en la regla
    // base: ningún breakpoint la cambia, así que la estabilidad vale en cualquier ancho.
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__media')['aspect-ratio'])).toBe('4/3');

    // And a cada ancho fijo el marco de imagen y los selectores permanecen estables entre proyectos
    // El marco de imagen saca su alto de su propia relación de aspecto (no del texto) y la huella de
    // alto del bloque de texto es la misma para cualquier proyecto.
    const { root, triggers } = mountShowcase();
    expect(triggers).toHaveLength(PROJECTS.length);
    const footprintBefore = copyFootprint(root);
    const structureBefore = belowCopyStructure(root);
    triggers.forEach((trigger, index) => {
      trigger.click();
      expect(root.querySelector('[data-project-title]')?.textContent).toBe(PROJECTS[index].full);
      expect(copyFootprint(root)).toBe(footprintBefore);
      expect(belowCopyStructure(root)).toEqual(structureBefore);
    });
  });

  // Scenario: conserva la última selección durante cambios rápidos y repetidos
  it('conserva la última selección durante cambios rápidos y repetidos', () => {
    // Given el showcase real con movimiento habilitado
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });
    const { root, triggers, title, description, tags, image } = mountShowcase();
    expect(root.dataset.reducedMotion).toBe('false');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('420ms');
    // jsdom agenda sus propios temporizadores (p. ej. al enfocar), así que se compara contra el
    // conteo de partida: lo que se afirma es que la activación no deja trabajo pendiente.
    const timersBefore = vi.getTimerCount();
    const footprintBefore = copyFootprint(root);

    // When se seleccionan varios proyectos antes de terminar cada transición y se vuelve al primero
    const order = [2, 4, 3, 1, 0];
    order.forEach((index) => {
      triggers[index].click();
      // Then cada activación muestra inmediatamente un único selector seleccionado
      expect(pressed(triggers)).toEqual([triggers[index]]);
      expect(title.textContent).toBe(PROJECTS[index].full);
      expect(description.textContent).toBe(PROJECTS[index].desc);
      expect(root.dataset.activeProject).toBe(String(index));
      expect(root.getAttribute('data-project-transitioning')).toBe('true');
      expect(vi.getTimerCount()).toBe(timersBefore);
    });

    // And al terminar las transiciones título, descripción, etiquetas, imagen y texto alternativo corresponden a la última selección
    const last = order[order.length - 1];
    expect(title.textContent).toBe(PROJECTS[last].full);
    expect(description.textContent).toBe(PROJECTS[last].desc);
    expect(tags.textContent).toBe(PROJECTS[last].tags.join(' · '));
    expect(image.getAttribute('src')).toBe(`/${PROJECTS[last].image}`);
    expect(image.alt).toBe(PROJECTS[last].full);
    expect(pressed(triggers)).toEqual([triggers[last]]);

    // And ningún cambio pendiente restaura un proyecto anterior ni deja contenido invisible o controles bloqueados
    expect(vi.getTimerCount()).toBe(timersBefore);
    [title, description, tags, image].forEach((element) => {
      expect(element.style.opacity).toBe('');
      expect(element.style.visibility).toBe('');
      expect(element.style.display).toBe('');
    });
    triggers.forEach((trigger) => expect(trigger.disabled).toBe(false));
    // El estado de reposo del texto es visible y sin desplazar: ninguna regla del panel deja
    // opacidad cero fuera del estado de transición, de modo que al terminar el movimiento —sea una
    // transición o un fotograma final— el contenido queda a la vista.
    panelRules(css)
      .filter((rule) => !rule.selector.includes('data-project-transitioning'))
      .forEach((rule) => {
        expect(declarationsOf(rule.declarations).opacity).not.toBe('0');
      });

    // And nuevas selecciones siguen funcionando sin saltos de layout
    triggers[5].click();
    expect(title.textContent).toBe(PROJECTS[5].full);
    expect(pressed(triggers)).toEqual([triggers[5]]);
    expect(copyFootprint(root)).toBe(footprintBefore);
  });

  // Scenario: conserva la selección accesible y el foco al navegar con teclado
  it('conserva la selección accesible y el foco al navegar con teclado', () => {
    // Given el showcase real con sus botones y panel de actualización accesible
    const { root, panel, triggers, title, description, tags, image } = mountShowcase();
    expect(panel.getAttribute('aria-live')).toBe('polite');
    expect(panel.getAttribute('aria-atomic')).toBe('true');

    // When se recorren los selectores con Tab y se activan proyectos con Enter y Espacio durante las transiciones
    triggers.forEach((trigger) => {
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
    });

    // Then el foco visible permanece en el botón activado y todos los selectores conservan su nombre accesible
    triggers[2].focus();
    press(triggers[2], 'Enter');
    expect(document.activeElement).toBe(triggers[2]);
    triggers[4].focus();
    press(triggers[4], ' ');
    expect(document.activeElement).toBe(triggers[4]);
    // Activar encadenado, sin esperar a que la transición anterior termine.
    triggers[1].focus();
    press(triggers[1], ' ');
    triggers[3].focus();
    press(triggers[3], 'Enter');
    expect(document.activeElement).toBe(triggers[3]);
    triggers.forEach((trigger, index) => expect(trigger.getAttribute('aria-label')).toBe(PROJECTS[index].full));

    // And exactamente un botón tiene aria-pressed verdadero y coincide con el contenido seleccionado
    const selected = 3;
    expect(pressed(triggers)).toEqual([triggers[selected]]);
    expect(title.textContent).toBe(PROJECTS[selected].full);
    expect(description.textContent).toBe(PROJECTS[selected].desc);
    expect(tags.textContent).toBe(PROJECTS[selected].tags.join(' · '));

    // And el panel conserva aria-live polite y aria-atomic verdadero sin duplicar contenido para lectores de pantalla
    expect(accessibleText(panel)).toBe(
      `${PROJECTS[selected].tags.join(' · ')} ${PROJECTS[selected].full} ${PROJECTS[selected].desc}`
    );
    PROJECTS.filter((_, index) => index !== selected).forEach((project) => {
      expect(accessibleText(panel)).not.toContain(project.full);
    });
    // Lo que está oculto para asistencias no mete controles ni foco duplicados en la tabulación.
    expect(
      root.querySelectorAll('[aria-hidden="true"] button, [aria-hidden="true"] a, [aria-hidden="true"] [tabindex]')
    ).toHaveLength(0);

    // And se conservan imágenes de fondo sin nombres visibles en selectores y la imagen principal con su texto alternativo
    triggers.forEach((trigger, index) => {
      expect(trigger.textContent?.trim()).toBe('');
      expect(trigger.textContent).not.toContain(PROJECTS[index].full);
      expect(trigger.style.backgroundImage).toContain(PROJECTS[index].image);
    });
    expect(image.getAttribute('src')).toBe(`/${PROJECTS[selected].image}`);
    expect(image.alt).toBe(PROJECTS[selected].full);
    // El anillo de foco es global (`:focus-visible` en base.css) y el showcase no lo borra.
    expect(baseDeclarationsFor(css, '.project-showcase__selector')['outline']).toBeUndefined();
  });

  // Scenario: mantiene contenido y feedback inmediato con movimiento reducido
  it('mantiene contenido y feedback inmediato con movimiento reducido', () => {
    // Given el showcase real cargado con prefers-reduced-motion reduce
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });
    const { root, triggers, title, description, tags, image } = mountShowcase({ reducedMotion: true });
    expect(root.dataset.reducedMotion).toBe('true');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('0ms');
    // jsdom agenda sus propios temporizadores (p. ej. al enfocar), así que se compara contra el
    // conteo de partida: lo que se afirma es que la activación no deja trabajo pendiente.
    const timersBefore = vi.getTimerCount();
    const footprintBefore = copyFootprint(root);

    // When se alternan rápidamente proyectos mediante clic y teclado
    const order = [3, 5, 2, 0];
    order.forEach((index) => {
      triggers[index].click();
      // Then se omite el movimiento espacial no esencial sin esperar una animación para actualizar la selección
      expect(title.textContent).toBe(PROJECTS[index].full);
      expect(pressed(triggers)).toEqual([triggers[index]]);
      expect(vi.getTimerCount()).toBe(timersBefore);
    });
    const last = 4;
    triggers[last].focus();
    const timersAfterFocus = vi.getTimerCount();
    press(triggers[last], 'Enter');
    expect(vi.getTimerCount()).toBe(timersAfterFocus);

    // And el último proyecto queda completo y visible con su estado accesible y foco conservados
    expect(document.activeElement).toBe(triggers[last]);
    expect(title.textContent).toBe(PROJECTS[last].full);
    expect(description.textContent).toBe(PROJECTS[last].desc);
    expect(tags.textContent).toBe(PROJECTS[last].tags.join(' · '));
    expect(image.getAttribute('src')).toBe(`/${PROJECTS[last].image}`);
    expect(image.alt).toBe(PROJECTS[last].full);
    expect(pressed(triggers)).toEqual([triggers[last]]);
    expect(vi.getTimerCount()).toBe(timersAfterFocus);

    // And las regiones de texto, imagen y selectores mantienen la misma estabilidad de layout
    expect(copyFootprint(root)).toBe(footprintBefore);

    // La política de movimiento reducido apaga duraciones sin esconder contenido ni borrar el estado.
    const reducedMotionRules = parseRules(css).filter((rule) =>
      rule.selector.includes('[data-reduced-motion="true"]')
    );
    expect(reducedMotionRules.length).toBeGreaterThan(0);
    reducedMotionRules.forEach((rule) => {
      const declarations = declarationsOf(rule.declarations);
      expect(declarations.display).toBeUndefined();
      expect(declarations.visibility).toBeUndefined();
      expect(declarations.opacity).toBeUndefined();
    });
    const timingRule = parseRules(css).find(
      (rule) => rule.selector === '.project-showcase[data-reduced-motion="true"] *'
    );
    expect(normalize(timingRule && declarationsOf(timingRule.declarations)['animation-duration'])).toBe('0ms!important');
    expect(normalize(timingRule && declarationsOf(timingRule.declarations)['transition-duration'])).toBe('0ms!important');

    // El único movimiento espacial no esencial (levantar el selector al pasar el foco) se anula;
    // el feedback de estado seleccionado sigue vivo y fuera del bloque de movimiento reducido.
    const hoverInReducedMotion = rulesFor(css, '.project-showcase[data-reduced-motion="true"] .project-showcase__selector:hover');
    expect(hoverInReducedMotion).toHaveLength(1);
    expect(declarationsOf(hoverInReducedMotion[0].declarations).transform).toBe('none');
    const selectedRules = rulesFor(css, '.project-showcase__selector[aria-pressed="true"]');
    expect(selectedRules.filter((rule) => rule.context.length === 0)).toHaveLength(1);
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selector:hover').opacity)).toBe('.9');
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__selector[aria-pressed="true"]').opacity)).toBe('1');
  });
});

describe('Alto natural del texto y animación del cambio de proyecto', () => {
  // Scenario: elimina el espacio reservado entre las líneas cuando el proyecto seleccionado ocupa menos alto
  it('elimina el espacio reservado entre las líneas cuando el proyecto seleccionado ocupa menos alto', () => {
    // Given el showcase real de Casos documentados con proyectos de distinto volumen de texto
    const volume = (project: Project): number =>
      REGION_TEXT.reduce((total, read) => total + read(project).length, 0);
    expect(new Set(PROJECTS.map(volume)).size).toBeGreaterThan(1);
    const shortest = PROJECTS.reduce(
      (best, project, index) => (volume(project) < volume(PROJECTS[best]) ? index : best),
      0
    );

    // When el visitante selecciona el proyecto cuyo título y descripción ocupan menos alto
    const { root, triggers, title, description, tags } = mountShowcase();
    triggers[shortest].click();
    expect(title.textContent).toBe(PROJECTS[shortest].full);

    // Then las etiquetas, el título y la descripción quedan separados solo por el espaciado del bloque de texto
    // (el bloque declara `gap`; nada más puede meterse entre dos líneas vivas para empujarlas).
    expect(baseDeclarationsFor(css, '.project-showcase__copy').gap).toBeDefined();
    const others = PROJECTS.filter((_, index) => index !== shortest);
    [tags, title, description].forEach((live) => {
      const siblings = [...(live.parentElement?.children ?? [])].filter((node) => node !== live);
      siblings.forEach((sibling) => {
        // And ninguna caja de texto reserva alto para las variantes de los demás proyectos
        // Una capa de medida a nivel de bloque sigue siendo válida (estabiliza sin intercalar hueco);
        // lo que este escenario prohíbe es reservar alto pegado a cada línea.
        expect(sibling.getAttribute('aria-hidden')).not.toBe('true');
        others.forEach((project) => {
          expect(sibling.textContent ?? '').not.toContain(project.full);
          expect(sibling.textContent ?? '').not.toContain(project.desc);
        });
      });
    });

    // And ni el CSS ni los estilos en línea fijan alto, alto mínimo o relación de aspecto a esas cajas de texto
    // (la línea de etiquetas es hoy `.project-showcase__tags`: el eyebrow ya no existe)
    [
      '.project-showcase__copy',
      '.project-showcase__region',
      '.project-showcase__tags',
      '.project-showcase__title',
      '.project-showcase__description',
      '.project-showcase__live'
    ].forEach((selector) => {
      const declarations = allDeclarationsFor(css, selector);
      ['height', 'min-height', 'max-height', 'block-size', 'min-block-size', 'max-block-size', 'aspect-ratio'].forEach(
        (property) => expect(declarations[property]).toBeUndefined()
      );
    });
    const copy = root.querySelector<HTMLElement>('.project-showcase__copy');
    expect(copy).not.toBeNull();
    [copy as HTMLElement, ...(copy as HTMLElement).querySelectorAll<HTMLElement>('*')].forEach((element) => {
      expect(element.style.height).toBe('');
      expect(element.style.minHeight).toBe('');
      expect(element.style.aspectRatio).toBe('');
    });
  });

  // Scenario: conserva la posición de los elementos situados debajo al cambiar de proyecto
  it('conserva la posición de los elementos situados debajo al cambiar de proyecto', () => {
    // Given el showcase real con el marco de imagen y los selectores debajo del bloque de texto
    const { root, panel, triggers, title } = mountShowcase();
    const footprintBefore = copyFootprint(root);
    const structureBefore = belowCopyStructure(root);
    expect(belowCopyStructure(root)).toContain('DIV.project-showcase__selectors');

    // Then el alto del bloque de texto no depende del proyecto seleccionado sino de una medida del contenido real
    // Vale cualquiera de las dos formas de medir: una capa oculta que contiene las variantes de
    // todos los proyectos, o una medida calculada y publicada como variable en el root. Un número
    // fijo escrito a mano no vale: lo prohíbe el escenario de alto natural.
    const reservedText = [...panel.querySelectorAll('[aria-hidden="true"]')]
      .map((node) => node.textContent ?? '')
      .join(' ');
    const coversEveryProject = PROJECTS.every(
      (project) => reservedText.includes(project.full) && reservedText.includes(project.desc)
    );
    const measuredVariable = /--[\w-]*(?:size|height)[\w-]*\s*:/.test(root.getAttribute('style') ?? '');
    expect(coversEveryProject || measuredVariable).toBe(true);

    // When se alternan todos los proyectos en ambos sentidos a viewport fijo
    const order = [...PROJECTS.keys()];
    [...order, ...[...order].reverse()].forEach((index) => {
      triggers[index].click();
      expect(title.textContent).toBe(PROJECTS[index].full);
      // And el marco de imagen, los selectores y el resto de la página conservan su posición
      // (el píxel exacto lo mide la verificación en navegador; aquí se afirma que ni la huella de
      //  alto del bloque de texto ni la composición de lo que va debajo dependen del proyecto).
      expect(copyFootprint(root)).toBe(footprintBefore);
      expect(belowCopyStructure(root)).toEqual(structureBefore);
    });

    // El alto del marco de imagen lo fija su propia relación de aspecto (4:3, ancho:alto), no el texto que tiene encima.
    expect(normalize(baseDeclarationsFor(css, '.project-showcase__media')['aspect-ratio'])).toBe('4/3');

    // And la animación del cambio no mueve ni redimensiona la caja de ningún elemento
    const motion = panelMotionProperties(css);
    [...motion.transitioned, ...motion.keyframed].forEach((property) => {
      expect(LAYOUT_AFFECTING).not.toContain(property);
    });
  });

  // Scenario: conserva el contenido completo de cada proyecto sin recortes ni elipsis
  it('conserva el contenido completo de cada proyecto sin recortes ni elipsis', () => {
    // Given el showcase real con los textos de producción
    const { panel, triggers, title, description, tags } = mountShowcase();

    // When se recorre cada proyecto
    triggers.forEach((trigger, index) => {
      trigger.click();
      const project = PROJECTS[index];

      // Then etiquetas, título y descripción se muestran completos e idénticos al contenido de origen
      expect(tags.textContent).toBe(project.tags.join(' · '));
      expect(title.textContent).toBe(project.full);
      expect(description.textContent).toBe(project.desc);
      [tags, title, description].forEach((element) => {
        expect(element.textContent).not.toContain('…');
        expect(element.textContent).not.toContain('...');
      });

      // And el lector de pantalla anuncia solo el proyecto seleccionado, sin duplicados
      expect(accessibleText(panel)).toBe(`${project.tags.join(' · ')} ${project.full} ${project.desc}`);
      PROJECTS.filter((_, other) => other !== index).forEach((rest) => {
        expect(accessibleText(panel)).not.toContain(rest.full);
      });
    });

    // And ninguna regla recorta, desborda ni elipsa esos textos
    // (la línea de etiquetas es hoy `.project-showcase__tags`: el eyebrow ya no existe)
    [
      '.project-showcase__copy',
      '.project-showcase__region',
      '.project-showcase__tags',
      '.project-showcase__title',
      '.project-showcase__description',
      '.project-showcase__live'
    ].forEach((selector) => {
      const declarations = allDeclarationsFor(css, selector);
      ['overflow', 'overflow-y', 'text-overflow', '-webkit-line-clamp', 'max-height', 'max-block-size', 'white-space'].forEach(
        (property) => expect(declarations[property]).toBeUndefined()
      );
    });
  });

  // Scenario: anima el cambio de proyecto con transiciones interrumpibles y movimiento reducido
  it('anima el cambio de proyecto con transiciones interrumpibles y movimiento reducido', () => {
    // Given el showcase real con la política de movimiento de la skill animate
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });
    const { dom, root, triggers, title, description, tags } = mountShowcase();

    // Then el cambio se anima con transiciones interrumpibles y no con una secuencia de keyframes que reinicia
    // Una transición interpola hacia el último estado y se retargetea a mitad de camino; un
    // `@keyframes` corre en una línea de tiempo fija y hay que reiniciarlo, que es lo que se
    // sentía roto al encadenar selecciones.
    const motion = panelMotionProperties(css);
    expect(motion.keyframed).toEqual([]);
    expect(motion.transitioned).toContain('opacity');
    panelRules(css).forEach((rule) => {
      const declarations = declarationsOf(rule.declarations);
      expect(declarations.animation).toBeUndefined();
      expect(declarations['animation-name']).toBeUndefined();
    });

    // And solo se animan propiedades que no provocan layout (opacidad y transformaciones)
    expect(motion.transitioned).not.toContain('all');
    motion.transitioned.forEach((property) => {
      expect(LAYOUT_AFFECTING).not.toContain(property);
      expect(['opacity', 'transform', 'translate', 'scale', 'rotate', 'filter']).toContain(property);
    });
    const duration = durationMs(root.style.getPropertyValue('--showcase-duration'));
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThanOrEqual(420);

    // When se encadenan selecciones antes de que termine la transición anterior
    const timersBefore = vi.getTimerCount();
    [2, 5, 1, 4].forEach((index) => {
      triggers[index].click();
      // And el contenido y el estado accesible se actualizan de inmediato, sin esperar a la animación
      // (el movimiento nunca es el único canal de feedback: el texto y `aria-pressed` ya cambiaron).
      expect(title.textContent).toBe(PROJECTS[index].full);
      expect(description.textContent).toBe(PROJECTS[index].desc);
      expect(tags.textContent).toBe(PROJECTS[index].tags.join(' · '));
      expect(pressed(triggers)).toEqual([triggers[index]]);
      expect(vi.getTimerCount()).toBe(timersBefore);
    });

    // Y cada activación rearma la entrada en el mismo fotograma: el panel pasa por la pose de
    // entrada que el CSS ancla sin transición y sale a la pose de reposo, que es la que transiciona.
    // Sin ese paso intermedio las capas ya estarían en reposo y el cambio dejaría de animarse, así
    // que se comprueba la señal que une ambos lados —el valor que escribe `init.ts` es el que el CSS
    // estila— y no sólo el estado final. `takeRecords` entrega los cambios de atributo que el clic
    // ya encoló, sin esperar al callback asíncrono del observador.
    const observer = new dom.window.MutationObserver(() => undefined);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-project-transitioning'],
      attributeOldValue: true
    });
    triggers[0].click();
    const steps = observer.takeRecords().map((record) => record.oldValue);
    observer.disconnect();

    expect(steps).toHaveLength(3);
    expect(steps[1]).toBeNull();
    const armed = steps[2];
    const resting = root.dataset.projectTransitioning;
    expect(armed).not.toBe(resting);
    const armedRules = parseRules(css).filter((rule) =>
      rule.selector.includes(`[data-project-transitioning="${armed}"]`)
    );
    expect(armedRules.length).toBeGreaterThan(0);
    armedRules.forEach((rule) => {
      const declarations = declarationsOf(rule.declarations);
      expect(declarations.transition).toBe('none');
      expect(declarations.opacity).toBe('0');
    });
    // La pose de reposo no ancla nada: es la que el navegador interpola al soltarla.
    expect(resting).toBeTruthy();
    expect(
      parseRules(css).some((rule) => rule.selector.includes(`[data-project-transitioning="${resting}"]`))
    ).toBe(false);

    // And con movimiento reducido la duración queda en cero sin ocultar contenido ni perder el estado seleccionado
    const reduced = remountShowcase({ reducedMotion: true });
    expect(reduced.root.dataset.reducedMotion).toBe('true');
    expect(durationMs(reduced.root.style.getPropertyValue('--showcase-duration'))).toBe(0);
    reduced.triggers[3].click();
    expect(reduced.title.textContent).toBe(PROJECTS[3].full);
    expect(reduced.description.textContent).toBe(PROJECTS[3].desc);
    expect(reduced.tags.textContent).toBe(PROJECTS[3].tags.join(' · '));
    expect(pressed(reduced.triggers)).toEqual([reduced.triggers[3]]);
    parseRules(css)
      .filter((rule) => rule.selector.includes('[data-reduced-motion="true"]'))
      .forEach((rule) => {
        const declarations = declarationsOf(rule.declarations);
        expect(declarations.display).toBeUndefined();
        expect(declarations.visibility).toBeUndefined();
        expect(declarations.opacity).toBeUndefined();
      });
  });
});
