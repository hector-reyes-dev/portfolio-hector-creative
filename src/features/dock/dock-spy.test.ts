// Feature: El scroll-spy del dock sigue exactamente los destinos de la navbar homologada
// @vitest-environment jsdom
//
// Endurecimiento, no comportamiento nuevo: `initDock` no tenía pruebas directas y esta
// historia cambió su lista de secciones vigiladas al homologar la navbar
// (Acerca de mí, Mi trabajo, Mis notas, Trabaja conmigo). Sin estas pruebas sobrevivían
// los mutantes del marcado activo, de la sonda al 42 % del alto y del acelerador de scroll.
//
// La geometría se simula: jsdom no hace layout, así que cada sección declara su `offsetTop`
// y la ventana su alto. No se miden píxeles reales; se comprueba qué sección elige la sonda.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { siteContent } from '../../lib/core/site-content';
import { initDock } from './init';

/** Destinos de la navbar, en el orden en que aparecen en la página. */
const SECTION_IDS = siteContent.navigation.map((section) => section.id);
const VIEWPORT = 1000;

/** Sección presente en la página pero fuera de la navbar: el spy debe ignorarla. */
const DECOY_ID = 'proyectos';
const DECOY_OFFSET = 2200;

const offsetOf = (index: number): number => index * VIEWPORT;

let frames: FrameRequestCallback[] = [];
let listeners: Array<[string, EventListenerOrEventListenerObject, unknown]> = [];

function mountDock(): void {
  document.body.innerHTML = `
    <nav class="dock">
      ${SECTION_IDS.map((id) => `<a class="dock__item" href="#${id}" data-section="${id}"></a>`).join('')}
    </nav>
    ${SECTION_IDS.map((id) => `<section id="${id}"></section>`).join('')}
    <section id="${DECOY_ID}"></section>
  `;

  const place = (id: string, top: number): void => {
    Object.defineProperty(document.getElementById(id), 'offsetTop', { value: top, configurable: true });
  };
  SECTION_IDS.forEach((id, index) => place(id, offsetOf(index)));
  place(DECOY_ID, DECOY_OFFSET);
}

function scrollTo(y: number): void {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

function flushFrames(): void {
  const pending = frames;
  frames = [];
  pending.forEach((frame) => frame(0));
}

function activeSections(): Array<string | undefined> {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('.dock__item.is-active')).map(
    (item) => item.dataset.section
  );
}

function currentSections(): Array<string | undefined> {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('.dock__item[aria-current="true"]')).map(
    (item) => item.dataset.section
  );
}

beforeEach(() => {
  frames = [];
  listeners = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  Object.defineProperty(window, 'innerHeight', { value: VIEWPORT, configurable: true });
  scrollTo(0);

  // Los oyentes viven en `window` y sobreviven al test: se anotan para retirarlos después.
  const addEventListener = window.addEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((type, handler, options) => {
    listeners.push([type, handler as EventListenerOrEventListenerObject, options]);
    addEventListener(type, handler, options);
  });

  mountDock();
});

afterEach(() => {
  vi.restoreAllMocks();
  listeners.forEach(([type, handler, options]) => {
    window.removeEventListener(type, handler, options as EventListenerOptions);
  });
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('El scroll-spy del dock sigue los destinos de la navbar homologada', () => {
  it('marca como activa la sección bajo la sonda y solo esa', () => {
    initDock();

    expect(activeSections()).toEqual([SECTION_IDS[0]]);
    expect(currentSections()).toEqual([SECTION_IDS[0]]);
  });

  it('vigila cada destino de la navbar e ignora las secciones que no lo son', () => {
    initDock();

    SECTION_IDS.forEach((id, index) => {
      scrollTo(offsetOf(index));
      window.dispatchEvent(new Event('scroll'));
      flushFrames();

      expect(activeSections()).toEqual([id]);
    });

    // La sonda rebasa una sección ajena a la navbar: sigue activo el último destino real.
    scrollTo(DECOY_OFFSET - VIEWPORT * 0.3);
    window.dispatchEvent(new Event('scroll'));
    flushFrames();

    expect(activeSections()).toEqual(['blog']);
  });

  it('sitúa la sonda al 42 % del alto de la ventana', () => {
    scrollTo(800);

    initDock();

    // 800 + 1000 * 0.42 = 1220: alcanza la segunda sección (1000) pero no la tercera (2000).
    expect(activeSections()).toEqual([SECTION_IDS[1]]);
  });

  it('traslada la marca activa al desplazarse y limpia la anterior', () => {
    initDock();
    const first = document.querySelector<HTMLAnchorElement>(`.dock__item[data-section="${SECTION_IDS[0]}"]`);

    scrollTo(offsetOf(2));
    window.dispatchEvent(new Event('scroll'));
    flushFrames();

    expect(activeSections()).toEqual([SECTION_IDS[2]]);
    expect(currentSections()).toEqual([SECTION_IDS[2]]);
    expect(first?.classList.contains('is-active')).toBe(false);
    expect(first?.hasAttribute('aria-current')).toBe(false);
  });

  it('agrupa las ráfagas de scroll en un solo fotograma', () => {
    initDock();
    expect(frames).toHaveLength(0);

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(frames).toHaveLength(1);

    flushFrames();
    window.dispatchEvent(new Event('scroll'));

    expect(frames).toHaveLength(1);
  });
});
