// Feature: Navegación completa y estructura semántica sin regresiones visuales
//
// Scenario: conserva Contacto en navigation y lo ofrece en el dock
// Given la landing y su contenido de navegación
// When el visitante consulta el navbar en escritorio o móvil
// Then navigation contiene Contacto y el dock muestra su etiqueta Contacto
// And su enlace lleva a la sección Contacto existente sin retirar los demás items
//
// Scenario: resuelve cada enlace del navbar a un destino único real
// Given todos los enlaces del navbar renderizado en la landing
// When el visitante activa cualquiera de esos enlaces
// Then su href apunta al id de una sección real del documento
// And no hay destinos huérfanos ni ids duplicados en el documento
//
// Scenario: sincroniza el scroll-spy con todos los items reales del dock
// Given el dock renderizado con Contacto y el resto de sus items
// When el visitante recorre los destinos del navbar mediante scroll
// Then el item correspondiente a cada destino se indica como activo y actual
// And las secciones sin item no se convierten en destinos del scroll-spy
// And la lista vigilada coincide con los href reales del dock sin una lista fija divergente
//
// Scenario: conserva un único h1 y un h2 para cada sección principal
// Given la landing completa
// When el visitante navega por sus encabezados accesibles
// Then encuentra exactamente un h1
// And cada sección de primer nivel tiene su encabezado h2
//
// Scenario: organiza subsecciones y piezas sin encabezados huérfanos ni saltos
// Given las regiones de la landing y el contenido de un caso abierto
// When el visitante recorre el esquema accesible de encabezados
// Then cada subsección tiene un h3 dentro de la región de su h2 correspondiente
// And cada pieza dentro de una subsección tiene un h4 dentro de la región de su h3
// And no hay h3 huérfanos ni saltos de nivel
// And la pertenencia se determina por la sección y no por ser hijo literal del elemento h2
//
// Scenario: restaura container--wide con un uso visible y delimitado
// Given los estilos y las superficies reales de la landing
// When el visitante consulta la superficie que necesita anchura amplia
// Then container--wide tiene estilos efectivos y se usa en esa superficie renderizada
// And el uso tiene una justificación de layout documentada y no es CSS muerto
//
// Scenario: mantiene contenida la columna de Mi trabajo al recuperar el ancho amplio
// Given Mi trabajo y las secciones contiguas en escritorio amplio y móvil
// When el visitante recorre el portafolio con container--wide restaurado
// Then la columna de Mi trabajo mantiene su anchura limitada, equilibrada y legible
// And cualquier ampliación se limita a la superficie que la necesita sin ensanchar toda la columna
// And no aparece desbordamiento horizontal
//
// Scenario: conserva los títulos de proyectos h4 a 18px sin eyebrows
// Given las tarjetas y el showcase de proyectos
// When el visitante consulta o cambia de proyecto en escritorio y móvil
// Then los títulos de proyectos siguen siendo h4 de 18px en serif cursiva
// And los proyectos no muestran eyebrows
//
// Scenario: conserva la imagen principal cuatro a tres y los casos sin título visible
// Given el showcase de Casos documentados dentro de Mi trabajo
// When el visitante lo consulta en escritorio y móvil
// Then la imagen principal mantiene proporción ancho:alto 4:3 sin desbordar
// And Casos documentados no muestra un título visible pero conserva su encabezado accesible
//
// Scenario: conserva los experimentos como showcase con h3 accesible
// Given Cosas pequeñas hechas bien dentro de Mi trabajo
// When el visitante consulta las demostraciones
// Then conserva un h3 accesible en su subsección
// And no aparecen contenedores visibles de título o descripción ni un bloque introductorio visible
// And las demostraciones y sus controles accesibles siguen disponibles
//
// Scenario: conserva las grillas y el espaciado homogéneo
// Given las secciones y subsecciones del portafolio
// When el visitante las consulta en escritorio y móvil
// Then Proyectos y Experimentos conservan sus grillas de dos columnas en escritorio
// And las grillas se adaptan al móvil sin desbordamiento
// And el espaciado entre secciones, subsecciones y encabezados mantiene el ritmo de cada nivel
//
// Suposiciones mínimas para TDD: usar la página real y sus estilos, siguiendo los tests
// Astro/Vitest existentes; resolver allí el harness y las comprobaciones de layout.
// El esquema incluye contenido dinámico al abrir casos, no solo el HTML inicial ni
// una lista plana de headings. No se exige que un h3 sea hijo DOM literal de un h2.
// TDD elegirá y documentará la superficie justificada para container--wide sin imponer
// aquí una anchura nueva ni ampliar el contenedor de lectura completo de Mi trabajo.
// Cobertura previa preservada: portfolio-corrections, portfolio-consistency,
// section-swap y dock-spy. Sus tests activos no se modifican ni se desactivan.
// Atención para TDD: CaseWindow presenta actualmente h4 bajo la región h2 Trabajo;
// corregir su esquema sin perder el contrato vigente de títulos de proyecto h4.
//
// Decisiones de TDD (el mínimo cambio que satisface los escenarios):
// - Contacto vuelve a `navigation` como último destino (`#contacto`, etiqueta «Contacto»,
//   icono `i-bubble` que ya vive en el sprite). Su posición final coincide con el orden real
//   del documento —hero, Mi trabajo, Mis notas, Servicios y experiencia, Por qué trabajar
//   conmigo, Contacto—, que es el orden que recorre el scroll-spy.
// - El scroll-spy deriva la lista vigilada del `href` de cada item renderizado del dock, no de
//   un atributo auxiliar ni de una lista fija: la fuente de verdad es el enlace real, y el
//   resaltado compara contra ese mismo destino.
// - La superficie que necesita anchura amplia es la ventana de caso (`#window`, el diálogo que
//   abre cada caso documentado): muestra la imagen del caso y la rejilla de seis preguntas, que
//   no caben con holgura en la columna de lectura. `.container--wide` vuelve a base.css con su
//   anchura de siempre (`min(69rem, calc(100% - 2 * var(--gutter))`)) y `dock-window.css` deja de
//   fijar el ancho de la ventana en escritorio para que mande el contenedor ancho; en móvil la
//   ventana conserva su ancho de viewport. Ninguna columna de lectura del portafolio la usa.
// - El esquema de encabezados de la ventana de caso pasa de `h2 > h4` a `h2 > h3 > h4`: el título
//   del caso (`case__title`) baja a h3 —su región es el h2 «Trabajo» del diálogo— y las seis
//   preguntas (`qa__label`) siguen siendo h4 dentro de la región de ese h3. Los títulos de
//   proyecto que la historia protege (`project-showcase__title`, `card__title`) siguen siendo h4.
//
// Ajuste documentado en un test previo: `portfolio-consistency.test.ts` prohibía la cadena
// «container--wide» en toda la página como guarda contra inflar Mi trabajo. El escenario nuevo
// sustituye esa guarda por su intención exacta —ninguna columna de lectura usa el contenedor
// ancho— y conserva intactas las demás comprobaciones de anchura, legibilidad y grillas.
//
// Harness: los escenarios hablan de la página real, así que se rinde `src/pages/index.astro` con
// la API de contenedor de Astro (`astro/container`) en entorno `node` —bajo jsdom el plugin sirve
// la variante de navegador de cada componente— y se leen las hojas de estilo reales de producción.
// El scroll-spy se ejecuta sobre un DOM real creado con jsdom dentro del mismo archivo, montando
// el marcado del dock tal como se sirve; no se simula geometría de píxeles, solo `offsetTop` y el
// alto de ventana, que es lo que la sonda del spy consulta. La medición visual en navegador queda
// para la etapa de verificación de layout.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import HomePage from '../../pages/index.astro';
import { documentedProjects, siteContent } from '../../lib/core/site-content';
import { initDock } from '../dock/init';

const portfolioCss = (name: string): string =>
  readFileSync(new URL(`../../styles/portfolio/${name}`, import.meta.url), 'utf8');

const BASE_CSS = portfolioCss('base.css');
const TOKENS_CSS = portfolioCss('tokens.css');
const PROJECTS_CSS = portfolioCss('projects.css');
const EXPERIMENTS_CSS = portfolioCss('experiments.css');
const DOCK_WINDOW_CSS = portfolioCss('dock-window.css');
const CARDS_CSS = readFileSync(new URL('../../styles/components/cards.css', import.meta.url), 'utf8');
const DOCK_INIT_SOURCE = readFileSync(new URL('../dock/init.ts', import.meta.url), 'utf8');

type CssRule = { selector: string; declarations: Record<string, string>; context: string[] };

function declarationsOf(body: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const chunk of body.split(';')) {
    const separator = chunk.indexOf(':');
    if (separator === -1) continue;
    declarations[chunk.slice(0, separator).trim()] = chunk.slice(separator + 1).trim();
  }
  return declarations;
}

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

/** Reglas planas del archivo: cada selector con su cuerpo y la cadena de at-rules que lo envuelve. */
function parseCss(source: string, context: string[] = []): CssRule[] {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: CssRule[] = [];
  let cursor = 0;

  while (cursor < clean.length) {
    const open = clean.indexOf('{', cursor);
    if (open === -1) break;
    const prelude = clean.slice(cursor, open).trim();
    const end = blockEnd(clean, open);
    const body = clean.slice(open + 1, end - 1);

    if (prelude.startsWith('@keyframes') || prelude.startsWith('@font-face')) {
      // Paradas y descriptores: no son selectores de encabezados, marcos ni rejillas.
    } else if (prelude.startsWith('@')) {
      rules.push(...parseCss(body, [...context, prelude]));
    } else {
      for (const selector of prelude.split(',')) {
        rules.push({ selector: selector.trim(), declarations: declarationsOf(body), context });
      }
    }

    cursor = end;
  }

  return rules;
}

/** Declaraciones del selector en reglas de nivel superior, sin media queries que las sobreescriban. */
function baseDeclarations(source: string, selector: string): Record<string, string> {
  return parseCss(source)
    .filter((rule) => rule.selector === selector && rule.context.length === 0)
    .reduce((merged, rule) => Object.assign(merged, rule.declarations), {} as Record<string, string>);
}

/** Declaraciones del selector dentro de una media query concreta. */
function mediaDeclarations(source: string, selector: string, media: string): Record<string, string> {
  return parseCss(source)
    .filter((rule) => rule.selector === selector && rule.context.includes(media))
    .reduce((merged, rule) => Object.assign(merged, rule.declarations), {} as Record<string, string>);
}

function normalize(value: string | undefined): string | undefined {
  return value?.replace(/\s+/g, '').toLowerCase();
}

function compact(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/=""/g, '');
}

function occurrences(html: string, fragment: string): number {
  return html.split(fragment).length - 1;
}

/** Contenido de `<main>`, donde viven las secciones editoriales. */
function mainOf(html: string): string {
  const start = html.indexOf('<main');
  const end = html.indexOf('</main>', start);
  if (start === -1 || end === -1) throw new Error('La página de inicio no renderiza <main>');
  return html.slice(start, end);
}

/** Elemento completo abierto en `start`, contando anidamiento del mismo tipo de etiqueta. */
function elementAt(html: string, start: number, tagName: string): { html: string; end: number } {
  const tags = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  tags.lastIndex = html.indexOf('>', start) + 1;
  let depth = 1;
  let tag: RegExpExecArray | null;
  while ((tag = tags.exec(html))) {
    if (tag[0].startsWith('</')) depth -= 1;
    else if (!tag[0].endsWith('/>')) depth += 1;
    if (depth === 0) return { html: compact(html.slice(start, tags.lastIndex)), end: tags.lastIndex };
  }
  throw new Error(`El elemento <${tagName}> abierto en ${start} no cierra correctamente`);
}

/** Región completa por su id. */
function regionOf(html: string, id: string): string {
  const startPattern = new RegExp(`<([a-z]+)[^>]*id="${id}"[^>]*>`, 'i');
  const start = startPattern.exec(html);
  if (!start || start.index === undefined) throw new Error(`La página de inicio no renderiza la región #${id}`);
  return elementAt(html, start.index, start[1]).html;
}

/** Regiones completas de los elementos cuya etiqueta de apertura declara la clase indicada. */
function regionsWithClass(html: string, className: string): string[] {
  const pattern = /<([a-z][\w-]*)\b([^>]*)>/gi;
  const classPattern = new RegExp(`class="[^"]*\\b${className}\\b`);
  const regions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    if (!classPattern.test(match[2])) continue;
    const element = elementAt(html, match.index, match[1]);
    regions.push(element.html);
    pattern.lastIndex = element.end;
  }

  return regions;
}

/** Dock renderizado: el `<nav>` de la navbar con sus items reales. */
function dockOf(html: string): string {
  const start = /<nav class="dock"[^>]*>/i.exec(html);
  if (!start || start.index === undefined) throw new Error('La página de inicio no renderiza el dock');
  return elementAt(html, start.index, 'nav').html;
}

/** Contenido de la plantilla de un caso: lo que la ventana inyecta en su cuerpo al abrirlo. */
function caseTemplateOf(html: string, slug: string): string {
  const start = new RegExp(`<template data-case-template="${slug}"[^>]*>`, 'i').exec(html);
  if (!start || start.index === undefined) throw new Error(`La página no renderiza la plantilla del caso ${slug}`);
  return elementAt(html, start.index, 'template').html.replace(/^<template[^>]*>/, '').replace(/<\/template>$/, '');
}

type ElementRef = { tag: string; attrs: string; start: number };
type OutlineEntry = { level: number; text: string; classes: string[]; start: number; ancestors: ElementRef[] };

const VOID_TAGS = new Set(['img', 'input', 'br', 'hr', 'source', 'meta', 'link']);

/**
 * Esquema de encabezados en orden de documento, con la cadena de ancestros de cada uno. Permite
 * comprobar la pertenencia por región —la sección que agrupa— y no por ser hijo DOM literal del
 * elemento `h2`, como pide el escenario.
 */
function outlineOf(html: string): OutlineEntry[] {
  const pattern = /<(\/)?([a-z][\w-]*)((?:"[^"]*"|[^>"])*)>/gi;
  const stack: ElementRef[] = [];
  const entries: OutlineEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    const tag = match[2].toLowerCase();
    if (match[1]) {
      stack.pop();
      continue;
    }

    const attrs = match[3] ?? '';
    if (/^h[1-4]$/.test(tag)) {
      const close = html.indexOf(`</${tag}`, pattern.lastIndex);
      const raw = html.slice(pattern.lastIndex, close === -1 ? html.length : close);
      const classMatch = /class="([^"]*)"/.exec(attrs);
      entries.push({
        level: Number(tag[1]),
        text: raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
        classes: classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [],
        start: match.index,
        ancestors: [...stack]
      });
      stack.push({ tag, attrs, start: match.index });
      continue;
    }

    if (!match[0].endsWith('/>') && !VOID_TAGS.has(tag)) stack.push({ tag, attrs, start: match.index });
  }

  return entries;
}

/** Región que agrupa un encabezado: la sección de primer nivel o la subsección declarada. */
const isRegion = (element: ElementRef): boolean => element.tag === 'section' || /\bsubsection\b/.test(element.attrs);

/** ¿Los dos encabezados comparten región? La pertenencia es estructural, no de padre literal. */
const shareRegion = (a: OutlineEntry, b: OutlineEntry): boolean =>
  a.ancestors.some((ancestor) => isRegion(ancestor) && b.ancestors.some((other) => other.start === ancestor.start));

/** Encabezado de nivel `level` inmediatamente anterior en el documento, si existe. */
function previousOf(entries: readonly OutlineEntry[], level: number, before: number): OutlineEntry | undefined {
  return entries.filter((entry) => entry.level === level && entry.start < before).pop();
}

/** Alto por unidad de ancho que produce un `aspect-ratio` (`alto / ancho`). */
function heightOverWidth(value: string): number {
  const [width, height] = value.split('/').map((part) => Number.parseFloat(part));
  return height / width;
}

/** Primera cota de un `min(...)` resuelta a píxeles (rem = 16px), o la longitud simple. */
function minBound(value: string): number {
  const first = (/min\(([^,]+),/.exec(value)?.[1] ?? value).trim();
  return first.endsWith('rem') ? Number.parseFloat(first) * 16 : Number.parseFloat(first);
}

/** Contenedor de lectura declarado en la primera región que lo abre. */
function containerOf(region: string): string | undefined {
  return /<div class="([^"]*\bcontainer\b[^"]*)"/.exec(region)?.[1];
}

const VIEWPORT = 1000;

// jsdom 30 no publica tipos propios; se carga con `createRequire` y una forma mínima declarada
// —el mismo recurso que usa `project-showcase-square.test.ts`— para no añadir un shim de tipos
// sólo por este harness (`astro/container` exige entorno `node`, así que el de vitest no basta).
const nodeRequire = createRequire(import.meta.url);
const { JSDOM } = nodeRequire('jsdom') as {
  JSDOM: new (html?: string) => { window: Window & typeof globalThis };
};

const GLOBAL_KEYS = ['window', 'document', 'requestAnimationFrame'] as const;
let previousGlobals: Record<string, unknown> = {};

/** Sustituye los globales del proceso por los de la ventana jsdom montada. */
function installDom(win: Window, frames: FrameRequestCallback[]): void {
  const holder = globalThis as unknown as Record<string, unknown>;
  previousGlobals = {};
  GLOBAL_KEYS.forEach((key) => {
    previousGlobals[key] = holder[key];
  });
  holder.window = win;
  holder.document = win.document;
  // `requestAnimationFrame` se cambia por una cola manual: los fotogramas se vacían a voluntad.
  holder.requestAnimationFrame = (callback: FrameRequestCallback) => frames.push(callback);
}

function restoreGlobals(): void {
  const holder = globalThis as unknown as Record<string, unknown>;
  Object.entries(previousGlobals).forEach(([key, value]) => {
    if (value === undefined) delete holder[key];
    else holder[key] = value;
  });
  previousGlobals = {};
}

type SpyHarness = {
  scrollTo: (y: number) => void;
  flush: () => void;
  active: () => Array<string | null>;
  current: () => Array<string | null>;
};

/** Marcado del dock con un item por destino, para las variantes del escenario. */
const dockItem = (id: string, label: string): string =>
  `<a class="dock__item" href="#${id}" data-section="${id}"><span class="dock__label">${label}</span></a>`;

/** Ventanas jsdom abiertas por los escenarios de spy: se cierran al terminar cada test. */
const openWindows: Window[] = [];

/**
 * Monta el scroll-spy sobre un DOM real: el marcado del dock tal como se sirve, una sección por
 * destino y una sección ajena a la navbar. jsdom no calcula layout, así que cada sección declara
 * su `offsetTop` —lo único que consulta la sonda del spy— y la ventana su alto.
 */
function mountSpy(
  dock: string,
  sections: ReadonlyArray<{ id: string; top: number }>,
  decoy?: { id: string; top: number }
): SpyHarness {
  const targets = [...sections, ...(decoy ? [decoy] : [])];
  const body = `${dock}${targets.map((section) => `<section id="${section.id}"></section>`).join('')}`;
  const { window: win } = new JSDOM(`<!doctype html><html><body>${body}</body></html>`);
  const frames: FrameRequestCallback[] = [];
  let scrollY = 0;

  openWindows.push(win);
  installDom(win, frames);

  targets.forEach(({ id, top }) => {
    const node = win.document.getElementById(id);
    if (!node) throw new Error(`El montaje no creó la sección #${id}`);
    Object.defineProperty(node, 'offsetTop', { value: top, configurable: true });
  });
  Object.defineProperty(win, 'innerHeight', { value: VIEWPORT, configurable: true });
  Object.defineProperty(win, 'scrollY', { get: () => scrollY, configurable: true });

  initDock();

  const targetsOf = (selector: string): Array<string | null> =>
    Array.from(win.document.querySelectorAll<HTMLAnchorElement>(selector)).map((item) =>
      item.getAttribute('data-section')
    );

  return {
    scrollTo: (y: number) => {
      scrollY = y;
      win.dispatchEvent(new win.Event('scroll'));
    },
    flush: () => {
      const pending = frames.splice(0, frames.length);
      pending.forEach((frame) => frame(0));
    },
    active: () => targetsOf('.dock__item.is-active'),
    current: () => targetsOf('.dock__item[aria-current="true"]')
  };
}

afterEach(() => {
  // Cerrar la ventana cancela sus tareas pendientes (el `load` que jsdom emite tarde) antes de
  // devolver los globales, para que ninguna sonda rezagada busque un `window` que ya no existe.
  openWindows.splice(0, openWindows.length).forEach((win) => win.close());
  restoreGlobals();
});

let page: string;
let main: string;
let dock: string;
let outline: OutlineEntry[];

beforeAll(async () => {
  const container = await AstroContainer.create();
  page = compact(await container.renderToString(HomePage));
  main = mainOf(page);
  dock = dockOf(page);
  outline = outlineOf(page);
});

describe('Navegación y semántica de la landing', () => {
  // Scenario: conserva Contacto en navigation y lo ofrece en el dock
  it('conserva Contacto en navigation y lo ofrece en el dock', () => {
    // Given la landing y su contenido de navegación
    // When el visitante consulta el navbar en escritorio o móvil
    // Then navigation contiene Contacto y el dock muestra su etiqueta Contacto
    const contacto = siteContent.navigation.find((section) => section.id === 'contacto');
    expect(contacto?.label).toBe('Contacto');
    expect(dock).toContain('<a class="dock__item" href="#contacto" data-section="contacto">');
    expect(dock).toContain('<span class="dock__label">Contacto</span>');
    expect(dock).toContain('<use href="#i-bubble">');

    // And su enlace lleva a la sección Contacto existente sin retirar los demás items
    const destino = regionOf(page, 'contacto');
    expect(destino).toContain('id="contacto"');
    expect(outlineOf(destino).map((heading) => heading.text)).toContain('Contacto');
    ['inicio', 'trabajo', 'blog', 'servicios'].forEach((id) => {
      expect(siteContent.navigation.map((section) => section.id)).toContain(id);
      expect(dock).toContain(`href="#${id}"`);
    });
    // Contacto cierra la navegación porque cierra la página: el orden del dock sigue el documento.
    expect(siteContent.navigation.map((section) => section.id)).toEqual([
      'inicio',
      'trabajo',
      'blog',
      'servicios',
      'contacto'
    ]);
  });

  // Scenario: resuelve cada enlace del navbar a un destino único real
  it('resuelve cada enlace del navbar a un destino único real', () => {
    // Given todos los enlaces del navbar renderizado en la landing
    const hrefs = [...dock.matchAll(/<a class="dock__item"[^>]*href="#([^"]+)"/g)].map((match) => match[1]);
    expect(hrefs).toHaveLength(siteContent.navigation.length);

    // When el visitante activa cualquiera de esos enlaces
    const ids = [...page.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);

    // Then su href apunta al id de una sección real del documento
    hrefs.forEach((id) => {
      expect(ids.filter((candidate) => candidate === id)).toHaveLength(1);
      expect(regionOf(page, id)).toContain(`id="${id}"`);
    });

    // El icono de cada item también resuelve a un símbolo real del sprite: ningún target huérfano.
    const icons = [...dock.matchAll(/<use href="#([^"]+)"/g)].map((match) => match[1]);
    expect(icons).toHaveLength(hrefs.length);
    icons.forEach((icon) => expect(ids.filter((candidate) => candidate === icon)).toHaveLength(1));

    // And no hay destinos huérfanos ni ids duplicados en el documento
    const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicados).toEqual([]);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    // And el destino del enlace es el mismo que el spy vigila: una sola fuente de verdad.
    [...dock.matchAll(/<a class="dock__item" href="#([^"]+)" data-section="([^"]+)"/g)].forEach((match) => {
      expect(match[2]).toBe(match[1]);
    });
  });

  // Scenario: sincroniza el scroll-spy con todos los items reales del dock
  it('sincroniza el scroll-spy con todos los items reales del dock', () => {
    // Given el dock renderizado con Contacto y el resto de sus items
    const ids = [...dock.matchAll(/<a class="dock__item"[^>]*href="#([^"]+)"/g)].map((match) => match[1]);
    const sections = ids.map((id, index) => ({ id, top: index * VIEWPORT }));
    const spy = mountSpy(dock, sections, { id: 'por-que', top: ids.length * VIEWPORT });

    // When el visitante recorre los destinos del navbar mediante scroll
    // Then el item correspondiente a cada destino se indica como activo y actual
    ids.forEach((id, index) => {
      spy.scrollTo(index * VIEWPORT);
      spy.flush();

      expect(spy.active()).toEqual([id]);
      expect(spy.current()).toEqual([id]);
    });

    // And las secciones sin item no se convierten en destinos del scroll-spy
    spy.scrollTo(ids.length * VIEWPORT);
    spy.flush();
    expect(spy.active()).toEqual([ids[ids.length - 1]]);

    // And la lista vigilada coincide con los href reales del dock sin una lista fija divergente:
    // el spy sigue el marcado servido. Quitando un item y añadiendo otro destino, vigila lo que
    // el dock declara —ni los ids fijos de antes ni la sección que perdió su item—.
    const recortado = dock.replace(/<a class="dock__item" href="#blog"[\s\S]*?<\/a>/, '');
    expect(recortado).not.toContain('href="#blog"');
    const adaptado = mountSpy(
      recortado.replace('</nav>', `${dockItem('por-que', 'Por qué')}</nav>`),
      [
        { id: 'inicio', top: 0 },
        { id: 'trabajo', top: VIEWPORT },
        { id: 'por-que', top: VIEWPORT * 2 },
        { id: 'servicios', top: VIEWPORT * 3 },
        { id: 'contacto', top: VIEWPORT * 4 },
        { id: 'blog', top: VIEWPORT * 5 }
      ]
    );
    adaptado.scrollTo(VIEWPORT * 2);
    adaptado.flush();
    expect(adaptado.active()).toEqual(['por-que']);

    adaptado.scrollTo(VIEWPORT * 5);
    adaptado.flush();
    expect(adaptado.active()).toEqual(['por-que']);

    // Y el módulo no guarda una lista fija de secciones: la deriva del dock renderizado.
    expect(DOCK_INIT_SOURCE).toContain('.dock__item');
    expect(DOCK_INIT_SOURCE).not.toMatch(/['"](inicio|trabajo|blog|servicios|contacto)['"]/);
  });

  // Scenario: conserva un único h1 y un h2 para cada sección principal
  it('conserva un único h1 y un h2 para cada sección principal', () => {
    // Given la landing completa
    // When el visitante navega por sus encabezados accesibles
    // Then encuentra exactamente un h1
    expect(outline.filter((heading) => heading.level === 1)).toHaveLength(1);
    expect(outline[0]).toMatchObject({ level: 1, text: 'Héctor Reyes' });

    // And cada sección de primer nivel tiene su encabezado h2
    ['inicio', 'trabajo', 'blog', 'servicios', 'por-que', 'contacto', 'window'].forEach((id) => {
      const region = regionOf(page, id);
      const headings = outlineOf(region);
      const h2 = headings.filter((heading) => heading.level === 2);
      expect(h2).toHaveLength(1);
      // El h2 abre su región: solo el hero deja pasar antes su h1.
      expect(headings.find((heading) => heading.level !== 1)).toBe(h2[0]);
    });

    // Las seis secciones editoriales conservan su nombre accesible.
    expect(outline.filter((heading) => heading.level === 2).map((heading) => heading.text)).toEqual([
      'Acerca de mí',
      'Mi trabajo',
      'Mis notas',
      'Servicios y experiencia',
      'Por qué trabajar conmigo',
      'Contacto',
      'Trabajo'
    ]);
  });

  // Scenario: organiza subsecciones y piezas sin encabezados huérfanos ni saltos
  it('organiza subsecciones y piezas sin encabezados huérfanos ni saltos', () => {
    // Given las regiones de la landing y el contenido de un caso abierto
    // When el visitante recorre el esquema accesible de encabezados
    // Then cada subsección tiene un h3 dentro de la región de su h2 correspondiente
    const subsections = regionsWithClass(main, 'subsection');
    expect(subsections.length).toBeGreaterThan(0);
    subsections.forEach((region) => {
      const headings = outlineOf(region);
      const h3 = headings.filter((heading) => heading.level === 3);
      expect(h3).toHaveLength(1);
      expect(headings[0]).toBe(h3[0]);
      // And cada pieza dentro de una subsección tiene un h4 dentro de la región de su h3
      headings.slice(1).forEach((piece) => expect(piece.level).toBe(4));
    });

    // And no hay h3 huérfanos ni saltos de nivel: cada h3 cuelga de un h2 de su región y cada
    // h4, de un h3 anterior de la suya. La pertenencia se decide por la sección que agrupa, no por
    // ser hijo DOM literal del h2. El contenido de las plantillas de caso es inerte hasta que la
    // ventana lo inyecta, así que el recorrido del documento se hace sin él.
    const rendered = outline.filter(
      (heading) => !heading.ancestors.some((ancestor) => ancestor.tag === 'template')
    );
    rendered.forEach((heading, index) => {
      if (heading.level === 1) return;
      expect(heading.level).toBeLessThanOrEqual(rendered[index - 1].level + 1);
    });
    rendered
      .filter((heading) => heading.level === 3)
      .forEach((h3) => {
        const h2 = previousOf(rendered, 2, h3.start);
        expect(h2).toBeTruthy();
        expect(shareRegion(h2 as OutlineEntry, h3)).toBe(true);
      });
    rendered
      .filter((heading) => heading.level === 4)
      .forEach((h4) => {
        const h3 = previousOf(rendered, 3, h4.start);
        expect(h3).toBeTruthy();
        expect(shareRegion(h3 as OutlineEntry, h4)).toBe(true);
        expect(
          rendered.filter(
            (entry) => entry.level === 2 && entry.start > (h3 as OutlineEntry).start && entry.start < h4.start
          )
        ).toEqual([]);
      });

    // El caso abierto de la ventana entra en el mismo esquema: su título es h3 bajo el h2 del
    // diálogo y sus seis preguntas son h4 dentro de la región de ese título. Se compone sobre la
    // región real de la ventana inyectando la plantilla, que es lo que hace el componente al abrir.
    const abierto = regionOf(page, 'window').replace(
      '<div class="window__body" id="windowBody"></div>',
      `<div class="window__body" id="windowBody">${caseTemplateOf(page, documentedProjects()[0].slug)}</div>`
    );
    const windowOutline = outlineOf(abierto);
    expect(windowOutline[0]).toMatchObject({ level: 2, text: 'Trabajo' });
    const caseTitles = windowOutline.filter((heading) => heading.classes.includes('case__title'));
    expect(caseTitles).toHaveLength(1);
    expect(caseTitles[0].level).toBe(3);
    const qaLabels = windowOutline.filter((heading) => heading.classes.includes('qa__label'));
    expect(qaLabels.length).toBeGreaterThan(0);
    qaLabels.forEach((label) => {
      expect(label.level).toBe(4);
      expect(shareRegion(caseTitles[0], label)).toBe(true);
    });
    expect(shareRegion(windowOutline[0], caseTitles[0])).toBe(true);
  });

  // Scenario: restaura container--wide con un uso visible y delimitado
  it('restaura container--wide con un uso visible y delimitado', () => {
    // Given los estilos y las superficies reales de la landing
    const wide = baseDeclarations(BASE_CSS, '.container--wide');

    // Then container--wide tiene estilos efectivos
    expect(normalize(wide['width'])).toBe('min(69rem,calc(100%-2*var(--gutter)))');
    expect(normalize(wide['width'])).toContain('var(--gutter)');

    // And se usa en esa superficie renderizada: la ventana de caso, y solo en ella
    expect(occurrences(page, 'container--wide')).toBe(1);
    const window = regionOf(page, 'window');
    expect(window).toMatch(/<section class="window container--wide"[^>]*id="window"/);

    // La superficie no vuelve a fijar su ancho en escritorio: manda el contenedor ancho.
    expect(baseDeclarations(DOCK_WINDOW_CSS, '.window')['width']).toBeUndefined();
    expect(baseDeclarations(DOCK_WINDOW_CSS, '.window')['max-width']).toBeUndefined();

    // And el uso tiene una justificación de layout documentada y no es CSS muerto
    const definicion = BASE_CSS.slice(0, BASE_CSS.indexOf('.container--wide'));
    expect(definicion).toMatch(/columna de lectura/);
    expect(DOCK_WINDOW_CSS.slice(0, DOCK_WINDOW_CSS.indexOf('.window {'))).toContain('container--wide');
    expect(DOCK_WINDOW_CSS).toMatch(/rejilla/);
    // Y la justificación no es retórica: la rejilla de preguntas del caso pide 260px por columna,
    // así que la superficie ancha —y no la columna de lectura— es la que puede repartirlas.
    const qaGrid = normalize(baseDeclarations(DOCK_WINDOW_CSS, '.qa-grid')['grid-template-columns']);
    expect(qaGrid).toContain('auto-fit');
    expect(qaGrid).toContain('minmax(260px,1fr)');
    expect(minBound(baseDeclarations(BASE_CSS, '.container--wide')['width'])).toBeGreaterThan(260 * 2);
  });

  // Scenario: mantiene contenida la columna de Mi trabajo al recuperar el ancho amplio
  it('mantiene contenida la columna de Mi trabajo al recuperar el ancho amplio', () => {
    // Given Mi trabajo y las secciones contiguas en escritorio amplio y móvil
    const trabajo = regionOf(page, 'trabajo');

    // Then la columna de Mi trabajo mantiene su anchura limitada, equilibrada y legible
    expect(containerOf(trabajo)).toBe('container');
    ['blog', 'servicios', 'por-que', 'contacto'].forEach((id) => {
      expect(containerOf(regionOf(page, id))).toBe('container');
    });
    expect(trabajo).not.toContain('container--wide');
    expect(normalize(baseDeclarations(BASE_CSS, '.container')['width'])).toBe(
      'min(var(--col),calc(100%-2*var(--gutter)))'
    );

    // And cualquier ampliación se limita a la superficie que la necesita sin ensanchar toda la columna
    const columna = Number.parseFloat(baseDeclarations(TOKENS_CSS, ':root')['--col']);
    const amplia = minBound(baseDeclarations(BASE_CSS, '.container--wide')['width']);
    expect(columna).toBeLessThan(768);
    expect(amplia).toBeGreaterThan(columna);
    expect(occurrences(main, 'container--wide')).toBe(0);

    // And no aparece desbordamiento horizontal: la anchura amplia se acota al viewport con los
    // gutters y la ventana conserva en móvil su ancho de pantalla sin mínimos fijos.
    expect(normalize(baseDeclarations(BASE_CSS, '.container--wide')['width'])).not.toContain('100vw');
    expect(baseDeclarations(DOCK_WINDOW_CSS, '.window')['min-width']).toBeUndefined();
    expect(normalize(mediaDeclarations(DOCK_WINDOW_CSS, '.window', '@media (max-width: 767px)')['width'])).toBe(
      'calc(100vw-20px)'
    );
  });

  // Scenario: conserva los títulos de proyectos h4 a 18px sin eyebrows
  it('conserva los títulos de proyectos h4 a 18px sin eyebrows', () => {
    // Given las tarjetas y el showcase de proyectos
    const casos = regionOf(page, 'casos');
    const proyectos = regionOf(page, 'proyectos');

    // When el visitante consulta o cambia de proyecto en escritorio y móvil
    // Then los títulos de proyectos siguen siendo h4 de 18px en serif cursiva
    const showcaseTitles = outlineOf(casos).filter((heading) => heading.classes.includes('project-showcase__title'));
    const cardTitles = outlineOf(proyectos).filter((heading) => heading.classes.includes('card__title'));
    expect(showcaseTitles.length).toBeGreaterThan(0);
    expect(cardTitles.length).toBeGreaterThan(0);
    [...showcaseTitles, ...cardTitles].forEach((title) => expect(title.level).toBe(4));

    [
      ['.project-showcase__title', PROJECTS_CSS],
      ['.card__title', CARDS_CSS]
    ].forEach(([selector, source]) => {
      expect(normalize(baseDeclarations(source, selector)['font-size'])).toBe('18px');
      expect(normalize(baseDeclarations(source, selector)['font-family'])).toBe('var(--font-body)');
      expect(normalize(baseDeclarations(source, selector)['font-style'])).toBe('italic');
      parseCss(source)
        .filter((rule) => rule.selector === selector && rule.context.length > 0)
        .forEach((rule) => expect(rule.declarations['font-size']).toBeUndefined());
    });

    // And los proyectos no muestran eyebrows
    expect(page).not.toContain('eyebrow');
    [PROJECTS_CSS, CARDS_CSS].forEach((source) => expect(source).not.toContain('eyebrow'));
  });

  // Scenario: conserva la imagen principal cuatro a tres y los casos sin título visible
  it('conserva la imagen principal cuatro a tres y los casos sin título visible', () => {
    // Given el showcase de Casos documentados dentro de Mi trabajo
    const casos = regionOf(page, 'casos');
    const media = baseDeclarations(PROJECTS_CSS, '.project-showcase__media');

    // When el visitante lo consulta en escritorio y móvil
    // Then la imagen principal mantiene proporción ancho:alto 4:3 sin desbordar
    expect(normalize(media['aspect-ratio'])).toBe('4/3');
    expect(heightOverWidth(media['aspect-ratio'])).toBeCloseTo(3 / 4, 6);
    ['width', 'min-width', 'max-width'].forEach((property) => expect(media[property]).toBeUndefined());
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase')['width'])).toBe('100%');
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase__media img')['width'])).toBe('100%');

    // And Casos documentados no muestra un título visible pero conserva su encabezado accesible
    const title = outlineOf(casos).find((heading) => heading.text === 'Casos documentados');
    expect(title?.level).toBe(3);
    const hidden = parseCss(PROJECTS_CSS)
      .filter((rule) => /#casos(?![\w-])/.test(rule.selector) && rule.selector.includes('.section-title'))
      .reduce((merged, rule) => Object.assign(merged, rule.declarations), {} as Record<string, string>);
    expect(hidden['position']).toBe('absolute');
    expect(hidden['width']).toBe('1px');
    expect(hidden['height']).toBe('1px');
    expect(normalize(hidden['overflow'])).toBe('hidden');
    expect(hidden['clip'] ?? hidden['clip-path']).toBeTruthy();
    expect(hidden['display'] ?? 'block').not.toBe('none');
    expect(casos).toContain('data-project-showcase');
    expect(occurrences(casos, '<h4 class="project-showcase__title')).toBeGreaterThan(0);
  });

  // Scenario: conserva los experimentos como showcase con h3 accesible
  it('conserva los experimentos como showcase con h3 accesible', () => {
    // Given Cosas pequeñas hechas bien dentro de Mi trabajo
    const experimentos = regionOf(page, 'experimentos');

    // When el visitante consulta las demostraciones
    // Then conserva un h3 accesible en su subsección
    const heading = outlineOf(experimentos).filter((entry) => entry.level === 3);
    expect(heading).toHaveLength(1);
    expect(heading[0]).toMatchObject({ text: 'Cosas pequeñas hechas bien' });
    expect(heading[0].classes).toContain('sr-only');
    expect(experimentos).toContain('aria-labelledby="experimentos-titulo"');

    // And no aparecen contenedores visibles de título o descripción ni un bloque introductorio visible
    ['demo__info', 'demo__label', 'demo__caption'].forEach((container) => {
      expect(experimentos).not.toContain(container);
      expect(EXPERIMENTS_CSS).not.toContain(container);
    });
    expect(experimentos).not.toContain('section-head');
    expect(experimentos).not.toContain('class="lead"');
    expect(EXPERIMENTS_CSS).not.toContain('section-head');

    // And las demostraciones y sus controles accesibles siguen disponibles
    expect(occurrences(experimentos, '<article class="demo"')).toBe(4);
    expect(experimentos).toContain('data-magnet');
    expect(experimentos).toContain('role="switch"');
    expect(experimentos).toContain('data-spot');
  });

  // Scenario: conserva las grillas y el espaciado homogéneo
  it('conserva las grillas y el espaciado homogéneo', () => {
    // Given las secciones y subsecciones del portafolio
    // When el visitante las consulta en escritorio y móvil
    // Then Proyectos y Experimentos conservan sus grillas de dos columnas en escritorio
    expect(normalize(baseDeclarations(CARDS_CSS, '.card-grid--trabajo')['grid-template-columns'])).toBe(
      'repeat(2,minmax(0,1fr))'
    );
    expect(normalize(mediaDeclarations(EXPERIMENTS_CSS, '.demo-grid', '@media (min-width: 768px)')['grid-template-columns'])).toBe(
      'repeat(2,minmax(0,1fr))'
    );

    // And las grillas se adaptan al móvil sin desbordamiento
    expect(normalize(mediaDeclarations(CARDS_CSS, '.card-grid--trabajo', '@media (max-width: 767px)')['grid-template-columns'])).toBe(
      '1fr'
    );
    expect(normalize(baseDeclarations(EXPERIMENTS_CSS, '.demo-grid')['grid-template-columns'])).toBe('1fr');
    expect(baseDeclarations(EXPERIMENTS_CSS, '.demo-grid')['width']).toBeUndefined();
    expect(baseDeclarations(CARDS_CSS, '.card-grid--trabajo')['width']).toBeUndefined();

    // And el espaciado entre secciones, subsecciones y encabezados mantiene el ritmo de cada nivel
    const tokens = baseDeclarations(TOKENS_CSS, ':root');
    expect(baseDeclarations(BASE_CSS, '.section')['padding-block']).toBe('var(--section-space)');
    expect(baseDeclarations(BASE_CSS, '.subsection')['margin-top']).toBe('var(--subsection-space)');
    expect(baseDeclarations(BASE_CSS, '.section-head')['margin-bottom']).toBe('var(--section-head-space)');
    expect(baseDeclarations(BASE_CSS, '.section-head--subsection')['margin-bottom']).toBe('var(--subsection-head-space)');
    expect(tokens['--section-space']).not.toBe(tokens['--subsection-space']);
    expect(tokens['--section-head-space']).not.toBe(tokens['--subsection-head-space']);
  });
});
