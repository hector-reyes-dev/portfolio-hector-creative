// Feature: Correcciones visuales de Mi trabajo sin perder semántica ni cobertura previa
//
// Scenario: conserva los títulos de proyectos como h4 de exactamente 18px
// Given las tarjetas y el showcase principal de Mi trabajo
// When el visitante consulta sus proyectos en escritorio y móvil
// Then todos sus títulos de proyecto siguen siendo h4 y se muestran a exactamente 18px
// And se conserva la jerarquía h1, h2, h3 y h4 del portafolio
//
// Scenario: presenta la imagen principal del showcase con proporción cuatro a tres
// Given el showcase principal de Mi trabajo
// When el visitante visualiza sus proyectos en escritorio y móvil
// Then el marco de la imagen principal tiene proporción ancho:alto 4:3 y no 3:4
// And permanece dentro del ancho disponible sin desbordamiento horizontal
//
// Scenario: elimina los contenedores visibles de títulos y descripciones de experimentos conservando un h3 directo
// Given la subsección Experimentos con sus demostraciones
// When el visitante consulta Cosas pequeñas hechas bien
// Then no ve los contenedores de título y descripción de las demostraciones ni un bloque introductorio visible
// And la subsección conserva un h3 semántico directo y accesible llamado Cosas pequeñas hechas bien
// And no se reintroduce un SectionHeader ni un contenedor lead
// And las demostraciones y sus controles accesibles permanecen disponibles
// And el showcase de detalles conserva dos columnas en escritorio y se adapta al móvil sin desbordar
//
// Scenario: oculta el título visible de Casos documentados sin retirar el showcase
// Given la subsección de casos dentro de Mi trabajo
// When el visitante consulta el showcase principal
// Then no ve el título Casos documentados
// And el showcase y los títulos h4 de sus proyectos permanecen disponibles
//
// Scenario: elimina los eyebrows de proyectos sin eliminar sus títulos
// Given los proyectos de las tarjetas y del showcase principal
// When el visitante los consulta y cambia el proyecto seleccionado
// Then no aparecen eyebrows de proyectos
// And se conservan los títulos h4 y el componente principal con sus controles accesibles
//
// Alcance: se conservan los contratos previos de anchura contenida de Mi trabajo,
// navbar, espaciado homogéneo, orden de secciones, serif cursiva y accesibilidad.
// Suposición mínima: los contenedores restantes de experimentos incluyen la información
// visible de título/descripción de DemoFrame; no se eliminan las etiquetas de sus controles.
// El h3 directo de Experimentos puede seguir siendo sr-only, como en el contrato previo.
// TDD resolverá la comprobación observable y activará estos escenarios sin helpers aquí.
//
// Conflictos para TDD (tests activos preservados intactos):
// - portfolio-consistency.test.ts exige actualmente media 3:4 y mayor altura que 4:3;
//   el nuevo contrato sustituye esa proporción, no la protección contra desbordamiento.
// - section-swap.test.ts exige el h3 visible de Casos documentados; ahora no debe verse.
// - portfolio-consistency.test.ts exige Casos documentados entre los h3; la ausencia
//   visual no obliga a eliminar un nombre accesible ni a romper la jerarquía.
// - project-showcase-square.test.ts referencia el eyebrow en contratos de layout;
//   al retirarlo deben conservarse las garantías vigentes del showcase.
//
// Decisiones de TDD (el mínimo cambio que satisface los escenarios):
// - Los títulos de proyecto son H4 y declaran `font-size: 18px` en su regla base, sin ningún
//   breakpoint que los reescale: el mismo tamaño vale en escritorio y en móvil, y se conserva el
//   estilo serif cursiva del cuerpo que ya verifica portfolio-consistency.test.ts.
// - El marco de la imagen principal pasa a `aspect-ratio: 4 / 3` (ancho:alto). El contrato
//   anterior (3:4) queda sustituido en los dos archivos que lo fijaban; la protección contra
//   desbordamiento horizontal —ancho completo, sin anchos fijos en el marco— se conserva.
// - Experimentos pierde el bloque visible de título y descripción de cada DemoFrame
//   (`.demo__info`, `.demo__label`, `.demo__caption`): ni el marcado ni el CSS los pintan. La
//   subsección conserva su H3 directo `#experimentos-titulo` (sr-only, sin SectionHeader ni lead)
//   y su grilla de dos columnas; los controles y los textos que los acompañan siguen disponibles
//   para el lector de pantalla.
// - Casos documentados conserva su H3 en el HTML y en el esquema accesible, pero deja de
//   pintarse: la técnica es la del `sr-only` aplicada desde `#casos`, sin tocar la clase del
//   encabezado, para no romper los contratos de DOM que ya exige section-swap.test.ts.
// - Los eyebrows del showcase se retiran del marcado y del CSS. La línea de etiquetas se
//   conserva como texto para lectores de pantalla: el panel la necesita para pintar el bloque
//   completo y ya formaba parte del texto accesible verificado por project-showcase-square.test.ts.
//
// Harness: los escenarios hablan de la página real, así que se rinde `src/pages/index.astro` con
// la API de contenedor de Astro (`astro/container`) y se miden las hojas de estilo reales de
// producción. De lo renderizado se comprueban jerarquía, marcado y controles; del CSS, tamaño,
// proporción y ocultamiento visual, con la aritmética explícita cuando aporta (4:3 es apaisada).
// La medición de píxeles en navegador queda para la etapa de verificación de layout; aquí no se
// simula geometría ni se sustituye ningún componente por un doble.

import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import HomePage from '../../pages/index.astro';

const portfolioCss = (name: string): string =>
  readFileSync(new URL(`../../styles/portfolio/${name}`, import.meta.url), 'utf8');

const PROJECTS_CSS = portfolioCss('projects.css');
const EXPERIMENTS_CSS = portfolioCss('experiments.css');
const BASE_CSS = portfolioCss('base.css');
const CARDS_CSS = readFileSync(new URL('../../styles/components/cards.css', import.meta.url), 'utf8');

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

/**
 * Etiquetas de apertura de primer nivel del fragmento, con su cadena completa: permite afirmar
 * qué compone una pieza sin depender del formato del HTML ni de un parser externo.
 */
function topLevelElements(fragment: string): string[] {
  const VOID_TAGS = new Set(['img', 'input', 'br', 'hr', 'source', 'use']);
  const tagPattern = /<(\/)?([a-z][\w-]*)([^>]*)>/gi;
  const elements: string[] = [];
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(fragment))) {
    const [, closing, name, attributes] = match;
    if (closing) {
      depth -= 1;
    } else {
      if (depth === 0) elements.push(`<${name}${attributes}>`);
      if (!match[0].endsWith('/>') && !VOID_TAGS.has(name.toLowerCase())) depth += 1;
    }
  }

  return elements;
}

/** Contenido interior de un `<article class="demo">` completo. */
function demoArticles(html: string): string[] {
  return [...html.matchAll(/<article class="demo"[^>]*>([\s\S]*?)<\/article>/g)].map((match) => match[1]);
}

function normalize(value: string | undefined): string | undefined {
  return value?.replace(/\s+/g, '').toLowerCase();
}

/** Alto por unidad de ancho que produce un `aspect-ratio` (`alto / ancho`). */
function heightOverWidth(value: string): number {
  const [width, height] = value.split('/').map((part) => Number.parseFloat(part));
  return height / width;
}

function compact(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/=""/g, '');
}

/** Región completa por su id, contando anidamiento del mismo tipo de etiqueta. */
function regionOf(html: string, id: string): string {
  const startPattern = new RegExp(`<([a-z]+)[^>]*id="${id}"[^>]*>`, 'i');
  const start = startPattern.exec(html);
  if (!start || start.index === undefined) throw new Error(`La página de inicio no renderiza la región #${id}`);

  const tagName = start[1];
  const tags = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  tags.lastIndex = start.index + start[0].length;
  let depth = 1;
  let tag: RegExpExecArray | null;
  while ((tag = tags.exec(html))) {
    if (tag[0].startsWith('</')) depth -= 1;
    else if (!tag[0].endsWith('/>')) depth += 1;
    if (depth === 0) return compact(html.slice(start.index, tags.lastIndex));
  }

  throw new Error(`La región #${id} no cierra correctamente`);
}

function occurrences(html: string, fragment: string): number {
  return html.split(fragment).length - 1;
}

type Heading = { level: number; text: string; classes: string[] };

function headingsIn(html: string): Heading[] {
  const headings: Heading[] = [];
  const pattern = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const classMatch = /class="([^"]*)"/.exec(match[2]);
    headings.push({
      level: Number(match[1]),
      text: match[3].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      classes: classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : []
    });
  }
  return headings;
}

let page: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
  page = compact(await container.renderToString(HomePage));
});

describe('Correcciones visuales de Mi trabajo', () => {
  // Scenario: conserva los títulos de proyectos como h4 de exactamente 18px
  it('conserva los títulos de proyectos como h4 de exactamente 18px', () => {
    // Given las tarjetas y el showcase principal de Mi trabajo
    const trabajo = regionOf(page, 'trabajo');
    const casos = regionOf(trabajo, 'casos');
    const proyectos = regionOf(trabajo, 'proyectos');

    // When el visitante consulta sus proyectos en escritorio y móvil
    const titles = [
      ...headingsIn(casos).filter((heading) => heading.classes.includes('project-showcase__title')),
      ...headingsIn(proyectos).filter((heading) => heading.classes.includes('card__title'))
    ];

    // Then todos sus títulos de proyecto siguen siendo h4
    expect(headingsIn(casos).filter((heading) => heading.classes.includes('project-showcase__title')).length).toBeGreaterThan(0);
    expect(headingsIn(proyectos).filter((heading) => heading.classes.includes('card__title')).length).toBeGreaterThan(0);
    titles.forEach((title) => expect(title.level).toBe(4));

    // And se conserva la jerarquía h1, h2, h3 y h4 del portafolio
    const pageHeadings = headingsIn(page);
    expect(pageHeadings.filter((heading) => heading.level === 1)).toHaveLength(1);
    ['Acerca de mí', 'Mi trabajo', 'Mis notas', 'Servicios y experiencia', 'Por qué trabajar conmigo', 'Contacto'].forEach(
      (section) =>
        expect(pageHeadings.filter((heading) => heading.level === 2).map((heading) => heading.text)).toContain(section)
    );
    ['Experiencia', 'Cómo puedo ayudarte', 'Testimonios', 'Proyectos', 'Cosas pequeñas hechas bien'].forEach(
      (subsection) =>
        expect(pageHeadings.filter((heading) => heading.level === 3).map((heading) => heading.text)).toContain(subsection)
    );

    // And se muestran a exactamente 18px, en escritorio y en móvil: la regla base lo fija y
    // ningún breakpoint (ni ningún otro archivo del portafolio) lo vuelve a escalar.
    [
      ['.card__title', CARDS_CSS],
      ['.project-showcase__title', PROJECTS_CSS]
    ].forEach(([selector, source]) => {
      expect(normalize(baseDeclarations(source, selector)['font-size'])).toBe('18px');
      parseCss(source)
        .filter((rule) => rule.selector === selector && rule.context.length > 0)
        .forEach((rule) => expect(rule.declarations['font-size']).toBeUndefined());
    });
  });

  // Scenario: presenta la imagen principal del showcase con proporción cuatro a tres
  it('presenta la imagen principal del showcase con proporción cuatro a tres', () => {
    // Given el showcase principal de Mi trabajo
    const casos = regionOf(page, 'casos');
    const media = baseDeclarations(PROJECTS_CSS, '.project-showcase__media');
    const ratio = media['aspect-ratio'];

    // Then el marco de la imagen principal tiene proporción ancho:alto 4:3 y no 3:4
    expect(normalize(ratio)).toBe('4/3');
    expect(heightOverWidth(ratio)).toBeCloseTo(3 / 4, 6);
    expect(heightOverWidth(ratio)).toBeLessThan(1);
    expect(normalize(ratio)).not.toBe('3/4');

    // When el visitante visualiza sus proyectos en escritorio y móvil
    // El marco declara su proporción una sola vez, en la regla base: vale para cualquier ancho.
    parseCss(PROJECTS_CSS)
      .filter((rule) => rule.selector === '.project-showcase__media' && rule.context.length > 0)
      .forEach((rule) => expect(rule.declarations['aspect-ratio']).toBeUndefined());
    parseCss(PROJECTS_CSS)
      .filter((rule) => rule.selector === '.project-showcase__media img' && rule.context.length > 0)
      .forEach((rule) => expect(rule.declarations.width).toBeUndefined());

    // And permanece dentro del ancho disponible sin desbordamiento horizontal
    expect(casos).toContain('data-project-showcase');
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase')['width'])).toBe('100%');
    ['width', 'min-width', 'max-width'].forEach((property) => expect(media[property]).toBeUndefined());
    expect(media['overflow']).toBe('hidden');
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase__media img')['width'])).toBe('100%');
    // La imagen real que se pinta es la del marco: sin anchos fijos en el marcado que lo excedan.
    // impeccable-disable-next-line broken-image -- patrón de búsqueda sobre el HTML construido, no un <img> que se envíe
    const image = /<img[^>]*data-project-image[^>]*>/.exec(casos)?.[0];
    expect(image).toBeTruthy();
    expect(image).not.toMatch(/\sstyle="/);
  });

  // Scenario: elimina los contenedores visibles de títulos y descripciones de experimentos conservando un h3 directo
  it('elimina los contenedores visibles de títulos y descripciones de experimentos conservando un h3 directo', () => {
    // Given la subsección Experimentos con sus demostraciones
    const experimentos = regionOf(page, 'experimentos');

    // Then no ve los contenedores de título y descripción de las demostraciones
    ['demo__info', 'demo__label', 'demo__caption'].forEach((container) => {
      expect(experimentos).not.toContain(container);
      expect(EXPERIMENTS_CSS).not.toContain(container);
    });

    // And tampoco un bloque introductorio visible
    expect(experimentos).not.toContain('section-head');
    expect(experimentos).not.toContain('class="lead"');
    expect(EXPERIMENTS_CSS).not.toContain('section-head');

    // And la subsección conserva un h3 semántico directo y accesible llamado Cosas pequeñas hechas bien
    expect(experimentos).toMatch(
      /<div class="subsection" id="experimentos"[^>]*><h3[^>]*id="experimentos-titulo"[^>]*>Cosas pequeñas hechas bien<\/h3>/
    );
    expect(experimentos).toContain('aria-labelledby="experimentos-titulo"');

    // And no se reintroduce un SectionHeader ni un contenedor lead: el único H3 de la subsección
    // es el suyo, y su contenido son las demostraciones.
    const headings = headingsIn(experimentos);
    expect(headings.filter((heading) => heading.level === 3).map((heading) => heading.text)).toEqual([
      'Cosas pequeñas hechas bien'
    ]);

    // And las demostraciones y sus controles accesibles permanecen disponibles
    expect(demoArticles(experimentos)).toHaveLength(4);
    expect(occurrences(experimentos, 'class="demo__stage')).toBe(4);
    expect(experimentos).toContain('data-magnet');
    expect(experimentos).toContain('role="switch"');
    expect(experimentos).toContain('aria-label="Interruptor de ejemplo"');
    expect(experimentos).toContain('data-spot');

    // Ninguna demostración pinta texto propio fuera de su demostración: lo único que compone
    // cada detalle por encima del escenario (el título y la descripción que quedaban) va oculto
    // a la vista y sigue disponible para el lector de pantalla.
    demoArticles(experimentos).forEach((demo) => {
      const children = topLevelElements(demo);
      expect(children[0]).toContain('class="demo__stage');
      children.slice(1).forEach((container) => {
        expect(container).toContain('sr-only');
      });
    });
    expect(experimentos).toContain('class="sr-only"');

    // And el showcase de detalles conserva dos columnas en escritorio y se adapta al móvil sin desbordar
    const desktop = mediaDeclarations(EXPERIMENTS_CSS, '.demo-grid', '@media (min-width: 768px)');
    expect(normalize(desktop['grid-template-columns'])).toBe('repeat(2,minmax(0,1fr))');
    expect(normalize(baseDeclarations(EXPERIMENTS_CSS, '.demo-grid')['grid-template-columns'])).toBe('1fr');
    expect(baseDeclarations(EXPERIMENTS_CSS, '.demo-grid')['width']).toBeUndefined();
  });

  // Scenario: oculta el título visible de Casos documentados sin retirar el showcase
  it('oculta el título visible de Casos documentados sin retirar el showcase', () => {
    // Given la subsección de casos dentro de Mi trabajo
    const casos = regionOf(page, 'casos');

    // When el visitante consulta el showcase principal
    // Then no ve el título Casos documentados: la regla real de `#casos` lo saca de la pintura
    // con la técnica del `sr-only` (caja de un píxel recortada), no lo borra del árbol accesible.
    const casesTitle = headingsIn(casos).find((heading) => heading.text === 'Casos documentados');
    expect(casesTitle?.classes).toContain('section-title');
    // La regla se busca por la región —`#casos`, sin confundirla con otro identificador— y por el
    // encabezado que sí está en el HTML; además se comprueba que la cadena de ancestros que la
    // regla necesita (subsección → encabezado → título) es la que el componente renderiza.
    const hidingRules = parseCss(PROJECTS_CSS).filter(
      (rule) => /#casos(?![\w-])/.test(rule.selector) && rule.selector.includes('.section-title')
    );
    expect(hidingRules.length).toBeGreaterThan(0);
    expect(casos).toMatch(
      /<div class="subsection" id="casos"[^>]*><header class="section-head[^"]*"[^>]*><h3 class="section-title">Casos documentados<\/h3>/
    );
    const hidden = hidingRules.reduce(
      (merged, rule) => Object.assign(merged, rule.declarations),
      {} as Record<string, string>
    );
    expect(hidden['position']).toBe('absolute');
    expect(hidden['width']).toBe('1px');
    expect(hidden['height']).toBe('1px');
    expect(normalize(hidden['overflow'])).toBe('hidden');
    expect(hidden['clip'] ?? hidden['clip-path']).toBeTruthy();
    expect(hidden['display'] ?? 'block').not.toBe('none');
    expect(hidden['visibility'] ?? 'visible').not.toBe('hidden');

    // And el título sigue presente como H3 de la subsección, con su nombre accesible
    expect(casesTitle?.level).toBe(3);
    expect(casesTitle?.text).toBe('Casos documentados');

    // And el showcase y los títulos h4 de sus proyectos permanecen disponibles
    expect(casos).toContain('data-project-showcase');
    expect(casos).toContain('data-project-panel');
    expect(casos).toContain('aria-live="polite"');
    expect(occurrences(casos, '<h4 class="project-showcase__title')).toBeGreaterThan(0);
    expect(casos).toContain('data-project-trigger');
  });

  // Scenario: elimina los eyebrows de proyectos sin eliminar sus títulos
  it('elimina los eyebrows de proyectos sin eliminar sus títulos', () => {
    // Given los proyectos de las tarjetas y del showcase principal
    const casos = regionOf(page, 'casos');
    const proyectos = regionOf(page, 'proyectos');

    // Then no aparecen eyebrows de proyectos
    expect(page).not.toContain('eyebrow');
    [PROJECTS_CSS, CARDS_CSS].forEach((source) => expect(source).not.toContain('eyebrow'));

    // And la línea de etiquetas que alimentaba el eyebrow tampoco se pinta: si se conserva para
    // el lector de pantalla, va con la utilidad `sr-only` real de base.css (oculta a la vista,
    // no al lector), porque el panel la necesita para no pintarse a medias.
    const tagLines = casos.match(/<p[^>]*data-project-tags[^>]*>/g) ?? [];
    expect(tagLines.length).toBeGreaterThan(0);
    tagLines.forEach((tagLine) => expect(tagLine).toContain('sr-only'));
    const srOnly = baseDeclarations(BASE_CSS, '.sr-only');
    expect(srOnly['position']).toBe('absolute');
    expect(srOnly['width']).toBe('1px');
    expect(srOnly['height']).toBe('1px');
    expect(normalize(srOnly['overflow'])).toBe('hidden');
    expect(srOnly['clip'] ?? srOnly['clip-path']).toBeTruthy();

    // And se conservan los títulos h4
    expect(occurrences(casos, '<h4 class="project-showcase__title')).toBeGreaterThan(0);
    expect(occurrences(proyectos, '<h4 class="card__title"')).toBeGreaterThan(0);

    // And el componente principal con sus controles accesibles
    expect(casos).toContain('data-project-showcase');
    expect(casos).toContain('role="group"');
    expect(casos).toContain('aria-label="Seleccionar proyecto"');

    // When el visitante los consulta y cambia el proyecto seleccionado
    const triggers = casos.match(/<button[^>]*data-project-trigger[^>]*>/g) ?? [];
    expect(triggers.length).toBeGreaterThan(1);
    expect(occurrences(casos, 'aria-pressed=')).toBe(triggers.length);
    // Cada control lleva el proyecto completo (título, descripción, etiquetas) para repintar el
    // panel sin eyebrows ni contenido duplicado a la vista.
    triggers.forEach((trigger) => {
      ['data-project-full', 'data-project-desc', 'data-project-tags', 'data-project-image'].forEach((attribute) =>
        expect(trigger).toContain(`${attribute}="`)
      );
      expect(trigger).toContain('aria-label="');
    });
  });
});
