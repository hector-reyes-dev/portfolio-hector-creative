// Feature: Estructura y presentación consistentes del portafolio creativo
//
// Scenario: presenta las secciones principales en el orden editorial acordado
// Given la página de inicio del portafolio
// When el visitante recorre su contenido de principio a fin
// Then encuentra Acerca de mí, Mi trabajo, Mis notas, Servicios y experiencia, Por qué trabajar conmigo y Contacto en ese orden
// And encuentra el Footer después de Contacto
// And Mis notas conserva el contexto de Notas de ingeniería
//
// Scenario: agrupa experiencia, ayuda y testimonios bajo sus secciones correspondientes
// Given la página de inicio del portafolio
// When el visitante consulta Servicios y experiencia y Por qué trabajar conmigo
// Then Experiencia y Cómo puedo ayudarte aparecen en ese orden como subsecciones de Servicios y experiencia
// And Testimonios aparece como subsección de Por qué trabajar conmigo
//
// Scenario: ofrece una jerarquía semántica consistente de encabezados
// Given la página de inicio con sus proyectos y casos documentados
// When el visitante navega por sus encabezados
// Then hay un único H1 principal
// And las secciones principales usan H2 y sus subsecciones usan H3
// And los títulos de proyectos en el showcase y la grilla usan H4
// And Cosas pequeñas hechas bien conserva un encabezado H3 accesible aunque no sea visible
//
// Scenario: homogeneiza los tamaños de encabezados del mismo nivel editorial
// Given las secciones y subsecciones del portafolio
// When se visualiza la página en escritorio y móvil
// Then los encabezados de sección comparten una escala de tamaño
// And los encabezados visibles de subsección comparten otra escala de tamaño consistente
// And los encabezados de subsección se distinguen visualmente de los de sección
//
// Scenario: homogeneiza el espaciado entre secciones y entre subsecciones
// Given la página con sus secciones principales y subsecciones
// When el visitante recorre el contenido en escritorio y móvil
// Then las secciones mantienen un ritmo de separación consistente
// And las subsecciones mantienen un ritmo de separación consistente de su propio nivel
// And la separación entre cada encabezado visible y su contenido es consistente dentro del mismo nivel
//
// Scenario: muestra el marco visual de Casos documentados con proporción cuatro a tres
// Given el showcase de Casos documentados
// When el visitante lo visualiza en escritorio y móvil
// Then su marco de imagen tiene proporción de ancho a alto 4:3
// And el marco gana altura respecto a la presentación apaisada al mismo ancho disponible
// And permanece dentro del ancho disponible sin desbordamiento horizontal
//
// Scenario: mantiene Proyectos en dos columnas en escritorio
// Given la subsección Proyectos bajo el showcase de Casos documentados
// When el visitante visualiza el portafolio en escritorio
// Then las tarjetas de Proyectos se distribuyen en dos columnas
// And permanecen en una grilla independiente del showcase
//
// Scenario: presenta los experimentos como detalles sin un bloque introductorio visible
// Given la subsección Cosas pequeñas hechas bien dentro de Mi trabajo
// When el visitante llega a sus demostraciones
// Then no ve un bloque introductorio de título y descripción de la subsección
// And las demostraciones y sus controles siguen visibles y disponibles
// And la subsección conserva su nombre accesible
//
// Scenario: presenta los títulos de proyectos en serif cursiva como los de Mis notas
// Given los proyectos del showcase y de la grilla y las notas de ingeniería
// When el visitante consulta sus títulos
// Then los títulos de proyectos comparten el estilo serif cursiva de los títulos de Mis notas
//
// Scenario: distribuye el showcase de experimentos en dos columnas en escritorio
// Given las demostraciones de Cosas pequeñas hechas bien dentro de Mi trabajo
// When el visitante visualiza el portafolio en escritorio
// Then los detalles pequeños se presentan en una grilla de dos columnas
//
// Scenario: conserva una anchura contenida y equilibrada en Mi trabajo
// Given la página del portafolio en una pantalla de escritorio amplia
// When el visitante recorre Mi trabajo y las secciones contiguas
// Then Mi trabajo mantiene un ancho limitado y equilibrado con los contenedores del resto del portafolio
// And su contenido sigue siendo legible sin extenderse a todo el ancho de la pantalla
// And las grillas secundarias no desplazan el protagonismo visual del showcase de Casos documentados
//
// Suposición mínima: las dos columnas se exigen en escritorio; se conserva la adaptación móvil.
// La anchura contenida se compara con el ritmo de contenedores del portafolio, sin imponer
// un valor nuevo en píxeles. TDD determinará la comprobación visual apropiada.
//
// Decisión de anchura (TDD): Mi trabajo usa el mismo contenedor de lectura (`.container`) que el
// resto del portafolio, en vez del contenedor ancho (69rem) que se había aplicado al agrupar sus
// subsecciones. A 1440px de ancho el contenedor mide 520px —los mismos 520px de Mis notas,
// Servicios y experiencia, Por qué trabajar conmigo, Contacto y el footer—, así que la columna
// queda contenida y equilibrada con las secciones contiguas, sin desbordamiento horizontal.
// Las rejillas secundarias de dos columnas (248px y 250px por pieza dentro de 520) conservan la
// proporción del diseño (298px por tarjeta dentro de 620px) y el showcase mantiene su protagonismo:
// ocupa el ancho completo y su marco 4:3 (520×390) supera en superficie a las tarjetas (248×150) y
// a las demostraciones (250×172), que se reparten en dos columnas.
// Los escenarios anteriores ya tienen tests activos: se conservan sin duplicarlos ni desactivarlos.
//
// Cobertura reutilizada, sin duplicar escenarios: section-swap.test.ts ya verifica
// la navbar Acerca de mí / Mi trabajo / Mis notas / Trabaja conmigo y sus destinos,
// la agrupación Casos documentados / Proyectos / Experimentos dentro de Mi trabajo
// y la separación entre showcase y tarjetas. Sus tests activos se conservan intactos.
//
// Harness: los escenarios hablan de la página real, así que se rinde `src/pages/index.astro`
// con la API de contenedor de Astro (`astro/container`). El entorno es `node` porque bajo jsdom
// ese plugin sirve la variante de navegador de cada componente ("Astro components cannot be used
// in the browser"). Del HTML servido se comprueban orden, jerarquía, agrupación y presencia de
// controles; de las hojas de estilo reales (tokens, base, cards, projects, blog, experiments,
// hero) se comprueban los contratos de tamaño, espaciado, proporción y columnas, con la aritmética explícita cuando
// aporta (misma proporción, distinto nivel). La medición de píxeles en navegador queda para la
// etapa de verificación de layout; aquí no se simula geometría.
//
// Conflicto editorial resuelto: blog/blog.test.ts documenta el encabezado «Notas de ingeniería»;
// esta historia pide «Mis notas» conservando ese contexto, que se mantiene en el lead de la
// sección. No se modifican los contratos activos ni el comportamiento de pestañas del blog.

import { readFileSync } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import HomePage from '../../pages/index.astro';

describe('Presentación final de los títulos, rejillas y anchura de Mi trabajo', () => {
  // Scenario: presenta los títulos de proyectos en serif cursiva como los de Mis notas
  it('presenta los títulos de proyectos en serif cursiva como los de Mis notas', () => {
    // Given los proyectos del showcase y de la grilla y las notas de ingeniería
    const nota = allDeclarations(BLOG_CSS, '.blog__title');
    const showcaseTitle = baseDeclarations(PROJECTS_CSS, '.project-showcase__title');
    const cardTitle = baseDeclarations(CARDS_CSS, '.card__title');

    // La nota es la referencia del estilo: serif del cuerpo, cursiva y ligera (no un titular de display).
    expect(normalize(nota['font-family'])).toBe('var(--font-body)');
    expect(normalize(nota['font-style'])).toBe('italic');
    expect(normalize(nota['font-weight'])).toBe('400');

    // Then los títulos de proyectos comparten el estilo serif cursiva de los títulos de Mis notas
    [showcaseTitle, cardTitle].forEach((title) => {
      expect(normalize(title['font-family'])).toBe(normalize(nota['font-family']));
      expect(normalize(title['font-style'])).toBe(normalize(nota['font-style']));
      expect(normalize(title['font-weight'])).toBe(normalize(nota['font-weight']));
    });
  });

  // Scenario: distribuye el showcase de experimentos en dos columnas en escritorio
  it('distribuye el showcase de experimentos en dos columnas en escritorio', () => {
    // Given las demostraciones de Cosas pequeñas hechas bien dentro de Mi trabajo
    const experimentos = regionOf(page, 'experimentos');
    const desktopColumns = mediaDeclarations(EXPERIMENTS_CSS, '.demo-grid', '@media (min-width: 768px)');

    // Then los detalles pequeños se presentan en una grilla de dos columnas
    expect(normalize(desktopColumns['grid-template-columns'])).toBe('repeat(2,minmax(0,1fr))');

    // And la grilla es la de la subsección y contiene sus cuatro demostraciones
    expect(experimentos).toContain('class="demo-grid"');
    expect(occurrences(experimentos, '<article class="demo"')).toBe(4);

    // And por debajo del escritorio se conserva una sola columna
    expect(normalize(baseDeclarations(EXPERIMENTS_CSS, '.demo-grid')['grid-template-columns'])).toBe('1fr');
  });

  // Scenario: conserva una anchura contenida y equilibrada en Mi trabajo
  it('conserva una anchura contenida y equilibrada en Mi trabajo', () => {
    // Given la página del portafolio en una pantalla de escritorio amplia
    const containerOf = (region: string): string | undefined =>
      /<div class="([^"]*\bcontainer\b[^"]*)"/.exec(region)?.[1];

    // When el visitante recorre Mi trabajo y las secciones contiguas
    const trabajo = regionOf(page, 'trabajo');

    // Then Mi trabajo mantiene un ancho limitado y equilibrado con los contenedores del resto del portafolio
    expect(containerOf(trabajo)).toBe('container');
    ['blog', 'servicios', 'por-que', 'contacto'].forEach((id) => {
      expect(containerOf(regionOf(page, id))).toBe('container');
    });
    // La guarda original prohibía la cadena «container--wide» en toda la página. La historia
    // posterior restauró el contenedor ancho delimitado a una superficie concreta (la ventana de
    // caso, fuera de las columnas de lectura), así que la comprobación se queda con su intención
    // exacta: ninguna columna de lectura del portafolio usa el contenedor ancho.
    expect(trabajo).not.toContain('container--wide');
    ['blog', 'servicios', 'por-que', 'contacto'].forEach((id) => {
      expect(regionOf(page, id)).not.toContain('container--wide');
    });

    // And su contenido sigue siendo legible sin extenderse a todo el ancho de la pantalla
    expect(normalize(baseDeclarations(BASE_CSS, '.container')['width'])).toBe(
      'min(var(--col),calc(100%-2*var(--gutter)))'
    );
    const column = baseDeclarations(TOKENS_CSS, ':root')['--col'];
    // El ancho se acota en unidades absolutas, no en `vw` ni en porcentaje de la pantalla, y se
    // queda por debajo del umbral de escritorio que ya usa el proyecto (768px): medida de lectura.
    expect(column).toMatch(/^\d+px$/);
    expect(Number.parseFloat(column)).toBeLessThan(768);

    // And las grillas secundarias no desplazan el protagonismo visual del showcase de Casos documentados
    // El showcase ocupa el ancho completo disponible y su marco 4:3 gana más alto por unidad de ancho
    // que los medios apaisados de las dos grillas secundarias —que se reparten en dos columnas—, así
    // que ninguna pieza secundaria iguala la superficie del componente principal.
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase')['width'])).toBe('100%');
    expect(heightOverWidth(baseDeclarations(PROJECTS_CSS, '.project-showcase__media')['aspect-ratio'])).toBeGreaterThan(
      heightOverWidth(baseDeclarations(CARDS_CSS, '.card__media')['aspect-ratio'])
    );
    expect(heightOverWidth(baseDeclarations(CARDS_CSS, '.card__media')['aspect-ratio'])).toBeLessThan(1);
    [
      baseDeclarations(CARDS_CSS, '.card-grid--trabajo')['grid-template-columns'],
      mediaDeclarations(EXPERIMENTS_CSS, '.demo-grid', '@media (min-width: 768px)')['grid-template-columns']
    ].forEach((columns) => expect(normalize(columns)).toMatch(/^repeat\(2,/));
  });
});

const portfolioCss = (name: string): string =>
  readFileSync(new URL(`../../styles/portfolio/${name}`, import.meta.url), 'utf8');

const BASE_CSS = portfolioCss('base.css');
const TOKENS_CSS = portfolioCss('tokens.css');
const HERO_CSS = portfolioCss('hero.css');
const PROJECTS_CSS = portfolioCss('projects.css');
const BLOG_CSS = portfolioCss('blog.css');
const EXPERIMENTS_CSS = portfolioCss('experiments.css');
const CTA_CSS = portfolioCss('footer-cta.css');
const CARDS_CSS = readFileSync(new URL('../../styles/components/cards.css', import.meta.url), 'utf8');

/** Proporción apaisada documentada del marco antes de esta historia (alto / ancho). */
const BASELINE_LANDSCAPE = '1024 / 494';

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
      // Bloques de paradas/descriptores: no son selectores de encabezados ni de rejillas.
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

/** Declaraciones del selector vengan de la regla que vengan (la última declarada gana). */
function allDeclarations(source: string, selector: string): Record<string, string> {
  return parseCss(source)
    .filter((rule) => rule.selector === selector)
    .reduce((merged, rule) => Object.assign(merged, rule.declarations), {} as Record<string, string>);
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

/** Alto por unidad de ancho que produce un `aspect-ratio` (`alto / ancho`). */
function heightOverWidth(value: string): number {
  const [width, height] = value.split('/').map((part) => Number.parseFloat(part));
  return height / width;
}

/** Cota superior de un `clamp(a, b, c)`; de una longitud simple, su valor. */
function upperBound(value: string): number {
  const clamp = /clamp\(([^)]+)\)/.exec(value);
  const parts = clamp ? clamp[1].split(',') : [value];
  return Number.parseFloat(parts[parts.length - 1].trim());
}

function compact(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/=""/g, '');
}

function occurrences(html: string, fragment: string): number {
  return html.split(fragment).length - 1;
}

/** Contenido de `<main>`, donde viven las secciones editoriales (la ventana de casos queda fuera). */
function mainOf(html: string): string {
  const start = html.indexOf('<main');
  const end = html.indexOf('</main>', start);
  if (start === -1 || end === -1) throw new Error('La página de inicio no renderiza <main>');
  return html.slice(start, end);
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
let main: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
  page = compact(await container.renderToString(HomePage));
  main = mainOf(page);
});

describe('Estructura y presentación consistentes del portafolio creativo', () => {
  // Scenario: presenta las secciones principales en el orden editorial acordado
  it('presenta las secciones principales en el orden editorial acordado', () => {
    const sections = headingsIn(main)
      .filter((heading) => heading.level === 2)
      .map((heading) => heading.text);

    expect(sections).toEqual([
      'Acerca de mí',
      'Mi trabajo',
      'Mis notas',
      'Servicios y experiencia',
      'Por qué trabajar conmigo',
      'Contacto'
    ]);

    // And encuentra el Footer después de Contacto
    expect(page.indexOf('<footer')).toBeGreaterThan(page.indexOf('id="contacto"'));

    // And Mis notas conserva el contexto de Notas de ingeniería
    expect(regionOf(page, 'blog')).toContain('Notas de ingeniería');
  });

  // Scenario: agrupa experiencia, ayuda y testimonios bajo sus secciones correspondientes
  it('agrupa experiencia, ayuda y testimonios bajo sus secciones correspondientes', () => {
    const servicios = regionOf(page, 'servicios');
    const experiencia = regionOf(servicios, 'experiencia');
    const ayuda = regionOf(servicios, 'como-ayudarte');

    expect(experiencia).toMatch(/<h3[^>]*>Experiencia<\/h3>/);
    expect(ayuda).toMatch(/<h3[^>]*>Cómo puedo ayudarte<\/h3>/);
    expect(servicios.indexOf('id="experiencia"')).toBeLessThan(servicios.indexOf('id="como-ayudarte"'));

    expect(regionOf(page, 'por-que')).toMatch(/<h3[^>]*>Testimonios<\/h3>/);
  });

  // Scenario: ofrece una jerarquía semántica consistente de encabezados
  it('ofrece una jerarquía semántica consistente de encabezados', () => {
    const pageHeadings = headingsIn(page);

    // Then hay un único H1 principal
    expect(pageHeadings.filter((heading) => heading.level === 1)).toHaveLength(1);

    const mainHeadings = headingsIn(main);
    const h2 = mainHeadings.filter((heading) => heading.level === 2).map((heading) => heading.text);
    const h3 = mainHeadings.filter((heading) => heading.level === 3).map((heading) => heading.text);

    // And las secciones principales usan H2 y sus subsecciones usan H3
    for (const title of [
      'Acerca de mí',
      'Mi trabajo',
      'Mis notas',
      'Servicios y experiencia',
      'Por qué trabajar conmigo',
      'Contacto'
    ]) {
      expect(h2).toContain(title);
    }
    for (const title of [
      'Experiencia',
      'Cómo puedo ayudarte',
      'Testimonios',
      'Casos documentados',
      'Proyectos',
      'Cosas pequeñas hechas bien'
    ]) {
      expect(h3).toContain(title);
    }

    // And los títulos de proyectos en el showcase y la grilla usan H4
    expect(page).not.toMatch(/<h3[^>]*class="[^"]*project-showcase__title/);
    expect(page).not.toMatch(/<h3[^>]*class="[^"]*card__title/);
    expect(occurrences(page, '<h4 class="project-showcase__title')).toBeGreaterThan(0);
    expect(occurrences(page, '<h4 class="card__title"')).toBeGreaterThan(0);

    // Dentro de una subsección los títulos de sus piezas bajan a H4: el único H3 de la región es
    // el encabezado de la propia subsección, que así no compite con ellas en el esquema.
    for (const id of ['experiencia', 'como-ayudarte']) {
      const [head, ...pieces] = headingsIn(regionOf(page, id));
      expect(head.level).toBe(3);
      expect(pieces.length).toBeGreaterThan(0);
      pieces.forEach((piece) => expect(piece.level).toBe(4));
    }

    // And Cosas pequeñas hechas bien conserva un encabezado H3 accesible aunque no sea visible
    const experimentos = regionOf(page, 'experimentos');
    expect(experimentos).toContain('aria-labelledby="experimentos-titulo"');
    const responsible = /<h3[^>]*id="experimentos-titulo"[^>]*>([^<]*)<\/h3>/.exec(experimentos);
    expect(responsible?.[1].trim()).toBe('Cosas pequeñas hechas bien');
    expect(responsible?.[0]).toContain('sr-only');
  });

  // Scenario: homogeneiza los tamaños de encabezados del mismo nivel editorial
  it('homogeneiza los tamaños de encabezados del mismo nivel editorial', () => {
    const mainHeadings = headingsIn(main);

    // Then los encabezados de sección comparten una escala de tamaño
    const sectionHeadings = mainHeadings.filter((heading) => heading.level === 2);
    expect(sectionHeadings).toHaveLength(6);
    sectionHeadings.forEach((heading) => expect(heading.classes).toContain('section-title'));

    // And los encabezados visibles de subsección comparten otra escala de tamaño consistente
    const subsectionHeadings = mainHeadings.filter(
      (heading) => heading.level === 3 && heading.classes.includes('section-title')
    );
    expect(subsectionHeadings.length).toBeGreaterThan(0);
    subsectionHeadings.forEach((heading) => expect(heading.classes).not.toContain('sr-only'));

    const sectionSize = baseDeclarations(BASE_CSS, '.section-title')['font-size'];
    const subsectionSize = baseDeclarations(BASE_CSS, '.section-head--subsection .section-title')['font-size'];
    expect(sectionSize).toBeTruthy();
    expect(subsectionSize).toBeTruthy();

    // And los encabezados de subsección se distinguen visualmente de los de sección
    expect(upperBound(subsectionSize)).toBeLessThan(upperBound(sectionSize));

    // ...también en móvil, donde la escala fluida de la subsección tocaría fondo a un píxel de la
    // de sección: el salto de nivel se mantiene legible en el ancho estrecho.
    const MOBILE = '@media (max-width: 767px)';
    const mobileSection = mediaDeclarations(BASE_CSS, '.section-title', MOBILE)['font-size'];
    const mobileSubsection = mediaDeclarations(BASE_CSS, '.section-head--subsection .section-title', MOBILE)['font-size'];
    expect(upperBound(mobileSubsection)).toBeLessThan(upperBound(mobileSection) - 1);

    // La escala de sección es también la del hero: no hay override propio de tamaño.
    expect(allDeclarations(HERO_CSS, '.hero__section-title')['font-size']).toBeUndefined();

    // Cada subsección visible se agrupa bajo el encabezado de subsección (misma escala).
    const subsectionHeaders = occurrences(main, '<header class="section-head section-head--subsection"');
    expect(subsectionHeaders).toBe(subsectionHeadings.length);
  });

  // Scenario: homogeneiza el espaciado entre secciones y entre subsecciones
  it('homogeneiza el espaciado entre secciones y entre subsecciones', () => {
    const tokens = baseDeclarations(TOKENS_CSS, ':root');
    expect(tokens['--section-space']).toBeTruthy();
    expect(tokens['--subsection-space']).toBeTruthy();
    expect(tokens['--section-head-space']).toBeTruthy();
    expect(tokens['--subsection-head-space']).toBeTruthy();

    // Then las secciones mantienen un ritmo de separación consistente
    expect(baseDeclarations(BASE_CSS, '.section')['padding-block']).toBe('var(--section-space)');
    expect(allDeclarations(CTA_CSS, '.section--cta')['padding-block']).toBe('var(--section-space)');
    expect(allDeclarations(BLOG_CSS, '#blog')['padding-block']).toBe('var(--section-space)');

    // And las subsecciones mantienen un ritmo de separación consistente de su propio nivel
    expect(baseDeclarations(BASE_CSS, '.subsection')['margin-top']).toBe('var(--subsection-space)');
    expect(tokens['--section-space']).not.toBe(tokens['--subsection-space']);

    // And la separación entre cada encabezado visible y su contenido es consistente dentro del mismo nivel
    expect(baseDeclarations(BASE_CSS, '.section-head')['margin-bottom']).toBe('var(--section-head-space)');
    expect(baseDeclarations(BASE_CSS, '.section-head--subsection')['margin-bottom']).toBe(
      'var(--subsection-head-space)'
    );
    expect(tokens['--section-head-space']).not.toBe(tokens['--subsection-head-space']);

    // La subsección visible de Testimonios comparte el encabezado de subsección (su hueco y su escala).
    expect(regionOf(page, 'por-que')).toContain('<header class="section-head section-head--subsection"');

    // La subsección que abre una sección no suma separación al hueco del encabezado: el reset
    // cuelga de esa adyacencia, no de la posición entre hermanos.
    expect(baseDeclarations(BASE_CSS, '.section-head + .subsection')['margin-top']).toBe('0');
    ['casos', 'experiencia'].forEach((id) => {
      expect(main).toMatch(new RegExp(`</header><div class="subsection" id="${id}"`));
    });
    // Testimonios llega tras la rejilla de razones, no tras un encabezado: conserva su separación.
    expect(regionOf(page, 'por-que')).not.toMatch(/<\/header><div class="subsection"/);
  });

  // Scenario: muestra el marco visual de Casos documentados con proporción cuatro a tres
  it('muestra el marco visual de Casos documentados con proporción cuatro a tres', () => {
    const media = baseDeclarations(PROJECTS_CSS, '.project-showcase__media');
    const showcase = baseDeclarations(PROJECTS_CSS, '.project-showcase');

    // Then su marco de imagen tiene proporción de ancho a alto 4:3
    // (la proporción 3:4 de esta historia quedó sustituida por la corrección posterior del layout;
    // la protección contra desbordamiento de más abajo se conserva intacta)
    expect(normalize(media['aspect-ratio'])).toBe('4/3');

    // And el marco gana altura respecto a la presentación apaisada al mismo ancho disponible
    expect(heightOverWidth(media['aspect-ratio'])).toBeGreaterThan(heightOverWidth(BASELINE_LANDSCAPE));

    // And permanece dentro del ancho disponible sin desbordamiento horizontal
    expect(normalize(showcase['width'])).toBe('100%');
    expect(media['width']).toBeUndefined();
    expect(media['min-width']).toBeUndefined();
    expect(media['overflow']).toBe('hidden');
    expect(normalize(baseDeclarations(PROJECTS_CSS, '.project-showcase__media img')['width'])).toBe('100%');
  });

  // Scenario: mantiene Proyectos en dos columnas en escritorio
  it('mantiene Proyectos en dos columnas en escritorio', () => {
    // Then las tarjetas de Proyectos se distribuyen en dos columnas
    expect(normalize(baseDeclarations(CARDS_CSS, '.card-grid--trabajo')['grid-template-columns'])).toBe(
      'repeat(2,minmax(0,1fr))'
    );
    expect(
      normalize(mediaDeclarations(CARDS_CSS, '.card-grid--trabajo', '@media (max-width: 767px)')['grid-template-columns'])
    ).toBe('1fr');

    // And permanecen en una grilla independiente del showcase
    const proyectos = regionOf(page, 'proyectos');
    expect(proyectos).toContain('card-grid card-grid--trabajo');
    expect(proyectos).not.toContain('data-project-showcase');

    const casos = regionOf(page, 'casos');
    expect(casos).toContain('data-project-showcase');
    expect(casos).not.toContain('card-grid');

    expect(occurrences(page, 'data-project-showcase')).toBe(1);
  });

  // Scenario: presenta los experimentos como detalles sin un bloque introductorio visible
  it('presenta los experimentos como detalles sin un bloque introductorio visible', () => {
    const experimentos = regionOf(page, 'experimentos');

    // Then no ve un bloque introductorio de título y descripción de la subsección
    expect(experimentos).not.toContain('section-head');
    expect(experimentos).not.toContain('class="lead"');

    // And las demostraciones y sus controles siguen visibles y disponibles
    expect(occurrences(experimentos, '<article class="demo"')).toBe(4);
    expect(experimentos).toContain('data-magnet');
    expect(experimentos).toContain('role="switch"');
    expect(experimentos).toContain('data-spot');

    // And la subsección conserva su nombre accesible
    const responsible = /<h3[^>]*id="experimentos-titulo"[^>]*>([^<]*)<\/h3>/.exec(experimentos);
    expect(responsible?.[1].trim()).toBe('Cosas pequeñas hechas bien');
    expect(experimentos).toContain('aria-labelledby="experimentos-titulo"');
  });
});
