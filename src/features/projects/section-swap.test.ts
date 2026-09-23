// Feature: Jerarquía de Mi trabajo y composición de sus subsecciones
// @vitest-environment node

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ProjectCard from '../../components/molecules/ProjectCard.astro';
import ProjectShowcase from '../../components/molecules/ProjectShowcase.astro';
import HomePage from '../../pages/index.astro';
import { documentedProjects, siteContent } from '../../lib/core/site-content';

const CASES = documentedProjects();
const PROJECTS = siteContent.projects;
const SHOWCASE_PROJECTS = PROJECTS.slice(0, 6);

let page: string;
let standaloneShowcase: string;
let standaloneCards: string;

function compact(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/=""/g, '');
}

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

describe('Jerarquía de Mi trabajo y composición de sus subsecciones', () => {
  it('Casos documentados concentra el showcase sin mezclar la grilla de proyectos', () => {
    const casos = regionOf(page, 'casos');

    expect(casos).toContain('data-project-showcase');
    expect(casos).toContain(standaloneShowcase);
    expect(casos).toContain('<h3 class="section-title">Casos documentados</h3>');
    expect(casos).not.toContain('card-grid');
    expect(casos).not.toContain('card--case');
  });

  it('Proyectos muestra las cards de casos documentados en una subsección independiente', () => {
    const proyectos = regionOf(page, 'proyectos');

    expect(proyectos).toContain('card-grid card-grid--trabajo');
    expect(proyectos).toContain(standaloneCards);
    expect(occurrences(proyectos, 'card--case')).toBe(CASES.length);
    expect(proyectos).toContain('<h3 class="section-title">Proyectos</h3>');
    expect(proyectos).not.toContain('data-project-showcase');
    expect(proyectos).not.toContain('data-project-panel');
    expect(proyectos).not.toContain('data-project-trigger');
  });

  it('Mi trabajo agrupa sus subsecciones y la navbar apunta a las secciones principales', () => {
    const trabajo = regionOf(page, 'trabajo');

    expect(trabajo).toContain('<h2 class="section-title">Mi trabajo</h2>');
    expect(trabajo).toContain('id="casos"');
    expect(trabajo).toContain('id="proyectos"');
    expect(trabajo).toContain('id="experimentos"');
    expect(occurrences(page, 'data-project-showcase')).toBe(1);
    expect(occurrences(page, 'card--case')).toBe(CASES.length);

    expect(page).toContain('<a class="dock__item" href="#inicio" data-section="inicio">');
    expect(page).toContain('<span class="dock__label">Acerca de mí</span>');
    expect(page).toContain('<a class="dock__item" href="#trabajo" data-section="trabajo">');
    expect(page).toContain('<span class="dock__label">Mi trabajo</span>');
    expect(page).toContain('<a class="dock__item" href="#blog" data-section="blog">');
    expect(page).toContain('<span class="dock__label">Mis notas</span>');
    expect(page).toContain('<a class="dock__item" href="#servicios" data-section="servicios">');
    expect(page).toContain('<span class="dock__label">Trabaja conmigo</span>');
  });
});
