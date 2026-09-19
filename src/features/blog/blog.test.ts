// Feature: Explorar hasta cinco notas por tema con entrada ascendente escalonada y pestaña activa redondeada
// @vitest-environment jsdom
//
// Criterios visuales para verificar en navegador, nunca con píxeles ni CSS en jsdom:
// ancho normal de la columna principal, encabezado «Notas de ingeniería» y descripción
// existentes; fondo gris simple sin tarjetas, cajas, chips ni divisores entre entradas.
// Cada título usa 17px en cursiva; título y fecha comparten fila y se alinean arriba.
// Las pestañas de tema usan 14px y peso normal, también al estar seleccionadas.
// La superficie .blog__panel reserva el mismo alto para todos los temas, aunque tengan
// distinta cantidad de entradas; el contenido posterior no se desplaza al cambiar de pestaña.
// Al cambiar de tema, las entradas aparecen con fade ascendente escalonado;
// con prefers-reduced-motion se muestran directamente en su estado final.
// Los contratos de marcado se comprobarán contra el blog renderizado real,
// no contra el texto fuente de Astro ni una réplica que solo confirme sus propios datos.
//
// Scenario: agrupa por temas en orden explícito y ordena publicaciones excluyendo borradores
// Given entradas de Ingeniería, Diseño e IA mezcladas y con fechas distintas dentro de cada tema
// And publicaciones con draft omitido o false y borradores con draft true
// When se prepara el contenido del blog
// Then los grupos y sus pestañas siguen el orden Ingeniería, Diseño, IA
// And cada grupo contiene únicamente sus publicaciones más recientes, hasta cinco, por fecha descendente
// And ningún borrador aparece en los grupos ni en los paneles
//
// Scenario: activar una pestaña temática muestra únicamente su panel con selección accesible
// Given el blog inicializado con pestañas de Ingeniería, Diseño e IA en un tablist
// And inicialmente Ingeniería es la única pestaña seleccionada y su panel el único visible
// And cada tab enlaza su tabpanel mediante aria-controls y el panel mediante aria-labelledby
// When el visitante activa la pestaña Diseño y después la pestaña IA
// Then en cada activación solo la pestaña elegida tiene aria-selected true y tabindex 0
// And las demás pestañas tienen aria-selected false y tabindex -1
// And solo el panel del tema elegido queda visible y los demás permanecen ocultos
//
// Scenario: las flechas activan y enfocan pestañas adyacentes con recorrido circular
// Given el blog inicializado con las pestañas Ingeniería, Diseño e IA y foco en Ingeniería
// When el visitante pulsa ArrowRight o ArrowLeft
// Then el foco y la selección pasan a la pestaña siguiente o anterior respectivamente
// And solo el panel asociado a la nueva pestaña activa permanece visible
// And ArrowRight desde IA activa y enfoca Ingeniería
// And ArrowLeft desde Ingeniería activa y enfoca IA
// And la flecha se queda el evento, mientras las demás teclas conservan su comportamiento del navegador
//
// Scenario: cada entrada expone únicamente su título y fecha al explorar los temas
// Given el marcado del blog con publicaciones que también tienen descripción y etiquetas
// When el visitante consulta el panel inicial y cambia a los otros temas
// Then cada publicación del panel visible se identifica con [data-blog-entry]
// And contiene un [data-blog-title] con su título y un [data-blog-date] con su fecha
// And el contenido de cada entrada consiste únicamente en ese título y esa fecha
// And no aparecen descripciones, etiquetas, nombres de archivo ni metadata adicional
// And la elección de elementos article o time no añade ni exige contenido adicional
// And un título con marcado, comillas o apóstrofos llega como texto literal, sin perder caracteres
// And en navegador cada título se ve en cursiva de 17px y su fecha en la misma fila alineada arriba
// And en navegador las pestañas temáticas se ven a 14px con peso normal
//
// Scenario: las fechas muestran el mes abreviado en español y el año
// Given publicaciones fechadas el 1 de agosto de 2026 y el 31 de diciembre de 2025
// When se presentan sus fechas en [data-blog-date]
// Then sus textos son respectivamente "ago 2026" y "dic 2025"
// And no incluyen día, hora, coma ni punto tras la abreviatura
// And las doce abreviaturas van de "ene" a "dic", cada una con su mes
//
// Scenario: el movimiento reducido permite cambiar de tema sin animación
// Given el visitante tiene activada la preferencia de movimiento reducido
// When activa otra pestaña temática por clic o mediante las flechas
// Then la selección accesible y el panel visible cambian inmediatamente al tema elegido
// And el resaltado acompaña la selección sin animación
// And cada entrada del nuevo panel se muestra directamente en su estado final sin fade ni desplazamiento
// And no se invoca ninguna animación de entradas ni del resaltado
// And el teclado conserva el foco en la pestaña elegida
// El estado final se comprueba en la frontera de animación; la apariencia se verifica en navegador,
// sin medir geometría ni CSS en jsdom.
//
// Scenario: cada tema conserva como máximo cinco notas recientes sin añadir entradas de relleno
// Given más de cinco publicaciones de cada tema mezcladas por fecha y borradores más recientes
// And también se prepara un tema con menos de cinco publicaciones
// When se prepara el contenido y se renderizan los paneles del blog
// Then cada tema conserva únicamente sus cinco publicaciones más recientes sin incluir borradores
// And el panel renderizado no contiene una sexta entrada ni publicaciones descartadas
// And el tema con menos de cinco publicaciones conserva todas sus notas publicadas
// And no se añaden entradas de relleno para igualar el alto de los temas
//
// Scenario: todos los temas reservan el mismo alto aunque tengan distinta cantidad de entradas
// Given el blog renderizado en navegador con Ingeniería, Diseño e IA y distinta cantidad de entradas por tema
// And al menos un tema tiene cinco publicaciones y otro tiene menos de cinco
// When el visitante recorre las tres pestañas manteniendo el mismo ancho de ventana
// Then la superficie .blog__panel conserva el mismo alto con cada tema activo
// And todas las entradas del tema elegido caben sin recortarse
// And se conserva la forma redondeada de la superficie y su unión con la pestaña activa
//
// Scenario: cambiar de tema mantiene la posición del contenido siguiente y muestra las entradas correctas
// Given el blog renderizado en navegador con Ingeniería, Diseño e IA y distinta cantidad de entradas por tema
// And existe contenido después de la superficie .blog__panel
// When el visitante cambia de Ingeniería a Diseño, después a IA y vuelve a Ingeniería por clic y por teclado
// Then la posición vertical del contenido siguiente no cambia durante ni después de cada transición
// And solo quedan visibles las entradas del tema elegido, con sus títulos, fechas y cantidad originales
// And la selección ARIA, el foco y la navegación por teclado conservan su comportamiento
// And se conserva el fade ascendente escalonado y se respeta la preferencia de movimiento reducido
// El alto y la posición se verifican en navegador, no con geometría simulada ni CSS en jsdom.
//
// Scenario: cada cambio de tema invoca un fade ascendente escalonado para todas sus entradas
// Given el blog inicializado con varios temas y movimiento permitido
// When el visitante cambia de tema por clic y por teclado y vuelve a un tema ya visitado
// Then cada cambio invoca la animación de todas las entradas del nuevo panel en orden de lectura
// And la animación parte de transparencia y desplazamiento hacia abajo y termina visible sin desplazamiento
// And las entradas tienen inicios progresivos mediante delay o stagger positivo
// And no se animan entradas de los paneles ocultos
// And el resaltado se coloca sin animación al servirse y acompaña cada cambio con una transición
// El contrato se comprueba observando las invocaciones al motor de animación,
// no el CSS calculado ni píxeles; la apariencia del fade ascendente se verifica en navegador.
//
// Scenario: la pestaña activa se eleva y se une al panel con esquinas internas y externas redondeadas
// Given una pestaña temática activa y su panel gris
// When el visitante cambia entre Ingeniería, Diseño e IA
// Then la superficie conserva sus esquinas externas redondeadas
// And la pestaña activa se eleva visualmente sobre el panel con esquinas superiores redondeadas
// And la unión entre pestaña y panel muestra esquinas internas redondeadas a ambos lados
// And esta forma se conserva con la pestaña activa en la primera, intermedia o última posición
// And el refinamiento conserva el contenido y el estilo actual de cada tema
// And la selección ARIA, el panel visible y la navegación y el foco por teclado mantienen su comportamiento
// Los radios y la forma se verifican visualmente en navegador al recorrer las tres pestañas,
// nunca mediante píxeles o geometría en jsdom ni assertions de implementación CSS.

import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { gsap } from '@lib/core/gsap';
import {
  buildBlogTopics,
  renderBlogArchive,
  type BlogTopicView
} from '@lib/utils/blog-markup';
import type { BlogTopic, PostLike } from '@lib/utils/blog-posts';
import { initBlog } from './init';

vi.mock('@lib/core/gsap', () => ({ gsap: { set: vi.fn(), to: vi.fn(), fromTo: vi.fn(), killTweensOf: vi.fn() } }));

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type AnimationMock = { set: Mock; to: Mock; fromTo: Mock };
const gsapMock = gsap as unknown as AnimationMock;

/** Entrada de fixture: además de lo que el blog usa, lleva descripción y etiquetas. */
type FixturePost = PostLike & { description: string; tags: string[] };

function makePost(
  topic: BlogTopic,
  title: string,
  pubDate: string,
  extra: Partial<FixturePost> = {}
): FixturePost {
  return {
    slug: title.toLowerCase().replaceAll(' ', '-'),
    title,
    pubDate,
    topic,
    description: `Descripción de ${title}`,
    tags: ['arquitectura', 'rendimiento'],
    ...extra
  };
}

/** Publicaciones mezcladas, con un borrador más reciente en cada tema que lo tiene. */
const posts: FixturePost[] = [
  makePost('engineering', 'Renderizar sin bloquear', '2026-05-04'),
  makePost('design', 'Contraste antes que color', '2026-04-20'),
  makePost('engineering', 'Medir el presupuesto de bytes', '2026-06-11'),
  makePost('ai', 'Criterio humano sobre el modelo', '2026-03-02'),
  makePost('design', 'Una retícula que respira', '2026-05-28'),
  makePost('engineering', 'Tipos que documentan', '2026-02-15'),
  makePost('engineering', 'Borrador de arquitectura', '2026-07-01', { draft: true }),
  makePost('design', 'Borrador de tipografía', '2026-06-30', { draft: true }),
  makePost('ai', 'Publicado explícito', '2026-01-09', { draft: false })
];

/** Título y fecha corta esperados de cada publicación, escritos a mano. */
const EXPECTED_ENTRIES: [string, string][] = [
  ['Medir el presupuesto de bytes', 'jun 2026'],
  ['Renderizar sin bloquear', 'may 2026'],
  ['Tipos que documentan', 'feb 2026'],
  ['Una retícula que respira', 'may 2026'],
  ['Contraste antes que color', 'abr 2026'],
  ['Criterio humano sobre el modelo', 'mar 2026'],
  ['Publicado explícito', 'ene 2026']
];

/** Temas con distinta cantidad de entradas: Ingeniería cinco, Diseño tres, IA dos. */
const unevenPosts: FixturePost[] = [
  makePost('engineering', 'Cinco', '2026-05-05'),
  makePost('engineering', 'Cuatro', '2026-05-04'),
  makePost('engineering', 'Tres', '2026-05-03'),
  makePost('engineering', 'Dos', '2026-05-02'),
  makePost('engineering', 'Uno', '2026-05-01'),
  makePost('design', 'Retícula', '2026-04-03'),
  makePost('design', 'Tipografía', '2026-04-02'),
  makePost('design', 'Color', '2026-04-01'),
  makePost('ai', 'Criterio', '2026-03-02'),
  makePost('ai', 'Contexto', '2026-03-01')
];

/** Título y fecha esperados de cada panel de `unevenPosts`, por índice de pestaña. */
const UNEVEN_ENTRIES: [string, string][][] = [
  [
    ['Cinco', 'may 2026'],
    ['Cuatro', 'may 2026'],
    ['Tres', 'may 2026'],
    ['Dos', 'may 2026'],
    ['Uno', 'may 2026']
  ],
  [
    ['Retícula', 'abr 2026'],
    ['Tipografía', 'abr 2026'],
    ['Color', 'abr 2026']
  ],
  [
    ['Criterio', 'mar 2026'],
    ['Contexto', 'mar 2026']
  ]
];

function titlesOf(topics: readonly BlogTopicView[], topic: BlogTopic): string[] {
  return (topics.find((group) => group.id === topic)?.entries ?? []).map((entry) => entry.title);
}

function tabsOf(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('[data-blog-tab]'));
}

function panelsOf(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-blog-panel]'));
}

function entriesOf(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>('[data-blog-entry]'));
}

/** Entradas del panel visible, como [título, fecha]: lo que el visitante tiene delante. */
function visibleEntries(root: HTMLElement): [string, string][] {
  const panel = panelsOf(root).find((candidate) => !candidate.hidden)!;
  return entriesOf(panel).map((entry) => [
    entry.querySelector<HTMLElement>('[data-blog-title]')!.textContent!.trim(),
    entry.querySelector<HTMLElement>('[data-blog-date]')!.textContent!.trim()
  ]);
}

function highlightOf(root: HTMLElement): HTMLElement {
  return root.querySelector<HTMLElement>('[data-blog-highlight]')!;
}

/** Se comprueba por identidad: la igualdad estructural de jsdom no distingue nodos. */
function expectSameNodes(actual: readonly unknown[], expected: readonly unknown[]): void {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((node, index) => expect(actual[index]).toBe(node));
}

/** Estado accesible observable tras una activación: pestaña elegida y panel visible. */
function expectSelection(root: HTMLElement, index: number): void {
  const tabs = tabsOf(root);
  const panels = panelsOf(root);
  const active = tabs[index];

  expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true')).toEqual([active]);
  expect(tabs.filter((tab) => tab.tabIndex === 0)).toEqual([active]);
  expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'false')).toHaveLength(tabs.length - 1);
  expect(tabs.filter((tab) => tab.tabIndex === -1)).toHaveLength(tabs.length - 1);
  expect(panels.filter((panel) => !panel.hidden).map((panel) => panel.id)).toEqual([
    active.getAttribute('aria-controls')
  ]);
  expect(panels.filter((panel) => panel.hidden)).toHaveLength(panels.length - 1);
}

/** Posiciones que ha recibido el resaltado, en orden de invocación. */
function highlightPlacements(): { xPercent?: number }[] {
  return [gsapMock.set, gsapMock.to]
    .flatMap((mock) => mock.mock.calls.map((args, index) => ({ args, order: mock.mock.invocationCallOrder[index] })))
    .sort((a, b) => a.order - b.order)
    .filter(({ args: [target] }) => target instanceof HTMLElement && target.hasAttribute('data-blog-highlight'))
    .map(({ args: [, vars] }) => vars as { xPercent?: number });
}

/** Movimientos animados del resaltado: los que el feature pide como transición, no como salto. */
function animatedHighlightMoves(): { xPercent?: number; duration?: number }[] {
  return gsapMock.to.mock.calls
    .filter(([target]) => target instanceof HTMLElement && target.hasAttribute('data-blog-highlight'))
    .map(([, vars]) => vars as { xPercent?: number; duration?: number });
}

/** Fades de entradas pedidos al motor, con sus puntos de partida y llegada. */
function fadeCalls(): { targets: HTMLElement[]; from: Record<string, number>; to: Record<string, number> }[] {
  return gsapMock.fromTo.mock.calls.map(([targets, from, to]) => ({
    targets: targets as HTMLElement[],
    from: from as Record<string, number>,
    to: to as Record<string, number>
  }));
}

/** Pulsación sobre una pestaña; devuelve si el feature se quedó el evento. */
function pressKey(tab: HTMLButtonElement, key: string): boolean {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  tab.dispatchEvent(event);
  return event.defaultPrevented;
}

function installMatchMedia(reducedMotion: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion && query === REDUCED_MOTION_QUERY,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
}

/**
 * Monta el marcado real del archivo y lo inicializa, sin depender de geometría simulada.
 * `beforeInit` observa el marcado tal como se sirve, antes de que corra el feature.
 */
function mount(
  fixture: readonly FixturePost[] = posts,
  options: { reducedMotion?: boolean; beforeInit?: (root: HTMLElement) => void } = {}
): HTMLElement {
  installMatchMedia(options.reducedMotion ?? false);
  document.body.innerHTML = renderBlogArchive(buildBlogTopics(fixture));

  const root = document.querySelector<HTMLElement>('[data-blog]')!;
  options.beforeInit?.(root);

  initBlog();
  return root;
}

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('Blog por temas', () => {
  // Scenario: agrupa por temas en orden explícito y ordena publicaciones excluyendo borradores
  it('agrupa por temas en orden explícito y ordena publicaciones excluyendo borradores', () => {
    const topics = buildBlogTopics(posts);

    expect(topics.map((topic) => topic.id)).toEqual(['engineering', 'design', 'ai']);
    expect(topics.map((topic) => topic.label)).toEqual(['Ingeniería', 'Diseño', 'IA']);
    expect(titlesOf(topics, 'engineering')).toEqual([
      'Medir el presupuesto de bytes',
      'Renderizar sin bloquear',
      'Tipos que documentan'
    ]);
    expect(titlesOf(topics, 'design')).toEqual(['Una retícula que respira', 'Contraste antes que color']);
    // La publicación con `draft: false` cuenta como publicada; los borradores no aparecen.
    expect(titlesOf(topics, 'ai')).toEqual(['Criterio humano sobre el modelo', 'Publicado explícito']);

    const rendered = renderBlogArchive(topics);
    expect(rendered).not.toContain('Borrador');

    // Un tema cuyas notas son todas borradores no genera grupo ni pestaña.
    const withoutAi = buildBlogTopics(posts.map((post) => (post.topic === 'ai' ? { ...post, draft: true } : post)));
    expect(withoutAi.map((topic) => topic.id)).toEqual(['engineering', 'design']);
    expect(renderBlogArchive(withoutAi)).not.toContain('blog-tab-ai');
  });

  // Scenario: activar una pestaña temática muestra únicamente su panel con selección accesible
  it('activar una pestaña temática muestra únicamente su panel con selección accesible', () => {
    // El marcado servido ya deja la primera pestaña seleccionada y su panel visible.
    const root = mount(posts, { beforeInit: (served) => expectSelection(served, 0) });
    const tabs = tabsOf(root);

    expect(root.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Notas por tema');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Ingeniería', 'Diseño', 'IA']);
    tabs.forEach((tab) => {
      const panel = root.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`);
      expect(panel).not.toBeNull();
      expect(panel!.getAttribute('aria-labelledby')).toBe(tab.id);
    });

    expectSelection(root, 0);

    tabs[1].click();
    expectSelection(root, 1);

    tabs[2].click();
    expectSelection(root, 2);
  });

  // Scenario: las flechas activan y enfocan pestañas adyacentes con recorrido circular
  it('las flechas activan y enfocan pestañas adyacentes con recorrido circular', () => {
    const root = mount();
    const tabs = tabsOf(root);

    tabs[0].focus();
    expect(document.activeElement).toBe(tabs[0]);

    // La flecha se queda el evento: sin cancelarlo el navegador desplazaría la página.
    expect(pressKey(tabs[0], 'ArrowRight')).toBe(true);
    expect(document.activeElement).toBe(tabs[1]);
    expectSelection(root, 1);

    pressKey(tabs[1], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[0]);
    expectSelection(root, 0);

    pressKey(tabs[0], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[2]);
    expectSelection(root, 2);

    pressKey(tabs[2], 'ArrowRight');
    expect(document.activeElement).toBe(tabs[0]);
    expectSelection(root, 0);

    // Las demás teclas siguen siendo del navegador: ni cambian de tema ni se cancelan.
    // `constructor` incluido: nombrar un miembro heredado no cuenta como flecha.
    ['Tab', 'Enter', ' ', 'Home', 'constructor'].forEach((key) => {
      expect(pressKey(tabs[0], key)).toBe(false);
      expectSelection(root, 0);
      expect(document.activeElement).toBe(tabs[0]);
    });
  });

  // Scenario: cada entrada expone únicamente su título y fecha al explorar los temas
  it('cada entrada expone únicamente su título y fecha al explorar los temas', () => {
    const root = mount();
    const rendered: [string, string][] = [];

    panelsOf(root).forEach((panel) => {
      entriesOf(panel).forEach((entry) => {
        const title = entry.querySelector<HTMLElement>('[data-blog-title]')!;
        const date = entry.querySelector<HTMLElement>('[data-blog-date]')!;

        expect(entry.tagName).toBe('ARTICLE');
        expect(title.tagName).toBe('H3');
        expect(date.tagName).toBe('TIME');
        // Ni un elemento más: la entrada es el título y la fecha.
        expectSameNodes(Array.from(entry.children), [title, date]);
        expect(entry.textContent!.replace(/\s+/g, ' ').trim()).toBe(`${title.textContent} ${date.textContent}`.trim());
        expect(date.getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(title.textContent!.length).toBeGreaterThan(0);
        expect(date.textContent!.length).toBeGreaterThan(0);

        rendered.push([title.textContent!.trim(), date.textContent!.trim()]);
      });
    });

    expect(rendered).toEqual(EXPECTED_ENTRIES);

    const html = root.outerHTML;
    expect(html).not.toContain('Descripción de');
    expect(html).not.toContain('.md');
    ['arquitectura', 'rendimiento'].forEach((tag) => expect(html).not.toContain(tag));

    // El título llega como texto: uno con marcado, comillas o apóstrofos no crea elementos
    // ni pierde caracteres por el camino.
    const literal = `Marcado <b>crudo</b> & firmas "citadas" con apóstrofo 'suelto'`;
    const [topic] = buildBlogTopics([makePost('engineering', literal, '2026-01-05')]);
    const probe = document.createElement('div');
    probe.innerHTML = renderBlogArchive([topic]);
    expect(probe.querySelector<HTMLElement>('[data-blog-title]')!.textContent).toBe(literal);
    expect(probe.querySelector('[data-blog-entry] b')).toBeNull();
  });

  // Scenario: las fechas muestran el mes abreviado en español y el año
  it('las fechas muestran el mes abreviado en español y el año', () => {
    const dated = [
      makePost('engineering', 'Primero de agosto', '2026-08-01'),
      makePost('design', 'Último de diciembre', '2025-12-31')
    ];
    const labels = Array.from(mount(dated).querySelectorAll<HTMLElement>('[data-blog-date]')).map(
      (date) => date.textContent!.trim()
    );

    expect(labels).toEqual(['ago 2026', 'dic 2025']);
    // Mes abreviado y año, sin día, hora, coma ni punto.
    labels.forEach((label) => {
      expect(label).toMatch(/^[a-z]{3} \d{4}$/);
      expect(label).not.toContain(',');
      expect(label).not.toContain('.');
    });

    // Las doce abreviaturas, una por mes y repartidas entre temas para que ninguna se recorte.
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const cycle: BlogTopic[] = ['engineering', 'design', 'ai'];
    const monthly = months.map((_, index) =>
      makePost(cycle[index % cycle.length], `Mes ${index}`, `2026-${String(index + 1).padStart(2, '0')}-01`)
    );
    const labelByTitle: Record<string, string> = Object.fromEntries(
      buildBlogTopics(monthly).flatMap((topic) => topic.entries.map((entry) => [entry.title, entry.dateLabel]))
    );

    expect(months.map((_, index) => labelByTitle[`Mes ${index}`])).toEqual(
      months.map((month) => `${month} 2026`)
    );
  });

  // Scenario: el movimiento reducido permite cambiar de tema sin animación
  it('el movimiento reducido permite cambiar de tema sin animación', () => {
    const root = mount(posts, { reducedMotion: true });
    const tabs = tabsOf(root);
    const panels = panelsOf(root);

    tabs[1].click();

    expectSelection(root, 1);
    expect(gsapMock.to).not.toHaveBeenCalled();
    expect(gsapMock.fromTo).not.toHaveBeenCalled();
    // El resaltado acompaña la selección sin animación, ya en su posición final.
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 100 });

    const reveal = gsapMock.set.mock.calls.find(([target]) => Array.isArray(target));
    expect(reveal).toBeDefined();
    expectSameNodes(reveal![0] as HTMLElement[], entriesOf(panels[1]));
    expect(reveal![1]).toEqual({ opacity: 1, y: 0 });

    tabs[2].focus();
    pressKey(tabs[2], 'ArrowLeft');

    expect(document.activeElement).toBe(tabs[1]);
    expectSelection(root, 1);
    expect(gsapMock.to).not.toHaveBeenCalled();
    expect(gsapMock.fromTo).not.toHaveBeenCalled();
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 100 });
  });

  // Scenario: cada tema conserva como máximo cinco notas recientes sin añadir entradas de relleno
  it('cada tema conserva como máximo cinco notas recientes sin añadir entradas de relleno', () => {
    const crowded: FixturePost[] = [
      ...['Nota 1', 'Nota 2', 'Nota 3', 'Nota 4', 'Nota 5', 'Nota 6', 'Nota 7'].map((title, index) =>
        makePost('engineering', title, `2026-01-0${index + 1}`)
      ),
      makePost('engineering', 'Borrador reciente', '2026-09-30', { draft: true }),
      makePost('engineering', 'Borrador viejo', '2025-12-31', { draft: true }),
      makePost('design', 'Diseño uno', '2026-02-01'),
      makePost('design', 'Diseño dos', '2026-03-01'),
      makePost('design', 'Diseño tres', '2026-04-01')
    ];

    const topics = buildBlogTopics(crowded);
    expect(titlesOf(topics, 'engineering')).toEqual(['Nota 7', 'Nota 6', 'Nota 5', 'Nota 4', 'Nota 3']);
    // Un tema con menos de cinco conserva todas sus publicadas.
    expect(titlesOf(topics, 'design')).toEqual(['Diseño tres', 'Diseño dos', 'Diseño uno']);

    const root = mount(crowded);
    const panels = panelsOf(root);
    expect(entriesOf(panels[0])).toHaveLength(5);
    expect(entriesOf(panels[1])).toHaveLength(3);
    // Sin entradas de relleno: la lista contiene exactamente las entradas del tema.
    expect(Array.from(panels[0].querySelector('.blog__list')!.children)).toHaveLength(5);

    const text = root.textContent!;
    ['Nota 2', 'Nota 1', 'Borrador'].forEach((discarded) => expect(text).not.toContain(discarded));
  });

  // Scenario: todos los temas reservan el mismo alto aunque tengan distinta cantidad de entradas
  it('todos los temas reservan el mismo alto aunque tengan distinta cantidad de entradas', () => {
    // El alto lo mide el navegador: aquí se comprueba la invariante que lo sostiene. Los tres
    // paneles se sirven hermanos dentro de la misma superficie —el CSS los apila en una sola celda
    // y la fila la mide el tema más largo— y cada uno conserva todas sus entradas, así que el tema
    // corto no estira su alto con filas de relleno ni pierde ninguna nota.
    const root = mount(unevenPosts);
    const panels = panelsOf(root);
    const lists = panels.map((panel) => panel.querySelector<HTMLElement>('.blog__list')!);
    const topics = buildBlogTopics(unevenPosts);

    // Una sola superficie, con un panel por tema y en el orden de las pestañas.
    expectSameNodes(Array.from(root.children).slice(1), panels);
    expect(tabsOf(root)).toHaveLength(panels.length);
    expect(panels.map((panel) => entriesOf(panel).length)).toEqual([5, 3, 2]);
    lists.forEach((list, index) => expectSameNodes(Array.from(list.children), entriesOf(panels[index])));
    // Nada de relleno: la superficie contiene exactamente las notas publicadas de los tres temas.
    expect(panels.reduce((total, panel) => total + entriesOf(panel).length, 0)).toBe(
      topics.reduce((total, topic) => total + topic.entries.length, 0)
    );

    // Recorrer las tres pestañas no reconstruye la superficie: los mismos paneles, con las mismas
    // entradas, siguen apilados bajo el tema elegido y el que tiene menos notas no se vacía.
    const servedEntries = lists.map((list) => Array.from(list.children));
    [1, 2, 0].forEach((index) => {
      tabsOf(root)[index].click();

      expectSelection(root, index);
      expectSameNodes(Array.from(root.children).slice(1), panels);
      lists.forEach((list, position) => expectSameNodes(Array.from(list.children), servedEntries[position]));
      expect(visibleEntries(root)).toEqual(UNEVEN_ENTRIES[index]);
    });
  });

  // Scenario: cambiar de tema mantiene la posición del contenido siguiente y muestra las entradas correctas
  it('cambiar de tema mantiene la posición del contenido siguiente y muestra las entradas correctas', () => {
    // Alto y posición se miden en navegador: aquí se fija lo que los mantiene. La superficie se
    // sirve con los tres paneles apilados y no se reconstruye ni cambia de composición al cambiar
    // de tema, de modo que su alto y su hueco en el documento no dependen del tema elegido; el
    // contenido posterior sigue siendo su hermano, sin nada insertado ni quitado alrededor.
    const following = document.createElement('footer');
    following.dataset.afterBlog = '';
    const root = mount(unevenPosts, { beforeInit: (served) => served.after(following) });
    const panels = panelsOf(root);
    const lists = panels.map((panel) => panel.querySelector<HTMLElement>('.blog__list')!);
    const servedChildren = Array.from(root.children);
    const servedEntries = lists.map((list) => Array.from(list.children));
    const tabs = tabsOf(root);

    const expectStableSurface = (): void => {
      expect(following.previousElementSibling).toBe(root);
      expectSameNodes(Array.from(root.children), servedChildren);
      lists.forEach((list, index) => expectSameNodes(Array.from(list.children), servedEntries[index]));
    };

    expectStableSurface();
    expect(visibleEntries(root)).toEqual(UNEVEN_ENTRIES[0]);

    // Ingeniería → Diseño → IA por clic, y vuelta a Ingeniería con el recorrido del teclado.
    tabs[1].click();
    expectSelection(root, 1);
    expectStableSurface();
    expect(visibleEntries(root)).toEqual(UNEVEN_ENTRIES[1]);

    tabs[2].click();
    expectSelection(root, 2);
    expectStableSurface();
    expect(visibleEntries(root)).toEqual(UNEVEN_ENTRIES[2]);

    tabs[2].focus();
    expect(pressKey(tabs[2], 'ArrowRight')).toBe(true);
    expectSelection(root, 0);
    expect(document.activeElement).toBe(tabs[0]);
    expectStableSurface();
    expect(visibleEntries(root)).toEqual(UNEVEN_ENTRIES[0]);

    // Cada cambio entra con el fade escalonado de sus propias entradas, también al volver.
    const fades = fadeCalls();
    expect(fades).toHaveLength(3);
    expect(fades.every((fade) => fade.to.stagger > 0)).toBe(true);
    expectSameNodes(fades.at(-1)!.targets, entriesOf(panels[0]));

    // Con movimiento reducido el cambio es inmediato y la superficie queda igual de compuesta.
    const fadesBefore = gsapMock.fromTo.mock.calls.length;
    const movesBefore = gsapMock.to.mock.calls.length;
    const reducedRoot = mount(unevenPosts, {
      reducedMotion: true,
      beforeInit: (served) => served.after(following)
    });
    const reducedChildren = Array.from(reducedRoot.children);

    tabsOf(reducedRoot)[1].click();

    expectSelection(reducedRoot, 1);
    expect(following.previousElementSibling).toBe(reducedRoot);
    expectSameNodes(Array.from(reducedRoot.children), reducedChildren);
    expect(visibleEntries(reducedRoot)).toEqual(UNEVEN_ENTRIES[1]);
    expect(gsapMock.fromTo.mock.calls.length).toBe(fadesBefore);
    expect(gsapMock.to.mock.calls.length).toBe(movesBefore);
    const reveal = gsapMock.set.mock.calls.filter(([target]) => Array.isArray(target)).at(-1);
    expect(reveal).toBeDefined();
    expectSameNodes(reveal![0] as HTMLElement[], entriesOf(panelsOf(reducedRoot)[1]));
    expect(reveal![1]).toEqual({ opacity: 1, y: 0 });
  });

  // Scenario: cada cambio de tema invoca un fade ascendente escalonado para todas sus entradas
  it('cada cambio de tema invoca un fade ascendente escalonado para todas sus entradas', () => {
    const root = mount();
    const tabs = tabsOf(root);
    const panels = panelsOf(root);

    // Al servirse la selección ya está puesta: el resaltado se coloca de una vez, sin animar.
    expect(animatedHighlightMoves()).toHaveLength(0);

    tabs[1].click();

    let fades = fadeCalls();
    expect(fades).toHaveLength(1);
    expectSameNodes(fades[0].targets, entriesOf(panels[1]));
    expect(fades[0].from.opacity).toBe(0);
    expect(fades[0].from.y).toBeGreaterThan(0);
    expect(fades[0].to.opacity).toBe(1);
    expect(fades[0].to.y).toBe(0);
    expect(fades[0].to.stagger).toBeGreaterThan(0);
    // Solo entran las del panel que se muestra: las de los paneles ocultos no se animan.
    expect(fades[0].targets.every((entry) => entry.closest('[data-blog-panel]') === panels[1])).toBe(true);
    // El resaltado tampoco salta: acompaña el cambio con una transición hacia la pestaña elegida.
    expect(animatedHighlightMoves()).toEqual([
      expect.objectContaining({ xPercent: 100 })
    ]);
    expect(animatedHighlightMoves()[0].duration).toBeGreaterThan(0);

    pressKey(tabs[1], 'ArrowRight');

    fades = fadeCalls();
    expect(fades).toHaveLength(2);
    expectSelection(root, 2);
    expectSameNodes(fades[1].targets, entriesOf(panels[2]));

    // Volver a un tema ya visitado vuelve a animar sus entradas.
    tabs[1].click();

    fades = fadeCalls();
    expect(fades).toHaveLength(3);
    expectSameNodes(fades[2].targets, entriesOf(panels[1]));
  });

  it('pulsar la pestaña activa no reinicia el indicador ni sus entradas', () => {
    const root = mount();
    const tabs = tabsOf(root);
    tabs[1].click();
    const moves = gsapMock.to.mock.calls.length;
    const fades = gsapMock.fromTo.mock.calls.length;
    tabs[1].click();
    expectSelection(root, 1);
    expect(gsapMock.to).toHaveBeenCalledTimes(moves);
    expect(gsapMock.fromTo).toHaveBeenCalledTimes(fades);
  });

  // Scenario: la pestaña activa se eleva y se une al panel con esquinas internas y externas redondeadas
  it('la pestaña activa se eleva y se une al panel con esquinas internas y externas redondeadas', () => {
    const root = mount();
    const tabs = tabsOf(root);
    const panels = panelsOf(root);
    const highlight = highlightOf(root);

    // Una sola superficie: el resaltado es el mismo elemento y se mueve con la pestaña activa.
    expect(root.querySelectorAll('[data-blog-highlight]')).toHaveLength(1);
    expectSelection(root, 0);
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 0 });

    tabs[1].click();
    expectSelection(root, 1);
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 100 });

    tabs[2].click();
    expectSelection(root, 2);
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 200 });

    // De vuelta a la primera y a la intermedia con el teclado, el foco y la selección se conservan.
    pressKey(tabs[2], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[1]);
    expectSelection(root, 1);
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 100 });

    pressKey(tabs[1], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[0]);
    expectSelection(root, 0);
    expect(highlightPlacements().at(-1)).toMatchObject({ xPercent: 0 });

    // El refinamiento no toca el contenido: cada panel conserva sus entradas.
    expect(panels.map((panel) => entriesOf(panel).length)).toEqual([3, 2, 2]);
    expect(highlightOf(root)).toBe(highlight);
  });
});
