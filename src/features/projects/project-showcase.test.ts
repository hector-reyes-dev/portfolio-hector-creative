// Feature: Showcase de proyectos seleccionables y accesibles
// @vitest-environment jsdom
//
// Scenario: muestra selectores como recuadros visuales sin nombres visibles, con background-image y nombre accesible
// Given un showcase con varios proyectos y una imagen principal img
// When se renderiza la fila de selectores
// Then cada selector es un recuadro visual sin el nombre del proyecto visible
// And cada selector usa background-image mediante style o un atributo equivalente y no contiene elementos img
// And cada botón conserva un nombre accesible que identifica su proyecto
// And el layout CSS permite mostrar todos los recuadros en una fila completa sin recortes cuando hay ancho suficiente
// And la imagen principal conserva su elemento img y actualiza imagen y contenido al seleccionar otro proyecto

import { afterEach, describe, expect, it, vi } from 'vitest';
import { initProjectShowcase } from './init';

type TestProject = {
  slug: string;
  num: string;
  name: string;
  full: string;
  desc: string;
  image: string;
  tags: string[];
  w: number;
  h: number;
};

const projects: TestProject[] = [
  {
    slug: 'alpha',
    num: '01',
    name: 'Alpha',
    full: 'Alpha — Proyecto inicial',
    desc: 'Descripción del proyecto Alpha.',
    image: '/assets/alpha.webp',
    tags: ['Diseño', 'Front-End'],
    w: 1200,
    h: 600
  },
  {
    slug: 'beta',
    num: '02',
    name: 'Beta',
    full: 'Beta — Segundo proyecto',
    desc: 'Descripción del proyecto Beta.',
    image: '/assets/beta.webp',
    tags: ['Back-End'],
    w: 1000,
    h: 500
  },
  {
    slug: 'gamma',
    num: '03',
    name: 'Gamma',
    full: 'Gamma — Tercer proyecto',
    desc: 'Descripción del proyecto Gamma.',
    image: '/assets/gamma.webp',
    tags: ['Producto'],
    w: 900,
    h: 450
  }
];

let cleanup: (() => void) | undefined;
let originalMatchMedia: typeof window.matchMedia;

function renderShowcase(items: TestProject[]): HTMLElement {
  const first = items[0];
  document.body.innerHTML = `
    <div data-project-showcase>
      <div data-project-panel aria-live="polite" aria-atomic="true">
        <p data-project-tags>${first.tags.join(' · ')}</p>
        <h2 data-project-title>${first.full}</h2>
        <p data-project-description>${first.desc}</p>
        <div data-project-media>
          <img data-project-image src="${first.image}" alt="${first.full}" width="${first.w}" height="${first.h}">
        </div>
      </div>
      <div class="project-showcase__selectors" role="group" aria-label="Seleccionar proyecto">
        ${items.map((project, index) => `
          <button
            class="project-showcase__selector"
            type="button"
            data-project-trigger
            data-project-index="${index}"
            data-project-image="${project.image}"
            data-project-full="${project.full}"
            data-project-desc="${project.desc}"
            data-project-tags="${project.tags.join(' · ')}"
            data-project-width="${project.w}"
            data-project-height="${project.h}"
            data-project-slug="${project.slug}"
            aria-pressed="${index === 0 ? 'true' : 'false'}"
            aria-label="${project.full}"
            style="background-image: url('${project.image}')"
          ></button>
        `).join('')}
      </div>
    </div>
  `;
  return document.querySelector<HTMLElement>('[data-project-showcase]')!;
}

function mount(items = projects, reducedMotion = false): HTMLElement {
  originalMatchMedia = window.matchMedia;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
  const root = renderShowcase(items);
  cleanup = initProjectShowcase(root);
  return root;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  window.matchMedia = originalMatchMedia;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Showcase de proyectos', () => {
  it('muestra el primer proyecto al renderizar el showcase', () => {
    const root = mount();
    const image = root.querySelector<HTMLImageElement>('[data-project-image]')!;
    const title = root.querySelector<HTMLElement>('[data-project-title]')!;
    const description = root.querySelector<HTMLElement>('[data-project-description]')!;
    const selectors = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]'));

    expect(image.getAttribute('src')).toBe(projects[0].image);
    expect(image.alt).toBe(projects[0].full);
    expect(title.textContent).toBe(projects[0].full);
    expect(description.textContent).toBe(projects[0].desc);
    expect(selectors).toHaveLength(projects.length);
    expect(selectors.map((selector) => selector.getAttribute('aria-label'))).toEqual(projects.map((project) => project.full));
    expect(selectors.filter((selector) => selector.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(selectors[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('seleccionar otro proyecto actualiza imagen, texto y estado accesible', () => {
    const root = mount();
    const selectors = root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]');
    const second = selectors[1];

    second.click();

    expect(root.querySelector<HTMLImageElement>('[data-project-image]')!.getAttribute('src')).toBe(projects[1].image);
    expect(root.querySelector<HTMLImageElement>('[data-project-image]')!.alt).toBe(projects[1].full);
    expect(root.querySelector('[data-project-title]')!.textContent).toBe(projects[1].full);
    expect(root.querySelector('[data-project-description]')!.textContent).toBe(projects[1].desc);
    expect(second.getAttribute('aria-pressed')).toBe('true');
    expect(selectors[0].getAttribute('aria-pressed')).toBe('false');
    expect(root.dataset.activeProject).toBe('1');
  });

  it('recorre y selecciona proyectos usando solo el teclado', () => {
    const root = mount();
    const selectors = root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]');
    const first = selectors[0];
    const second = selectors[1];

    first.focus();
    expect(document.activeElement).toBe(first);
    second.focus();
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(document.activeElement).toBe(second);
    expect(root.querySelector('[data-project-title]')!.textContent).toBe(projects[1].full);
    expect(second.getAttribute('aria-pressed')).toBe('true');
    expect(first.getAttribute('aria-pressed')).toBe('false');

    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(document.activeElement).toBe(first);
    expect(root.querySelector('[data-project-title]')!.textContent).toBe(projects[0].full);
    expect(first.getAttribute('aria-pressed')).toBe('true');
  });

  it('respeta la preferencia de movimiento reducido al cambiar de proyecto', () => {
    const root = mount(projects, true);
    const second = root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]')[1];

    second.click();

    expect(root.dataset.reducedMotion).toBe('true');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('0ms');
    expect(root.querySelector('[data-project-title]')!.textContent).toBe(projects[1].full);
    expect(second.getAttribute('aria-pressed')).toBe('true');
  });

  it('reinicia la transición visual en cada cambio de proyecto', () => {
    const root = mount();
    const removeAttributeSpy = vi.spyOn(root, 'removeAttribute');
    const [first, second] = root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]');

    second.click();
    expect(removeAttributeSpy).toHaveBeenCalledWith('data-project-transitioning');
    expect(root.getAttribute('data-project-transitioning')).toBe('true');

    removeAttributeSpy.mockClear();
    first.click();
    expect(removeAttributeSpy).toHaveBeenCalledWith('data-project-transitioning');
    expect(root.getAttribute('data-project-transitioning')).toBe('true');
  });
  it('muestra selectores como recuadros visuales sin nombres visibles, con background-image y nombre accesible', () => {
    const root = mount();
    const selectors = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]'));

    expect(selectors).toHaveLength(projects.length);
    expect(root.querySelectorAll('[data-project-trigger] img')).toHaveLength(0);
    expect(root.querySelectorAll('img[data-project-image]')).toHaveLength(1);

    selectors.forEach((selector, index) => {
      expect(selector.textContent?.trim()).toBe('');
      expect(selector.textContent).not.toContain(projects[index].name);
      expect(selector.getAttribute('aria-label')).toBe(projects[index].full);
      expect(selector.style.backgroundImage).toContain(projects[index].image);
    });
  });

});
