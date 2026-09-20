// Feature: Intercambio de componentes entre Casos documentados y Proyectos
//
// Scenario: Casos documentados muestra el showcase de proyectos en lugar de las cards
// Given la página de inicio con las secciones Casos documentados y Proyectos
// When el visitante consulta Casos documentados en #trabajo
// Then encuentra el componente ProjectShowcase que antes se mostraba en Proyectos
// And el showcase conserva sus proyectos, panel principal y selectores
// And esa sección ya no contiene la grilla de ProjectCard de casos documentados
//
// Scenario: Proyectos muestra las cards de casos documentados en lugar del showcase
// Given la página de inicio con las secciones Casos documentados y Proyectos
// When el visitante consulta Proyectos en #proyectos
// Then encuentra la grilla de ProjectCard que antes se mostraba en Casos documentados
// And las cards conservan los casos documentados y sus enlaces
// And esa sección ya no contiene ProjectShowcase
//
// Scenario: el intercambio conserva la identidad de las secciones y los componentes existentes
// Given los componentes existentes ProjectShowcase y ProjectCard y las anclas de navegación
// When se renderiza la página de inicio tras intercambiar los componentes
// Then #trabajo conserva el título Casos documentados y #proyectos conserva el título Proyectos
// And cada componente aparece únicamente en su nueva sección sin duplicarse
// And se reutilizan los componentes existentes sin rediseñarlos ni resolver el intercambio solo renombrando títulos
//
// @vitest-environment node
//
// Harness: qué componente vive en cada sección no se puede observar en jsdom sin renderizar
// los `.astro` reales. Se rinde `src/pages/index.astro` con la API de contenedor de Astro
// (`astro/container`); para eso `vitest.config.ts` envuelve su config con `getViteConfig` de
// `astro/config`, que aporta el plugin de Vite que compila `.astro` (el `defineConfig` de
// Vitest no lo hace). El entorno es `node` porque bajo jsdom ese plugin sirve la variante de
// navegador de cada componente ("Astro components cannot be used in the browser").
//
// Lo comparado es el HTML que el servidor entrega de verdad, normalizado en espacios: el
// render suelto de `ProjectShowcase` y de cada `ProjectCard` (con los mismos props) es el
// patrón exacto de reutilización, así que una copia rediseñada dentro de la sección no
// coincidiría. No hay aserciones sobre texto fuente de los `.astro`.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ProjectCard from '../../components/molecules/ProjectCard.astro';
import ProjectShowcase from '../../components/molecules/ProjectShowcase.astro';
import HomePage from '../../pages/index.astro';
import { documentedProjects, siteContent } from '../../lib/core/site-content';

const CASES = documentedProjects();
const PROJECTS = siteContent.projects;
/**
 * Los proyectos que el showcase ya mostraba en #proyectos antes del intercambio: el showcase
 * acota la colección a seis, y el intercambio no altera esa cuota ni su orden.
 */
const SHOWCASE_PROJECTS = PROJECTS.slice(0, 6);

let page: string;
let standaloneShowcase: string;
let standaloneCards: string;

/** HTML sin diferencias de formato: ni espacios entre etiquetas ni secuencias de espacios. */
function compact(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ');
}

/**
 * Sección completa por su id. Ninguna de las dos secciones anida otra `<section>`, así que el
 * primer cierre que sigue al inicio delimita la sección sin necesidad de un parser de HTML.
 */
function sectionOf(html: string, id: string): string {
  const start = new RegExp(`<section[^>]*id="${id}"`).exec(html);
  if (!start) throw new Error(`La página de inicio no renderiza la sección #${id}`);
  const end = html.indexOf('</section>', start.index);
  if (end === -1) throw new Error(`La sección #${id} no cierra con </section>`);
  return html.slice(start.index, end + '</section>'.length);
}

function occurrences(html: string, fragment: string): number {
  return html.split(fragment).length - 1;
}

beforeAll(async () => {
  const container = await AstroContainer.create();
  page = compact(await container.renderToString(HomePage));
  standaloneShowcase = compact(
    await container.renderToString(ProjectShowcase, { props: { projects: SHOWCASE_PROJECTS } })
  );
  const cards: string[] = [];
  for (const project of CASES) {
    cards.push(compact(await container.renderToString(ProjectCard, { props: { project, class: 'card--case' } })));
  }
  standaloneCards = cards.join('');
});

describe('Intercambio de componentes entre Casos documentados y Proyectos', () => {
  // Scenario: Casos documentados muestra el showcase de proyectos en lugar de las cards
  it('Casos documentados muestra el showcase de proyectos en lugar de las cards', () => {
    const trabajo = sectionOf(page, 'trabajo');

    // Then encuentra el componente ProjectShowcase que antes se mostraba en Proyectos
    expect(trabajo).toContain('data-project-showcase');
    expect(trabajo).toContain(standaloneShowcase);

    // And el showcase conserva sus proyectos, panel principal y selectores
    expect(trabajo).toContain('data-project-panel');
    expect(trabajo).toContain('data-project-image');
    expect(occurrences(trabajo, 'data-project-trigger')).toBe(SHOWCASE_PROJECTS.length);
    SHOWCASE_PROJECTS.forEach((project, index) => {
      expect(trabajo).toContain(`data-project-index="${index}"`);
      expect(trabajo).toContain(`aria-label="${project.full}"`);
      expect(trabajo).toContain(`data-project-full="${project.full}"`);
      expect(trabajo).toContain(`data-project-desc="${project.desc}"`);
      expect(trabajo).toContain(`data-project-slug="${project.slug}"`);
    });

    // And esa sección ya no contiene la grilla de ProjectCard de casos documentados
    expect(trabajo).not.toContain('card-grid');
    expect(trabajo).not.toContain('card--case');
    CASES.forEach((project) => {
      expect(trabajo).not.toContain(`href="#/caso/${project.slug}"`);
    });
  });

  // Scenario: Proyectos muestra las cards de casos documentados en lugar del showcase
  it('Proyectos muestra las cards de casos documentados en lugar del showcase', () => {
    const proyectos = sectionOf(page, 'proyectos');

    // Then encuentra la grilla de ProjectCard que antes se mostraba en Casos documentados
    expect(proyectos).toContain('card-grid');
    expect(proyectos).toContain(standaloneCards);

    // And las cards conservan los casos documentados y sus enlaces
    expect(occurrences(proyectos, 'card--case')).toBe(CASES.length);
    CASES.forEach((project) => {
      expect(proyectos).toContain(`href="#/caso/${project.slug}"`);
      expect(proyectos).toContain(project.full);
      expect(proyectos).toContain(project.desc);
    });

    // And esa sección ya no contiene ProjectShowcase
    expect(proyectos).not.toContain('data-project-showcase');
    expect(proyectos).not.toContain('data-project-panel');
    expect(proyectos).not.toContain('data-project-trigger');
    expect(proyectos).not.toContain('data-project-image');
  });

  // Scenario: el intercambio conserva la identidad de las secciones y los componentes existentes
  it('el intercambio conserva la identidad de las secciones y los componentes existentes', () => {
    const trabajo = sectionOf(page, 'trabajo');
    const proyectos = sectionOf(page, 'proyectos');

    // Then #trabajo conserva el título Casos documentados y #proyectos conserva el título Proyectos
    expect(trabajo).toContain('<h2 class="section-title">Casos documentados</h2>');
    expect(proyectos).toContain('<h2 class="section-title">Proyectos</h2>');
    // ...y las anclas de navegación siguen apuntando a esas secciones.
    expect(page).toContain('<a class="dock__item" href="#trabajo" data-section="trabajo">');
    expect(page).toContain('<a class="dock__item" href="#proyectos" data-section="proyectos">');

    // And cada componente aparece únicamente en su nueva sección sin duplicarse
    expect(occurrences(page, 'data-project-showcase')).toBe(1);
    expect(occurrences(trabajo, 'data-project-showcase')).toBe(occurrences(page, 'data-project-showcase'));
    expect(occurrences(page, 'card--case')).toBe(CASES.length);
    expect(occurrences(proyectos, 'card--case')).toBe(occurrences(page, 'card--case'));

    // And se reutilizan los componentes existentes sin rediseñarlos ni resolver el intercambio
    // solo renombrando títulos
    expect(trabajo).toContain(standaloneShowcase);
    expect(proyectos).toContain(standaloneCards);
    expect(trabajo).not.toContain('card--case');
    expect(proyectos).not.toContain('data-project-showcase');
  });
});
