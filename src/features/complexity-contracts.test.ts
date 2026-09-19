/// <reference types="vite/client" />

// Feature: Contratos observables de las interacciones y del fondo dark #050b1a
// @vitest-environment jsdom
//
// Scenario: Tab desde el último control vuelve al primero
// Given una ventana de caso abierta con controles visibles y foco en el último
// When recibe Tab sin Shift
// Then el foco pasa al primer control y se cancela la navegación nativa del evento
//
// Scenario: Shift Tab desde el primer control vuelve al último
// Given una ventana de caso abierta con controles visibles y foco en el primero
// When recibe Shift+Tab
// Then el foco pasa al último control y se cancela la navegación nativa del evento
//
// Scenario: El foco ajeno a los controles se reconduce según la dirección
// Given una ventana con controles visibles y foco en su título o fuera de la ventana
// When se despacha Tab o Shift+Tab sobre la ventana
// Then Tab enfoca el primero y Shift+Tab el último, cancelando cada evento
// And no se exige capturar eventos despachados fuera de la ventana
//
// Scenario: La navegación interior y las otras teclas no se interceptan
// Given foco en un control interior de una ventana con varios controles visibles
// When recibe Tab en cualquier dirección o una tecla ajena a la navegación y al cierre
// Then el focus trap no cancela el evento ni mueve el foco por su cuenta
//
// Scenario: El trap conserva los casos sin controles y con un único control
// Given una ventana sin controles elegibles o con un único control elegible enfocado
// When recibe Tab o Shift+Tab
// Then sin controles no cancela el evento ni mueve el foco
// And con un único control cancela el evento y conserva el foco en ese control
// And los controles sin caja de layout se excluyen salvo si ya tienen el foco
//
// Scenario: Cerrar el caso restaura el foco sin alterar la preferencia de movimiento
// Given un caso abierto desde un enlace y un tema ya aplicado
// When se pulsa Escape con movimiento normal o reducido
// Then se restaura el foco al enlace, se limpia la ruta del caso y se conserva el tema
// And la ventana se oculta tras su salida normal o inmediatamente con movimiento reducido
// And si el enlace ya no existe el foco vuelve al enlace de trabajo del dock
//
// Scenario: El markup incompleto no produce una selección parcial
// Given un showcase al que falta imagen principal, título, descripción, tags o contenedor de medios
// When se inicializa y se activa otro selector válido
// Then el contenido restante y la selección accesible no cambian parcialmente
// And no se inicia una transición ni se lanza un error
//
// Scenario: Seleccionar un proyecto conserva contenido y accesibilidad
// Given un showcase completo con una selección inicial y selectores con nombre accesible
// When se activa otro proyecto mediante click, Enter o Espacio
// Then imagen, alt, título, descripción y tags corresponden al proyecto seleccionado
// And solo ese selector queda presionado y el foco de teclado se conserva
// And siguen funcionando tanto el scope raíz como la búsqueda de showcases dentro de un scope
//
// Scenario: Showcase conserva movimiento reducido y limpieza de listeners
// Given un showcase inicializado con movimiento reducido
// When se selecciona otro proyecto y después se ejecuta su función de limpieza
// Then la selección se actualiza sin duración de transición
// And activaciones posteriores a la limpieza dejan intactos contenido y selección
//
// Scenario: Los datos incompletos de un selector no sustituyen el proyecto actual
// Given un showcase completo con un selector sin imagen, nombre, descripción o índice requerido
// When se activa ese selector
// Then se conservan contenido, selección y estado de transición anteriores
//
// Scenario: La ráfaga respeta movimiento reducido desde el inicio
// Given un retrato enfocable con prefers-reduced-motion activo
// When se activa mediante hover de mouse, tap o click de teclado
// Then no aparecen partículas ni se inicia animación y el foco se conserva
//
// Scenario: El cambio dinámico a movimiento reducido limpia la ráfaga
// Given una ráfaga activa
// When se activa movimiento reducido y después se desactiva
// Then se cancelan las animaciones y se retiran las partículas al activar la preferencia
// And desactivarla no emite automáticamente pero una nueva activación sí emite
//
// Scenario: Sin animación o con geometría nula el retrato sigue operable
// Given un retrato sin Web Animations o una capa con ancho o alto cero
// When se activa la ráfaga
// Then no se crean partículas ni se pierde el foco ni se altera el tema
// And con animación disponible una reemisión de geometría nula retira la ráfaga anterior
//
// Scenario: La reemisión reemplaza la ráfaga y su finalización limpia los nodos
// Given un retrato con una ráfaga en curso
// When se activa otra vez y luego finalizan las nuevas animaciones
// Then la ráfaga anterior se cancela y nunca hay más de doce partículas simultáneas
// And al finalizar no quedan partículas de ninguna de las dos ráfagas
// And la cancelación no genera rechazos de promesas sin manejar
//
// Scenario: Las partículas mantienen límites y semántica decorativa
// Given geometría válida en viewports estrechos y amplios y aleatoriedad controlada
// When se emite una ráfaga
// Then aparecen doce partículas decorativas no enfocables con tamaños entre 18 y 32 píxeles
// And las animaciones tienen duración positiva acotada y opacidad cero en ambos extremos
// And el desplazamiento lateral se limita por el espacio disponible en vez de crecer sin límite
//
// Scenario: Las activaciones del retrato no duplican emisiones
// Given un retrato inicializado dos veces y un mouse con hover disponible
// When el mouse entra y hace click, o se activa por touch o click de teclado
// Then la entrada seguida del click de mouse produce una sola ráfaga
// And cada activación touch o de teclado produce una ráfaga sin mover el foco
// And repetir Enter o Espacio cancela la repetición sin emitir otra ráfaga
//
// Scenario: El tema guardado prevalece sobre el sistema
// Given storage con light o dark y una preferencia de sistema opuesta
// When se ejecuta el bootstrap y después cambia la preferencia del sistema
// Then se mantiene el tema guardado sin convertirlo en la preferencia del sistema
// And clase del documento, color-scheme, theme-color y getTheme permanecen sincronizados
//
// Scenario: Sin preferencia válida el tema sigue al sistema
// Given storage sin elección válida, con un valor inválido o con lectura bloqueada
// When se ejecuta el bootstrap y el sistema cambia entre claro y oscuro
// Then el tema inicial y los cambios posteriores siguen al sistema
// And no se escribe una elección manual ni se modifican claves ajenas
// And cada entrada a dark pinta la superficie global y publica theme-color como #050b1a
// And al volver a light recupera su superficie y theme-color #F9F9F9 sin cambios
//
// Scenario: Una consulta de sistema inutilizable permite fallback claro
// Given ninguna elección guardada válida y matchMedia ausente, fallido o sin matches booleano
// When se ejecuta el bootstrap y luego se alterna manualmente
// Then comienza en claro y puede alternarse a oscuro sin error
//
// Scenario: Una consulta sin suscripción todavía resuelve el tema inicial
// Given ninguna elección guardada y una consulta oscura válida sin addEventListener
// When se ejecuta el bootstrap
// Then se aplica oscuro y se publica el controlador sin exigir suscripción a cambios
//
// Scenario: Alternar persiste y deja de seguir al sistema
// Given un tema inicialmente resuelto por el sistema y storage disponible
// When se alterna, llega un cambio de sistema y se carga de nuevo el bootstrap en otro documento
// Then la alternancia aplica y guarda el tema opuesto sin que el cambio de sistema lo reemplace
// And la nueva carga recupera la elección guardada
// And dark conserva la superficie global y theme-color #050b1a tras alternar y recargar
// And volver a alternar a light recupera sus colores originales
//
// Scenario: Una escritura rechazada conserva la elección manual en memoria
// Given un tema resuelto por el sistema y storage que rechaza escrituras
// When se alterna y después llega un cambio del sistema incluso previamente encolado
// Then la elección manual permanece aplicada y se puede volver a alternar sin error
//
// Scenario: Suscripción y baja reflejan los cambios efectivos del tema
// Given un consumidor suscrito al controlador de tema
// When cambia el sistema, se alterna y luego se da de baja antes de otra alternancia
// Then recibe los temas aplicados mientras está suscrito y ninguno después de la baja
// And repetir la baja no afecta a otros consumidores
//
// Scenario: Reiniciar el bootstrap conserva el controlador y sus consumidores
// Given un bootstrap ejecutado con elección manual y un consumidor suscrito
// When se ejecuta de nuevo y se alterna mediante el controlador existente
// Then se conserva la elección hasta la alternancia y el consumidor recibe un solo cambio
//
// Scenario: El consumidor del dock conserva el estado accesible y el foco
// Given el bootstrap listo y el control de tema inicializado mediante initThemeSwitcher
// When se enfoca y activa el botón
// Then alterna una sola vez y aria-pressed refleja el tema oscuro sin perder el foco
// And se conservan las clases ajenas al tema, incluida has-window
//
// Scenario: El bootstrap inline aplica el tema sin esperar al bundle
// Given un documento cuyo head contiene theme-color y el bootstrap antes del contenido visible
// And una elección guardada opuesta al sistema y ningún dock ni bundle inicializado
// When se ejecuta ese script inline durante la carga
// Then el tema y sus metadatos están resueltos sin esperar al bundle ni a una petición externa
// And el controlador queda disponible para los callers posteriores
// And dark publica theme-color #050b1a y mantiene clase dark y color-scheme dark sincronizados
//
// Scenario: El tema dark pinta la superficie global con el nuevo fondo
// Given la página con sus estilos reales y el tema dark seleccionado
// When se pinta el fondo global del documento
// Then su color de fondo es #050b1a (rgb 5 11 26)
// And --app-surface resuelve a 5 11 26 sin sustituir imágenes de fondo ni sombras
//
// Scenario: El tema light y los demás roles conservan sus colores
// Given los valores vigentes de light y los roles distintos de la superficie global dark
// When se aplica light y después dark con los estilos reales
// Then light conserva su superficie #F9F9F9 y su theme-color #F9F9F9
// And los roles de texto, bordes, acentos y elevación conservan sus valores en cada tema
// And imágenes de fondo y sombras permanecen intactas en ambos temas
//
// Alcance: contratos de las cuatro funciones y del fondo global dark; el footer no se modifica.
// Harness: seguir project-showcase.test.ts (DOM jsdom, matchMedia controlado, restauración
// con afterEach/vi.restoreAllMocks); usar las entradas públicas, no exponer helpers privados.
// Aislar documentos/listeners de case-window y bootstrap, y estado de módulo de hero entre casos.
// Evidencia: openspec/changes/hero-emoji-burst/evidence/functional-evidence.md y
// openspec/specs/theme-preference/spec.md. La evidencia histórica de trayectoria/duración
// de hero precede ajustes actuales: no fijar aquel ascenso ni sus tiempos como contrato nuevo.
// Límites jsdom: no calcula offsetParent ni navega con Tab nativo; proveer visibilidad
// controlada y verificar foco/defaultPrevented. Foco externo significa evento en la ventana,
// no añadir un listener global que hoy no existe. La salida animada usa reloj controlado.
// WAAPI: un doble controlable permite verificar nodos, finalización/cancelación y límites
// de parámetros, no prueba interpolación visual, clipping ni overflow real del viewport.
// Geometría inválida aquí significa ancho/alto cero, no validación nueva de NaN o negativos.
// Primer pintado: ejecutar el bootstrap real como script clásico inline en un documento
// aislado comprueba su independencia del bundle; no afirmar que jsdom detecta un flash.
// El orden real del head, ausencia de flash, layout, Tab nativo y activación nativa de
// botones requieren navegador/Astro renderizado; no sustituirlos por asserts de texto fuente.
// Fondo y roles: comprobar estilos reales resueltos, no coincidencias de texto fuente.
// Si jsdom no resuelve la cascada o variables CSS, usar navegador en la etapa tdd.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import bootstrapSource from './theme-switcher/bootstrap.js?raw';
import { initCaseWindow } from './case-window/init';
import { initProjectShowcase } from './projects/init';
import { initThemeSwitcher } from './theme-switcher/init';
import type { ThemeController } from './theme-switcher/types';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HOVER_QUERY = '(hover: hover)';

let cleanups: (() => void)[] = [];
let originalMatchMedia: typeof window.matchMedia;
let originalOffsetParent: PropertyDescriptor | undefined;
let originalInnerWidth: PropertyDescriptor | undefined;

/* ------------------------------------------------------------------ */
/* matchMedia controlable: jsdom no lo implementa                     */
/* ------------------------------------------------------------------ */

type MediaQueryStub = {
  matches: boolean;
  media: string;
  addEventListener(type: string, listener: (event: { matches: boolean }) => void): void;
  removeEventListener(type: string, listener: (event: { matches: boolean }) => void): void;
};

type MatchMediaControl = {
  query(media: string): MediaQueryStub;
  change(media: string, matches: boolean): void;
  /** Suscriptores vivos de una consulta: delata suscripciones duplicadas. */
  listenerCount(media: string): number;
};

function installMatchMedia(initial: Record<string, boolean> = {}): MatchMediaControl {
  const registered = new Map<
    string,
    { query: MediaQueryStub; listeners: Set<(event: { matches: boolean }) => void> }
  >();
  const query = (media: string): MediaQueryStub => {
    let entry = registered.get(media);
    if (!entry) {
      const listeners = new Set<(event: { matches: boolean }) => void>();
      entry = {
        listeners,
        query: {
          matches: initial[media] ?? false,
          media,
          addEventListener(type, listener) {
            if (type === 'change') listeners.add(listener);
          },
          removeEventListener(type, listener) {
            if (type === 'change') listeners.delete(listener);
          }
        }
      };
      registered.set(media, entry);
    }
    return entry.query;
  };

  window.matchMedia = ((media: string) => query(media)) as unknown as typeof window.matchMedia;

  return {
    query,
    change(media, matches) {
      const entry = registered.get(media);
      if (!entry) return;
      entry.query.matches = matches;
      entry.listeners.forEach((listener) => listener({ matches }));
    },
    listenerCount(media) {
      return registered.get(media)?.listeners.size ?? 0;
    }
  };
}

/* ------------------------------------------------------------------ */
/* Ventana de caso: focus trap y cierre                                */
/* ------------------------------------------------------------------ */

type CaseFixture = { slug: string; controls?: string };

type CaseHandles = {
  win: HTMLElement;
  winBody: HTMLElement;
  scrim: HTMLElement;
  close: HTMLButtonElement;
  dockLink: HTMLAnchorElement;
  caseLink: HTMLAnchorElement;
};

const CONTROL_ONE = '<button id="control-uno" type="button">Uno</button>';
const CONTROL_TWO =
  '<button id="control-uno" type="button">Uno</button><button id="control-dos" type="button">Dos</button>';
/** El primer control no tiene caja de layout: jsdom expone `offsetParent` por atributo. */
const CONTROL_WITHOUT_LAYOUT =
  '<button id="control-sin-layout" type="button" data-no-layout>Tercero</button>' + CONTROL_TWO;

/**
 * Marca el cascarón real de la ventana sin inicializarla: `hash` fija la ruta de entrada y
 * `omit` retira piezas del marcado para probar documentos incompletos.
 */
function renderCaseShell(
  templates: readonly CaseFixture[],
  options: { hash?: string; reducedMotion?: boolean; omit?: readonly string[] } = {}
): CaseHandles {
  installMatchMedia({ [REDUCED_MOTION_QUERY]: options.reducedMotion ?? false });
  document.body.innerHTML = `
    <a class="dock__item" data-section="trabajo" href="#trabajo">Trabajo</a>
    <a class="dock__case" href="#/caso/${templates[0].slug}">Ver caso</a>
    <section class="window" id="window" role="dialog" aria-modal="true" aria-labelledby="windowTitle" tabindex="-1" hidden>
      <header class="window__head">
        <h2 class="window__title" id="windowTitle" tabindex="-1">Trabajo</h2>
        <button class="window__close" id="windowClose" type="button" aria-label="Cerrar ventana">Cerrar</button>
      </header>
      <div class="window__body" id="windowBody"></div>
    </section>
    <div class="scrim" id="scrim" hidden></div>
    ${templates
      .map(
        ({ slug, controls }) =>
          `<template data-case-template="${slug}"><article class="case">${controls ?? ''}</article></template>`
      )
      .join('')}
  `;
  (options.omit ?? []).forEach((id) => document.getElementById(id)?.remove());
  history.replaceState(null, '', options.hash ?? '/');
  return {
    win: document.getElementById('window') as HTMLElement,
    winBody: document.getElementById('windowBody') as HTMLElement,
    scrim: document.getElementById('scrim') as HTMLElement,
    close: document.getElementById('windowClose') as HTMLButtonElement,
    dockLink: document.querySelector<HTMLAnchorElement>('.dock__item[data-section="trabajo"]') as HTMLAnchorElement,
    caseLink: document.querySelector<HTMLAnchorElement>('.dock__case') as HTMLAnchorElement
  };
}

/** Monta el cascarón y lo inicializa abriendo la ruta indicada. */
function mountCaseWindow(
  templates: readonly CaseFixture[],
  options: { open?: string; reducedMotion?: boolean } = {}
): CaseHandles {
  const handles = renderCaseShell(templates, {
    reducedMotion: options.reducedMotion,
    hash: options.open ? `/#/caso/${options.open}` : '/'
  });
  initCaseWindow();
  return handles;
}

/** Pulsación de tecla; devuelve el evento para leer `defaultPrevented`. */
function pressKey(
  target: EventTarget,
  key: string,
  options: { shiftKey?: boolean; repeat?: boolean } = {}
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey: options.shiftKey ?? false,
    repeat: options.repeat ?? false,
    bubbles: true,
    cancelable: true
  });
  target.dispatchEvent(event);
  return event;
}

/**
 * Click sobre el enlace de caso: fija el origen de la ventana sin navegar, porque jsdom
 * encola la navegación del enlace y la ejecutaría al avanzar el reloj controlado.
 */
function clickCaseLink(link: HTMLAnchorElement): void {
  link.addEventListener('click', (event) => event.preventDefault(), { capture: true, once: true });
  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

/* ------------------------------------------------------------------ */
/* Showcase de proyectos                                               */
/* ------------------------------------------------------------------ */

type ProjectFixture = {
  slug: string;
  name: string;
  full: string;
  desc: string;
  image: string;
  tags: string[];
  w: number;
  h: number;
};

const PROJECTS: ProjectFixture[] = [
  {
    slug: 'alpha',
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
    name: 'Gamma',
    full: 'Gamma — Tercer proyecto',
    desc: 'Descripción del proyecto Gamma.',
    image: '/assets/gamma.webp',
    tags: ['Producto'],
    w: 900,
    h: 450
  }
];

const SHOWCASE_PARTS = {
  image: '[data-project-image]',
  title: '[data-project-title]',
  description: '[data-project-description]',
  tags: '[data-project-tags]',
  media: '[data-project-media]'
} as const;

const SHOWCASE_MARKUP = `
  <div data-project-showcase>
    <div data-project-panel aria-live="polite" aria-atomic="true">
      <p data-project-tags>${PROJECTS[0].tags.join(' · ')}</p>
      <h2 data-project-title>${PROJECTS[0].full}</h2>
      <p data-project-description>${PROJECTS[0].desc}</p>
      <div data-project-media>
        <img data-project-image src="${PROJECTS[0].image}" alt="${PROJECTS[0].full}" width="${PROJECTS[0].w}" height="${PROJECTS[0].h}">
      </div>
    </div>
    <div class="project-showcase__selectors" role="group" aria-label="Seleccionar proyecto">
      ${PROJECTS.map(
        (project, index) => `
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
      `
      ).join('')}
    </div>
  </div>
`;

function renderShowcase(): HTMLElement {
  document.body.innerHTML = SHOWCASE_MARKUP;
  return document.querySelector<HTMLElement>('[data-project-showcase]')!;
}

function triggersOf(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('[data-project-trigger]'));
}

type ShowcaseSnapshot = {
  image: string | null;
  alt: string | null;
  title: string | null;
  description: string | null;
  tags: string | null;
  pressed: (string | null)[];
  active: string | null;
  transitioning: boolean;
};

/** Texto de una parte del panel, o `null` si el markup no la trae. */
function panelText(root: HTMLElement, selector: string): string | null {
  return root.querySelector(selector)?.textContent ?? null;
}

/** Estado observable completo del showcase, tolerante a markup incompleto. */
function snapshotShowcase(root: HTMLElement): ShowcaseSnapshot {
  const image = root.querySelector<HTMLImageElement>('[data-project-image]');
  return {
    image: image?.getAttribute('src') ?? null,
    alt: image?.getAttribute('alt') ?? null,
    title: panelText(root, '[data-project-title]'),
    description: panelText(root, '[data-project-description]'),
    tags: panelText(root, '[data-project-tags]'),
    pressed: triggersOf(root).map((trigger) => trigger.getAttribute('aria-pressed')),
    active: root.getAttribute('data-active-project'),
    transitioning: root.hasAttribute('data-project-transitioning')
  };
}

/** Proyecto activo tal como lo observa el visitante: imagen, alt, textos y selección. */
function expectActiveProject(root: HTMLElement, index: number): void {
  const project = PROJECTS[index];
  const image = root.querySelector<HTMLImageElement>('[data-project-image]')!;
  const triggers = triggersOf(root);
  expect(image.getAttribute('src')).toBe(project.image);
  expect(image.alt).toBe(project.full);
  expect(root.querySelector('[data-project-title]')!.textContent).toBe(project.full);
  expect(root.querySelector('[data-project-description]')!.textContent).toBe(project.desc);
  expect(root.querySelector('[data-project-tags]')!.textContent).toBe(project.tags.join(' · '));
  expect(triggers.filter((trigger) => trigger.getAttribute('aria-pressed') === 'true')).toEqual([triggers[index]]);
  expect(root.dataset.activeProject).toBe(String(index));
}

/* ------------------------------------------------------------------ */
/* Ráfaga del retrato del Hero                                         */
/* ------------------------------------------------------------------ */

type AnimateCall = {
  node: HTMLElement;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  finished: Promise<void>;
  cancel: Mock;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
  /** Dispara el evento `finish` como haría el motor al completar la animación. */
  fireFinish(): void;
  /** Rechaza `finished` como hace el motor al cancelar, sin manejarlo por su cuenta. */
  fail(): void;
};

type PortraitHarness = {
  portrait: HTMLElement;
  trigger: HTMLButtonElement;
  layer: HTMLElement;
  media: MatchMediaControl;
  animations: FakeAnimation[];
  animateCalls: AnimateCall[];
  particles(): HTMLElement[];
  setGeometry(width: number, height: number, left?: number): void;
  setViewport(width: number): void;
};

const PARTICLE_TRANSLATE = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/;

let fakeAnimations: FakeAnimation[] = [];
let animateCalls: AnimateCall[] = [];

function createFakeAnimation(keyframes: Keyframe[], options: KeyframeAnimationOptions): FakeAnimation {
  const listeners = new Set<() => void>();
  const { promise, reject } = Promise.withResolvers<void>();
  return {
    keyframes,
    options,
    finished: promise,
    cancel: vi.fn(),
    addEventListener(type, listener) {
      if (type === 'finish') listeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === 'finish') listeners.delete(listener);
    },
    fireFinish() {
      listeners.forEach((listener) => listener());
      listeners.clear();
    },
    fail() {
      reject(new Error('animación cancelada'));
    }
  };
}

function installAnimateDouble(): void {
  (Element.prototype as unknown as { animate: unknown }).animate = function (
    this: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ) {
    const animation = createFakeAnimation(keyframes, options);
    animateCalls.push({ node: this, keyframes, options });
    fakeAnimations.push(animation);
    return animation;
  };
}

/** Monta el marcado real del retrato y lo inicializa con estado de módulo aislado. */
async function mountPortrait({
  reducedMotion = false,
  hover = false,
  width = 120,
  height = 120,
  left = 200,
  viewport = 1280,
  initTwice = false
}: {
  reducedMotion?: boolean;
  hover?: boolean;
  width?: number;
  height?: number;
  left?: number;
  viewport?: number;
  initTwice?: boolean;
} = {}): Promise<PortraitHarness> {
  const media = installMatchMedia({
    [REDUCED_MOTION_QUERY]: reducedMotion,
    [HOVER_QUERY]: hover
  });
  // Cada montaje arranca con contadores propios: una ráfaga previa del mismo caso no cuenta.
  fakeAnimations = [];
  animateCalls = [];
  document.body.innerHTML = `
    <div class="hero-portrait" data-hero-portrait>
      <span class="hero-portrait__layer" data-hero-emoji-layer aria-hidden="true"></span>
      <button
        class="hero-portrait__trigger"
        type="button"
        data-hero-portrait-trigger
        aria-label="Mostrar emojis sobre la fotografía de Héctor Reyes"
      >
        <img
          class="hero-portrait__image"
          src="/assets/branding/hector-reyes.png"
          alt="Fotografía de Héctor Reyes"
          width="500"
          height="500"
        >
      </button>
    </div>
  `;
  const portrait = document.querySelector<HTMLElement>('[data-hero-portrait]')!;
  const trigger = portrait.querySelector<HTMLButtonElement>('[data-hero-portrait-trigger]')!;
  const layer = portrait.querySelector<HTMLElement>('[data-hero-emoji-layer]')!;

  const geometry = vi.spyOn(layer, 'getBoundingClientRect');
  const setGeometry = (boxWidth: number, boxHeight: number, boxLeft = left): void => {
    geometry.mockReturnValue({
      width: boxWidth,
      height: boxHeight,
      left: boxLeft,
      top: 0,
      right: boxLeft + boxWidth,
      bottom: boxHeight,
      x: boxLeft,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);
  };
  setGeometry(width, height);
  const setViewport = (innerWidth: number): void => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidth });
  };
  setViewport(viewport);

  // El estado del módulo (retratos inicializados, ráfagas vivas y suscripción a movimiento
  // reducido) vive a nivel de módulo: solo un import dinámico por caso lo aísla.
  vi.resetModules();
  const module = await import('@lib/core/hero-emoji-burst');
  module.initHeroEmojiBurst();
  if (initTwice) module.initHeroEmojiBurst();

  return {
    portrait,
    trigger,
    layer,
    media,
    animations: fakeAnimations,
    animateCalls,
    particles: () => Array.from(layer.querySelectorAll<HTMLElement>('.hero-portrait__particle')),
    setGeometry,
    setViewport
  };
}

/** Entrada de puntero del mouse sobre el retrato. */
function hoverPortrait(trigger: HTMLButtonElement): void {
  trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType: 'mouse' }));
}

/** Activación por puntero (mouse/touch) o por teclado y tecnología asistiva (`detail` 0). */
function activatePortrait(trigger: HTMLButtonElement, pointerType: string, detail: number): void {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  trigger.dispatchEvent(event);
}

/**
 * Desplazamiento lateral observable de una partícula: su centro final menos el centro
 * horizontal de la capa. Los dos términos se leen del nodo y de sus keyframes.
 */
function lateralTravel(call: AnimateCall, layerWidth: number): number {
  const finalTransform = String(call.keyframes[call.keyframes.length - 1]?.transform ?? '');
  const translate = PARTICLE_TRANSLATE.exec(finalTransform);
  const originX = Number.parseFloat(call.node.style.left);
  const burstX = translate ? Number.parseFloat(translate[1]) : Number.NaN;
  return originX - layerWidth / 2 + burstX;
}

/* ------------------------------------------------------------------ */
/* Bootstrap y controlador de tema                                     */
/* ------------------------------------------------------------------ */

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Escrituras intentadas, exitosas o no. */
  attempts: string[];
  entries(): [string, string][];
};

type SystemQuery = {
  matches: boolean;
  media: string;
  /** Suscriptores activos en este momento. */
  listeners: number;
  /** Cambio del sistema entregado a quien esté suscrito. */
  change(matches: boolean): void;
  /** Evento ya despachado por el navegador antes de la baja, entregado después. */
  deliverQueued(matches: boolean): void;
  addEventListener?(type: string, listener: (event: { matches: boolean }) => void): void;
  removeEventListener?(type: string, listener: (event: { matches: boolean }) => void): void;
};

type ThemeGlobal = {
  __portfolioTheme?: ThemeController;
  localStorage: Pick<StorageLike, 'getItem' | 'setItem' | 'removeItem'>;
  matchMedia?: (query: string) => unknown;
};

function createStorage(
  initial: Record<string, string> = {},
  options: { readsThrow?: boolean; writesThrow?: boolean } = {}
): StorageLike {
  const data = new Map(Object.entries(initial));
  const attempts: string[] = [];
  return {
    getItem(key) {
      if (options.readsThrow) throw new Error('storage bloqueado');
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      attempts.push(key);
      if (options.writesThrow) throw new Error('cuota excedida');
      data.set(key, value);
    },
    removeItem(key) {
      attempts.push(key);
      data.delete(key);
    },
    attempts,
    entries: () => [...data.entries()]
  };
}

function createSystemQuery(options: { matches?: boolean; subscribable?: boolean } = {}): SystemQuery {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const everRegistered: ((event: { matches: boolean }) => void)[] = [];
  const query: SystemQuery = {
    matches: options.matches ?? false,
    media: '(prefers-color-scheme: dark)',
    get listeners() {
      return listeners.size;
    },
    change(matches) {
      query.matches = matches;
      listeners.forEach((listener) => listener({ matches }));
    },
    deliverQueued(matches) {
      query.matches = matches;
      everRegistered.forEach((listener) => listener({ matches }));
    }
  };
  if (options.subscribable ?? true) {
    query.addEventListener = (type, listener) => {
      if (type !== 'change') return;
      listeners.add(listener);
      everRegistered.push(listener);
    };
    query.removeEventListener = (type, listener) => {
      if (type === 'change') listeners.delete(listener);
    };
  }
  return query;
}

/** Consultas del sistema rotas de las que el bootstrap tiene que salir por su cuenta. */
const BROKEN_SYSTEM_QUERIES: Record<'absent' | 'throwing' | 'booleanless', ThemeGlobal['matchMedia']> = {
  absent: undefined,
  throwing: () => {
    throw new Error('matchMedia roto');
  },
  booleanless: () => ({ matches: 'dark', media: '(prefers-color-scheme: dark)' })
};

/** `Window` simulada del bootstrap: storage y consulta del sistema inyectables. */
function createThemeWindow(
  options: { storage?: StorageLike; system?: SystemQuery | keyof typeof BROKEN_SYSTEM_QUERIES } = {}
): ThemeGlobal {
  const target: ThemeGlobal = { localStorage: options.storage ?? createStorage() };
  const system = options.system;
  if (system === undefined) return target;
  if (typeof system === 'string') {
    target.matchMedia = BROKEN_SYSTEM_QUERIES[system];
    return target;
  }
  // Como el navegador: solo la consulta que se pregunta responde; otra cadena no coincide.
  target.matchMedia = (media: string) =>
    media === system.media ? system : { matches: false, media, addEventListener() {}, removeEventListener() {} };
  return target;
}

/**
 * Documento aislado con el orden real del head: `theme-color` antes del contenido pintable,
 * sin dock ni bundle, para comprobar el arranque temprano sin depender de ellos.
 */
function createInlineDocument(): Document {
  const doc = document.implementation.createHTMLDocument('inline');
  doc.head.innerHTML = '<meta name="theme-color" content="#F9F9F9">';
  doc.body.innerHTML = '<main>Contenido pintable</main>';
  return doc;
}

/**
 * Ejecuta el bootstrap real como script clásico con `window` y `document` inyectados:
 * la fuente no se modifica y no hay imports, bundle ni petición externa de por medio.
 */
function runInlineBootstrap(targetWindow: ThemeGlobal, targetDocument: Document): void {
  new Function('window', 'document', bootstrapSource)(targetWindow, targetDocument);
}

/** Estado observable del tema en un documento: clase, color-scheme y theme-color. */
function themeState(doc: Document): { theme: string; scheme: string; themeColor: string | null } {
  const root = doc.documentElement;
  const theme = root.classList.contains('dark') ? 'dark' : root.classList.contains('light') ? 'light' : 'ninguno';
  return {
    theme,
    scheme: root.style.colorScheme,
    themeColor: doc.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null
  };
}

/* ------------------------------------------------------------------ */
/* Estilos reales del tema                                             */
/* ------------------------------------------------------------------ */

type Theme = 'light' | 'dark';

type Declarations = Map<string, string>;

// Bajo jsdom, `import.meta.url` no vale como base de URL: se normaliza a string antes de
// convertirlo en ruta.
const STYLES_DIR = join(dirname(fileURLToPath(`${import.meta.url}`)), '../styles');
/** Orden real de `global.css`: el tema claro primero y el oscuro después, que lo sustituye. */
const THEME_STYLESHEETS = [join(STYLES_DIR, 'themes/light.css'), join(STYLES_DIR, 'themes/dark.css')];
const PAGE_STYLESHEET = join(STYLES_DIR, 'global.css');
const FOOTER_STYLESHEET = join(STYLES_DIR, 'portfolio/footer-cta.css');

/**
 * Reglas de una hoja real, atravesando `@layer`, tal como las parsea el CSSOM.
 *
 * jsdom no resuelve variables CSS y `getComputedStyle` no ve los tokens de `@layer`, así que
 * los escenarios de color leen las hojas reales con su propio parser y resuelven aquí los
 * `var()` con los tokens que la cascada declaró. Lo comparado es el valor resuelto, nunca el
 * texto del archivo.
 */
function stylesheetRules(file: string): CSSStyleRule[] {
  const style = document.createElement('style');
  style.textContent = readFileSync(file, 'utf8');
  document.head.append(style);
  try {
    const sheet = style.sheet;
    if (!sheet) throw new Error(`El CSSOM no pudo leer ${file}`);
    return flattenRules(sheet.cssRules);
  } finally {
    style.remove();
  }
}

function flattenRules(rules: ArrayLike<CSSRule>, collected: CSSStyleRule[] = []): CSSStyleRule[] {
  for (const rule of Array.from(rules)) {
    // El selector se comprueba primero: `CSSStyleRule` también expone `cssRules` (reglas
    // anidadas), así que mirar los bloques agrupadores antes perdería las reglas de estilo.
    if ('selectorText' in rule) collected.push(rule as CSSStyleRule);
    else if ('cssRules' in rule) flattenRules((rule as CSSGroupingRule).cssRules, collected);
  }
  return collected;
}

function collectDeclarations(style: CSSStyleDeclaration, into: Declarations): void {
  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    into.set(property, style.getPropertyValue(property).trim());
  }
}

/** Reglas de las hojas reales cuyo selector alcanza al tema, en orden de cascada. */
function themedRules(stylesheets: readonly string[], reaches: (selector: string) => boolean): CSSStyleRule[] {
  const collected: CSSStyleRule[] = [];
  stylesheets.forEach((file) => {
    stylesheetRules(file).forEach((rule) => {
      if (rule.selectorText.split(',').some((part) => reaches(part.trim()))) collected.push(rule);
    });
  });
  return collected;
}

/** Sustituye cada `var(--token)` por lo que la cascada resolvió en ese tema. */
function resolveVariables(value: string, tokens: Declarations): string {
  let resolved = value;
  // Los tokens reales encadenan como máximo un alias; cinco pasadas sobran y acotan el bucle.
  for (let pass = 0; pass < 5; pass += 1) {
    if (!resolved.includes('var(')) break;
    const next = resolved.replace(/var\(\s*(--[\w-]+)\s*\)/g, (token, name: string) => tokens.get(name) ?? token);
    if (next === resolved) break;
    resolved = next;
  }
  return resolved;
}

/** Tokens que la cascada real declara para la raíz en un tema. */
function themeTokens(theme: Theme): Declarations {
  const tokens: Declarations = new Map();
  // `:root` vale en ambos temas; la clase del tema solo en el suyo y gana por ir después.
  themedRules(THEME_STYLESHEETS, (selector) => selector === ':root' || selector === `:root.${theme}`).forEach((rule) =>
    collectDeclarations(rule.style, tokens)
  );
  return tokens;
}

/** Declaraciones que las hojas reales aplican a un selector en un tema, con `var()` resuelto. */
function elementDeclarations(stylesheets: readonly string[], selector: string, theme: Theme): Declarations {
  const tokens = themeTokens(theme);
  const declared: Declarations = new Map();
  themedRules(stylesheets, (candidate) => candidate === selector || candidate === `:root.${theme} ${selector}`).forEach(
    (rule) => collectDeclarations(rule.style, declared)
  );
  return new Map([...declared].map(([property, value]) => [property, resolveVariables(value, tokens)]));
}

/** Canales del color opaco resuelto: `#rrggbb`, `rgb(r g b)` o `rgb(r, g, b)`. */
function opaqueChannels(value: string): number[] | null {
  const color = value.trim();
  const hex = /^#([\da-f]{6})$/i.exec(color);
  if (hex) return [0, 2, 4].map((start) => Number.parseInt(hex[1].slice(start, start + 2), 16));
  const rgb = /^rgb\(([^)]+)\)$/i.exec(color);
  const channels = rgb ? rgb[1].trim().split(/[\s,]+/) : [];
  return channels.length === 3 && channels.every((channel) => /^\d+$/.test(channel))
    ? channels.map(Number)
    : null;
}

/** Capas de un valor de fondo: separa por las comas de primer nivel, no por las internas. */
function backgroundLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let layer = '';
  for (const character of value) {
    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      layers.push(layer.trim());
      layer = '';
      continue;
    }
    layer += character;
  }
  layers.push(layer.trim());
  return layers;
}

/** Roles cromáticos y sombras que el fondo dark nuevo no debe tocar, por tema. */
const THEME_VALUES: Record<Theme, Record<string, string>> = {
  light: {
    '--app-elevated': '255 255 255',
    '--app-text': '32 32 32',
    '--app-muted': '100 100 100',
    '--app-text-body': '79 79 79',
    '--app-accent': '0 116 127',
    '--app-accent-ink': '0 116 127',
    '--app-accent-soft': '230 243 244',
    '--app-border': '234 235 238',
    '--app-shadow-card': '0 0 0 4px rgba(82, 88, 112, 0.03), 0 4px 12px 0 rgba(82, 88, 112, 0.02)',
    '--app-shadow-window': '0 24px 64px rgba(32, 32, 32, 0.16), 0 2px 8px rgba(32, 32, 32, 0.06)'
  },
  dark: {
    '--app-elevated': '15 23 42',
    '--app-text': '226 232 240',
    '--app-muted': '148 163 184',
    '--app-text-body': '203 213 225',
    '--app-accent': '34 211 238',
    '--app-accent-ink': '34 211 238',
    '--app-accent-soft': '18 51 63',
    '--app-border': '51 65 85',
    '--app-shadow-card': '0 0 0 4px rgba(2, 6, 23, 0.5), 0 4px 12px 0 rgba(2, 6, 23, 0.5)',
    '--app-shadow-window': '0 24px 64px rgba(2, 6, 23, 0.7), 0 2px 8px rgba(2, 6, 23, 0.5)'
  }
};

/** Cada rol conserva su valor declarado en ese tema: un rol ausente no pasa. jsdom serializa
 * los colores sin espacios, así que la comparación los ignora. */
function expectThemeValues(theme: Theme): void {
  const tokens = themeTokens(theme);
  Object.entries(THEME_VALUES[theme]).forEach(([role, value]) => {
    expect(tokens.get(role)?.replace(/\s+/g, ''), `${theme} ${role}`).toBe(value.replace(/\s+/g, ''));
  });
}

/** `theme-color` que el bootstrap real publica cuando el tema vigente es ese. */
function publishedThemeColor(theme: Theme): string | null {
  const win = createThemeWindow({
    storage: createStorage({ theme }),
    system: createSystemQuery({ matches: false })
  });
  const doc = createInlineDocument();
  runInlineBootstrap(win, doc);
  return themeState(doc).themeColor;
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
  originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  fakeAnimations = [];
  animateCalls = [];
  installMatchMedia({ [REDUCED_MOTION_QUERY]: false, [HOVER_QUERY]: false });
  installAnimateDouble();
  // jsdom no calcula layout: una caja existe salvo en los nodos marcados sin layout.
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.hasAttribute('data-no-layout') || this.closest('[hidden]')) return null;
      return this.parentElement;
    }
  });
});

afterEach(() => {
  // Cierra cualquier caso abierto antes de desmontar para no dejar listeners activos.
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
  if (originalOffsetParent) Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
  if (originalInnerWidth) Object.defineProperty(window, 'innerWidth', originalInnerWidth);
  delete (Element.prototype as unknown as { animate?: unknown }).animate;
  window.matchMedia = originalMatchMedia;
  delete window.__portfolioTheme;
  document.documentElement.className = '';
  document.documentElement.removeAttribute('style');
  document.querySelector('meta[name="theme-color"]')?.remove();
  window.localStorage.clear();
  document.body.innerHTML = '';
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

describe('Contratos observables del refactor de complejidad', () => {
  /* ---------------------------------------------------------------- */
  /* Ventana de caso                                                   */
  /* ---------------------------------------------------------------- */

  // Scenario: Tab desde el último control vuelve al primero
  it('Tab desde el último control vuelve al primero', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    const last = document.getElementById('control-uno') as HTMLButtonElement;
    last.focus();

    const event = pressKey(last, 'Tab');

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(handles.close);
  });

  // Scenario: Shift Tab desde el primer control vuelve al último
  it('Shift Tab desde el primer control vuelve al último', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    const last = document.getElementById('control-uno') as HTMLButtonElement;
    handles.close.focus();

    const event = pressKey(handles.close, 'Tab', { shiftKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  // Scenario: El foco ajeno a los controles se reconduce según la dirección
  it('El foco ajeno a los controles se reconduce según la dirección', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    const title = document.getElementById('windowTitle') as HTMLElement;
    const last = document.getElementById('control-uno') as HTMLButtonElement;

    title.focus();
    const forward = pressKey(handles.win, 'Tab');
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(handles.close);

    title.focus();
    const backward = pressKey(handles.win, 'Tab', { shiftKey: true });
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);

    // El foco fuera de la ventana se reconduce igual, sin capturar eventos fuera de ella.
    handles.dockLink.focus();
    const outside = pressKey(handles.win, 'Tab');
    expect(outside.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(handles.close);
  });

  // Scenario: La navegación interior y las otras teclas no se interceptan
  it('La navegación interior y las otras teclas no se interceptan', () => {
    mountCaseWindow([{ slug: 'alpha', controls: CONTROL_TWO }], { open: 'alpha' });
    const inner = document.getElementById('control-uno') as HTMLButtonElement;
    inner.focus();

    const forward = pressKey(inner, 'Tab');
    expect(forward.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(inner);

    const backward = pressKey(inner, 'Tab', { shiftKey: true });
    expect(backward.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(inner);

    const other = pressKey(inner, 'ArrowRight');
    expect(other.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(inner);
  });

  // Scenario: El trap conserva los casos sin controles y con un único control
  it('El trap conserva los casos sin controles y con un único control', () => {
    // Sin controles elegibles no se cancela ni se mueve el foco.
    const empty = mountCaseWindow([{ slug: 'alpha', controls: '<p>Solo texto</p>' }], { open: 'alpha' });
    empty.close.disabled = true;
    const title = document.getElementById('windowTitle') as HTMLElement;
    title.focus();

    const ignored = pressKey(empty.win, 'Tab');
    expect(ignored.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(title);

    // Un único control elegible: el evento se cancela y el foco se conserva.
    const single = mountCaseWindow([{ slug: 'beta', controls: CONTROL_ONE }], { open: 'beta' });
    single.close.disabled = true;
    const only = document.getElementById('control-uno') as HTMLButtonElement;
    only.focus();

    const kept = pressKey(only, 'Tab', { shiftKey: true });
    expect(kept.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(only);

    // Un control sin caja de layout se excluye, salvo si ya tiene el foco.
    const mixed = mountCaseWindow([{ slug: 'gamma', controls: CONTROL_WITHOUT_LAYOUT }], { open: 'gamma' });
    mixed.close.disabled = true;
    const withoutLayout = document.getElementById('control-sin-layout') as HTMLButtonElement;
    const first = document.getElementById('control-uno') as HTMLButtonElement;
    const last = document.getElementById('control-dos') as HTMLButtonElement;

    last.focus();
    pressKey(last, 'Tab');
    expect(document.activeElement).toBe(first);

    withoutLayout.focus();
    pressKey(withoutLayout, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  // Scenario: Cerrar el caso restaura el foco sin alterar la preferencia de movimiento
  it('Cerrar el caso restaura el foco sin alterar la preferencia de movimiento', () => {
    vi.useFakeTimers();
    try {
      // Salida normal: la ventana se oculta al terminar la transición de 220 ms.
      const normal = mountCaseWindow([{ slug: 'alpha', controls: '<p>Contenido</p>' }], { open: 'alpha' });
      clickCaseLink(normal.caseLink);
      document.documentElement.classList.add('dark');
      expect(normal.win.hidden).toBe(false);

      pressKey(document, 'Escape');

      expect(document.activeElement).toBe(normal.caseLink);
      expect(location.hash).toBe('');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(normal.win.hidden).toBe(false);
      vi.advanceTimersByTime(219);
      expect(normal.win.hidden).toBe(false);
      vi.advanceTimersByTime(1);
      expect(normal.win.hidden).toBe(true);
      expect(normal.scrim.hidden).toBe(true);

      // Movimiento reducido: se oculta sin esperar la transición.
      const reduced = mountCaseWindow([{ slug: 'beta', controls: '<p>Contenido</p>' }], {
        open: 'beta',
        reducedMotion: true
      });
      document.documentElement.classList.add('dark');
      pressKey(document, 'Escape');
      expect(reduced.win.hidden).toBe(false);
      vi.advanceTimersByTime(0);
      expect(reduced.win.hidden).toBe(true);
      expect(reduced.scrim.hidden).toBe(true);

      // Si el enlace de origen ya no existe, el foco vuelve al enlace de trabajo del dock.
      const gone = mountCaseWindow([{ slug: 'gamma', controls: '<p>Contenido</p>' }], { open: 'gamma' });
      clickCaseLink(gone.caseLink);
      gone.caseLink.remove();

      pressKey(document, 'Escape');

      expect(document.activeElement).toBe(gone.dockLink);
    } finally {
      vi.useRealTimers();
    }
  });

  /* ---------------------------------------------------------------- */
  /* Showcase de proyectos                                             */
  /* ---------------------------------------------------------------- */

  // Scenario: El markup incompleto no produce una selección parcial
  it('El markup incompleto no produce una selección parcial', () => {
    const parts = ['image', 'title', 'description', 'tags', 'media'] as const;
    parts.forEach((part) => {
      const root = renderShowcase();
      root.querySelector(SHOWCASE_PARTS[part])!.remove();
      const served = snapshotShowcase(root);

      const cleanup = initProjectShowcase(root);
      cleanups.push(cleanup);

      expect(snapshotShowcase(root), part).toEqual(served);
      expect(root.hasAttribute('data-active-project'), part).toBe(false);
      expect(root.hasAttribute('data-project-transitioning'), part).toBe(false);

      expect(() => triggersOf(root)[1].click(), part).not.toThrow();

      expect(snapshotShowcase(root), part).toEqual(served);
      expect(root.hasAttribute('data-active-project'), part).toBe(false);
      expect(root.hasAttribute('data-project-transitioning'), part).toBe(false);
    });
  });

  // Scenario: Seleccionar un proyecto conserva contenido y accesibilidad
  it('Seleccionar un proyecto conserva contenido y accesibilidad', () => {
    // Scope raíz: se inicializa sobre el propio showcase.
    const root = renderShowcase();
    cleanups.push(initProjectShowcase(root));
    const triggers = triggersOf(root);
    expect(triggers.map((trigger) => trigger.getAttribute('aria-label'))).toEqual(
      PROJECTS.map((project) => project.full)
    );
    expectActiveProject(root, 0);

    triggers[1].click();
    expectActiveProject(root, 1);

    triggers[2].focus();
    pressKey(triggers[2], 'Enter');
    expectActiveProject(root, 2);
    expect(document.activeElement).toBe(triggers[2]);

    triggers[0].focus();
    pressKey(triggers[0], ' ');
    expectActiveProject(root, 0);
    expect(document.activeElement).toBe(triggers[0]);

    // Búsqueda de showcases dentro de un scope contenedor.
    document.body.innerHTML = `<section id="scope">${SHOWCASE_MARKUP}</section>`;
    const scoped = document.querySelector<HTMLElement>('#scope')!;
    cleanups.push(initProjectShowcase(scoped));
    const scopedRoot = scoped.querySelector<HTMLElement>('[data-project-showcase]')!;
    triggersOf(scopedRoot)[1].click();
    expectActiveProject(scopedRoot, 1);

    // Scope por defecto: el documento completo.
    const documentRoot = renderShowcase();
    cleanups.push(initProjectShowcase());
    triggersOf(documentRoot)[2].click();
    expectActiveProject(documentRoot, 2);
  });

  // Scenario: Showcase conserva movimiento reducido y limpieza de listeners
  it('Showcase conserva movimiento reducido y limpieza de listeners', () => {
    installMatchMedia({ [REDUCED_MOTION_QUERY]: true });
    const root = renderShowcase();
    const cleanup = initProjectShowcase(root);
    const triggers = triggersOf(root);

    expect(root.dataset.reducedMotion).toBe('true');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('0ms');

    triggers[1].click();

    expectActiveProject(root, 1);
    expect(root.dataset.reducedMotion).toBe('true');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('0ms');

    cleanup();

    const afterCleanup = snapshotShowcase(root);
    triggers[0].click();
    triggers[2].click();

    expect(snapshotShowcase(root)).toEqual(afterCleanup);
  });

  // Scenario: Los datos incompletos de un selector no sustituyen el proyecto actual
  it('Los datos incompletos de un selector no sustituyen el proyecto actual', () => {
    const attributes = ['data-project-image', 'data-project-full', 'data-project-desc', 'data-project-index'] as const;
    attributes.forEach((attribute) => {
      const root = renderShowcase();
      cleanups.push(initProjectShowcase(root));
      const before = snapshotShowcase(root);
      const second = triggersOf(root)[1];
      second.removeAttribute(attribute);

      second.click();

      expect(snapshotShowcase(root), attribute).toEqual(before);
      expect(second.getAttribute('aria-pressed'), attribute).toBe('false');
      expect(triggersOf(root)[0].getAttribute('aria-pressed'), attribute).toBe('true');
    });
  });

  /* ---------------------------------------------------------------- */
  /* Ráfaga del retrato                                                */
  /* ---------------------------------------------------------------- */

  // Scenario: La ráfaga respeta movimiento reducido desde el inicio
  it('La ráfaga respeta movimiento reducido desde el inicio', async () => {
    const harness = await mountPortrait({ reducedMotion: true, hover: true });
    harness.trigger.focus();

    hoverPortrait(harness.trigger);
    activatePortrait(harness.trigger, 'touch', 1);
    activatePortrait(harness.trigger, '', 0);

    expect(harness.particles()).toHaveLength(0);
    expect(harness.animateCalls).toHaveLength(0);
    expect(document.activeElement).toBe(harness.trigger);
  });

  // Scenario: El cambio dinámico a movimiento reducido limpia la ráfaga
  it('El cambio dinámico a movimiento reducido limpia la ráfaga', async () => {
    const harness = await mountPortrait({ hover: true });

    hoverPortrait(harness.trigger);
    const burst = [...harness.animations];
    expect(harness.particles()).toHaveLength(12);

    harness.media.change(REDUCED_MOTION_QUERY, true);

    expect(harness.particles()).toHaveLength(0);
    burst.forEach((animation) => expect(animation.cancel).toHaveBeenCalled());

    harness.media.change(REDUCED_MOTION_QUERY, false);

    expect(harness.particles()).toHaveLength(0);
    expect(harness.animateCalls).toHaveLength(12);

    hoverPortrait(harness.trigger);

    expect(harness.particles()).toHaveLength(12);
    expect(harness.animateCalls).toHaveLength(24);
  });

  // Scenario: Sin animación o con geometría nula el retrato sigue operable
  it('Sin animación o con geometría nula el retrato sigue operable', async () => {
    const harness = await mountPortrait({ hover: true });
    harness.trigger.focus();
    document.documentElement.classList.add('dark');
    delete (Element.prototype as unknown as { animate?: unknown }).animate;

    hoverPortrait(harness.trigger);

    expect(harness.particles()).toHaveLength(0);
    expect(document.activeElement).toBe(harness.trigger);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    installAnimateDouble();

    // Geometría nula: no hay ráfaga ni animación.
    harness.setGeometry(0, 0);
    hoverPortrait(harness.trigger);
    expect(harness.particles()).toHaveLength(0);
    expect(harness.animateCalls).toHaveLength(0);

    // Con animación disponible, la reemisión de geometría nula retira la ráfaga anterior.
    harness.setGeometry(200, 200);
    hoverPortrait(harness.trigger);
    const previous = [...harness.animations];
    expect(harness.particles()).toHaveLength(12);

    harness.setGeometry(0, 0);
    hoverPortrait(harness.trigger);

    expect(harness.particles()).toHaveLength(0);
    previous.forEach((animation) => expect(animation.cancel).toHaveBeenCalled());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // Scenario: La reemisión reemplaza la ráfaga y su finalización limpia los nodos
  it('La reemisión reemplaza la ráfaga y su finalización limpia los nodos', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const harness = await mountPortrait({ hover: true });

      hoverPortrait(harness.trigger);
      const first = [...harness.animations];
      expect(harness.particles()).toHaveLength(12);

      hoverPortrait(harness.trigger);
      const second = harness.animations.slice(12);

      first.forEach((animation) => expect(animation.cancel).toHaveBeenCalled());
      expect(second).toHaveLength(12);
      expect(harness.animateCalls).toHaveLength(24);
      expect(harness.particles()).toHaveLength(12);

      second.forEach((animation) => animation.fireFinish());

      expect(harness.particles()).toHaveLength(0);
      expect(harness.layer.children).toHaveLength(0);

      // Cancelar no deja promesas rechazadas sin manejar. `unhandledRejection` se emite al
      // drenar la cola de microtareas, así que basta un salto al bucle de eventos.
      first.forEach((animation) => animation.fail());
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  // Scenario: Las partículas mantienen límites y semántica decorativa
  it('Las partículas mantienen límites y semántica decorativa', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const harness = await mountPortrait({ hover: true, width: 200, height: 200, left: 200, viewport: 1280 });

    const travelAt = (viewport: number): number => {
      harness.setViewport(viewport);
      const before = harness.animateCalls.length;
      hoverPortrait(harness.trigger);
      const emitted = harness.animateCalls.slice(before);
      expect(emitted).toHaveLength(12);
      return lateralTravel(emitted[0], 200);
    };

    // Sin espacio disponible no hay desplazamiento lateral...
    expect(travelAt(200)).toBe(0);
    // ...con algo de espacio el desplazamiento crece con él...
    expect(travelAt(350)).toBeGreaterThan(0);
    // ...y se satura cuando el espacio deja de ser el límite.
    expect(travelAt(40000)).toBeGreaterThan(travelAt(350));

    // Extremo alto del rango aleatorio: los límites declarados se mantienen.
    random.mockReturnValue(1);
    hoverPortrait(harness.trigger);

    const particles = harness.particles();
    expect(particles).toHaveLength(12);
    particles.forEach((node) => {
      expect(node.getAttribute('aria-hidden')).toBe('true');
      expect(node.tabIndex).toBe(-1);
      expect(node.parentElement).toBe(harness.layer);
      expect(Number.parseFloat(node.style.fontSize)).toBeGreaterThanOrEqual(18);
      expect(Number.parseFloat(node.style.fontSize)).toBeLessThanOrEqual(32);
      expect(node.style.opacity).toBe('0');
    });

    const sizes = harness.animateCalls.map(({ node }) => Number.parseFloat(node.style.fontSize));
    expect(Math.min(...sizes)).toBe(18);
    expect(Math.max(...sizes)).toBe(32);

    harness.animateCalls.forEach(({ keyframes, options }) => {
      expect(options.duration).toBeGreaterThan(0);
      expect(options.duration).toBeLessThanOrEqual(1000);
      expect(keyframes[0]?.opacity).toBe(0);
      expect(keyframes[keyframes.length - 1]?.opacity).toBe(0);
    });
  });

  // Scenario: Las activaciones del retrato no duplican emisiones
  it('Las activaciones del retrato no duplican emisiones', async () => {
    // Retrato inicializado dos veces con mouse y hover: entrada y click, una sola ráfaga.
    const desktop = await mountPortrait({ hover: true, initTwice: true });

    hoverPortrait(desktop.trigger);
    expect(desktop.animateCalls).toHaveLength(12);

    activatePortrait(desktop.trigger, 'mouse', 1);
    expect(desktop.animateCalls).toHaveLength(12);

    // Sin hover: la entrada de mouse no emite y cada activación táctil o de teclado sí.
    const touch = await mountPortrait({ hover: false });
    touch.trigger.focus();

    hoverPortrait(touch.trigger);
    expect(touch.animateCalls).toHaveLength(0);

    activatePortrait(touch.trigger, 'touch', 1);
    expect(touch.animateCalls).toHaveLength(12);
    expect(document.activeElement).toBe(touch.trigger);

    activatePortrait(touch.trigger, '', 0);
    expect(touch.animateCalls).toHaveLength(24);
    expect(document.activeElement).toBe(touch.trigger);

    // Repetir Enter o Espacio cancela la repetición sin emitir otra ráfaga.
    expect(pressKey(touch.trigger, 'Enter', { repeat: true }).defaultPrevented).toBe(true);
    expect(pressKey(touch.trigger, ' ', { repeat: true }).defaultPrevented).toBe(true);
    expect(pressKey(touch.trigger, 'Spacebar', { repeat: true }).defaultPrevented).toBe(true);
    expect(touch.animateCalls).toHaveLength(24);
  });

  /* ---------------------------------------------------------------- */
  /* Bootstrap y controlador de tema                                   */
  /* ---------------------------------------------------------------- */

  // Scenario: El tema guardado prevalece sobre el sistema
  it('El tema guardado prevalece sobre el sistema', () => {
    const combinations = [
      { stored: 'light', systemDark: true, color: '#F9F9F9' },
      { stored: 'dark', systemDark: false, color: '#050b1a' }
    ];
    combinations.forEach(({ stored, systemDark, color }) => {
      const storage = createStorage({ theme: stored });
      const system = createSystemQuery({ matches: systemDark });
      const win = createThemeWindow({ storage, system });
      const doc = createInlineDocument();

      runInlineBootstrap(win, doc);

      expect(win.__portfolioTheme!.getTheme(), stored).toBe(stored);
      expect(themeState(doc), stored).toEqual({ theme: stored, scheme: stored, themeColor: color });
      expect(system.listeners, stored).toBe(0);

      system.change(!systemDark);

      expect(win.__portfolioTheme!.getTheme(), stored).toBe(stored);
      expect(themeState(doc), stored).toEqual({ theme: stored, scheme: stored, themeColor: color });
      expect(storage.attempts, stored).toEqual([]);
      expect(storage.entries(), stored).toEqual([['theme', stored]]);
    });
  });

  // Scenario: Sin preferencia válida el tema sigue al sistema
  it('Sin preferencia válida el tema sigue al sistema', () => {
    const cases: [string, StorageLike][] = [
      ['sin clave', createStorage({ 'otra-clave': 'intacta' })],
      ['valor inválido', createStorage({ theme: 'system', 'otra-clave': 'intacta' })],
      ['lectura bloqueada', createStorage({ 'otra-clave': 'intacta' }, { readsThrow: true })]
    ];
    cases.forEach(([label, storage]) => {
      const system = createSystemQuery({ matches: true });
      const win = createThemeWindow({ storage, system });
      const doc = createInlineDocument();

      runInlineBootstrap(win, doc);

      expect(win.__portfolioTheme!.getTheme(), label).toBe('dark');
      expect(themeState(doc), label).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });

      system.change(false);
      expect(win.__portfolioTheme!.getTheme(), label).toBe('light');
      expect(themeState(doc), label).toEqual({ theme: 'light', scheme: 'light', themeColor: '#F9F9F9' });

      system.change(true);
      expect(win.__portfolioTheme!.getTheme(), label).toBe('dark');
      expect(themeState(doc), label).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });

      // Ni elección manual ni claves ajenas: solo se leyó la clave propia.
      expect(storage.attempts, label).toEqual([]);
      expect(Object.fromEntries(storage.entries())['otra-clave'], label).toBe('intacta');
    });
  });

  // Scenario: Una consulta de sistema inutilizable permite fallback claro
  it('Una consulta de sistema inutilizable permite fallback claro', () => {
    const cases: [string, ThemeGlobal][] = [
      ['matchMedia ausente', createThemeWindow({ system: 'absent' })],
      ['matchMedia que falla', createThemeWindow({ system: 'throwing' })],
      ['matches no booleano', createThemeWindow({ system: 'booleanless' })]
    ];
    cases.forEach(([label, win]) => {
      const doc = createInlineDocument();

      expect(() => runInlineBootstrap(win, doc), label).not.toThrow();

      expect(win.__portfolioTheme!.getTheme(), label).toBe('light');
      expect(themeState(doc), label).toEqual({ theme: 'light', scheme: 'light', themeColor: '#F9F9F9' });

      expect(() => win.__portfolioTheme!.toggle(), label).not.toThrow();

      expect(win.__portfolioTheme!.getTheme(), label).toBe('dark');
      expect(themeState(doc), label).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });
    });
  });

  // Scenario: Una consulta sin suscripción todavía resuelve el tema inicial
  it('Una consulta sin suscripción todavía resuelve el tema inicial', () => {
    const system = createSystemQuery({ matches: true, subscribable: false });
    const win = createThemeWindow({ system });
    const doc = createInlineDocument();

    expect(() => runInlineBootstrap(win, doc)).not.toThrow();

    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });
    expect(typeof win.__portfolioTheme!.subscribe).toBe('function');
    expect(typeof win.__portfolioTheme!.toggle).toBe('function');
  });

  // Scenario: Alternar persiste y deja de seguir al sistema
  it('Alternar persiste y deja de seguir al sistema', () => {
    const storage = createStorage();
    const system = createSystemQuery({ matches: false });
    const win = createThemeWindow({ storage, system });
    const doc = createInlineDocument();

    runInlineBootstrap(win, doc);
    expect(win.__portfolioTheme!.getTheme()).toBe('light');

    win.__portfolioTheme!.toggle();

    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });
    expect(storage.entries()).toEqual([['theme', 'dark']]);
    expect(system.listeners).toBe(0);

    system.change(true);
    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc).theme).toBe('dark');

    // Nueva carga en otro documento: recupera la elección guardada.
    const reloaded = createThemeWindow({ storage, system: createSystemQuery({ matches: false }) });
    const reloadedDocument = createInlineDocument();

    runInlineBootstrap(reloaded, reloadedDocument);

    expect(reloaded.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(reloadedDocument)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });
  });

  // Scenario: Una escritura rechazada conserva la elección manual en memoria
  it('Una escritura rechazada conserva la elección manual en memoria', () => {
    const storage = createStorage({ 'otra-clave': 'intacta' }, { writesThrow: true });
    const system = createSystemQuery({ matches: false });
    const win = createThemeWindow({ storage, system });
    const doc = createInlineDocument();

    runInlineBootstrap(win, doc);
    expect(win.__portfolioTheme!.getTheme()).toBe('light');

    expect(() => win.__portfolioTheme!.toggle()).not.toThrow();
    expect(win.__portfolioTheme!.getTheme()).toBe('dark');

    // Un cambio del sistema contrario a la elección, incluso ya encolado antes de la
    // alternancia, no la reemplaza.
    system.change(false);
    system.deliverQueued(false);

    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc).theme).toBe('dark');

    expect(() => win.__portfolioTheme!.toggle()).not.toThrow();

    expect(win.__portfolioTheme!.getTheme()).toBe('light');
    expect(themeState(doc).theme).toBe('light');
    expect(storage.entries()).toEqual([['otra-clave', 'intacta']]);
    expect(storage.attempts).toEqual(['theme', 'theme']);
  });

  // Scenario: Suscripción y baja reflejan los cambios efectivos del tema
  it('Suscripción y baja reflejan los cambios efectivos del tema', () => {
    const system = createSystemQuery({ matches: false });
    const win = createThemeWindow({ system });
    const doc = createInlineDocument();

    runInlineBootstrap(win, doc);
    const controller = win.__portfolioTheme!;
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = controller.subscribe(first);
    controller.subscribe(second);

    system.change(true);

    expect(first.mock.calls.at(-1)).toEqual(['dark']);
    expect(second.mock.calls.at(-1)).toEqual(['dark']);

    controller.toggle();

    expect(first.mock.calls.at(-1)).toEqual(['light']);
    expect(second.mock.calls.at(-1)).toEqual(['light']);
    const seenByFirst = first.mock.calls.length;

    unsubscribeFirst();
    unsubscribeFirst();
    controller.toggle();

    expect(first.mock.calls.length).toBe(seenByFirst);
    expect(second.mock.calls.at(-1)).toEqual(['dark']);
  });

  // Scenario: Reiniciar el bootstrap conserva el controlador y sus consumidores
  it('Reiniciar el bootstrap conserva el controlador y sus consumidores', () => {
    const storage = createStorage({ theme: 'dark' });
    const win = createThemeWindow({ storage, system: createSystemQuery({ matches: false }) });

    runInlineBootstrap(win, createInlineDocument());
    const controller = win.__portfolioTheme!;
    const consumer = vi.fn();
    controller.subscribe(consumer);

    runInlineBootstrap(win, createInlineDocument());

    expect(win.__portfolioTheme).toBe(controller);
    expect(consumer).not.toHaveBeenCalled();
    expect(controller.getTheme()).toBe('dark');

    controller.toggle();

    expect(consumer).toHaveBeenCalledTimes(1);
    expect(consumer).toHaveBeenCalledWith('light');
  });

  // Scenario: El consumidor del dock conserva el estado accesible y el foco
  it('El consumidor del dock conserva el estado accesible y el foco', () => {
    document.documentElement.className = 'has-window otra-clase';
    document.head.insertAdjacentHTML('afterbegin', '<meta name="theme-color" content="#F9F9F9">');
    document.body.innerHTML = `
      <button
        class="dock__theme-toggle"
        type="button"
        data-theme-toggle
        aria-label="Modo oscuro"
        aria-pressed="false"
        hidden
      >Modo oscuro</button>
    `;
    const system = createSystemQuery({ matches: false });
    runInlineBootstrap(window, document);
    expect(themeState(document)).toEqual({ theme: 'light', scheme: 'light', themeColor: '#F9F9F9' });

    initThemeSwitcher();
    const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
    expect(button.hidden).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');

    button.focus();
    button.click();

    expect(window.__portfolioTheme!.getTheme()).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(button);
    expect(themeState(document)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });
    expect(document.documentElement.classList.contains('has-window')).toBe(true);
    expect(document.documentElement.classList.contains('otra-clase')).toBe(true);
    expect(system.listeners).toBe(0);
  });

  // Scenario: El bootstrap inline aplica el tema sin esperar al bundle
  it('El bootstrap inline aplica el tema sin esperar al bundle', () => {
    const storage = createStorage({ theme: 'dark' });
    const win = createThemeWindow({ storage, system: createSystemQuery({ matches: false }) });
    const doc = createInlineDocument();
    expect(doc.querySelectorAll('script')).toHaveLength(0);

    runInlineBootstrap(win, doc);

    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: '#050b1a' });

    // El controlador queda disponible para los callers posteriores.
    const consumer = vi.fn();
    win.__portfolioTheme!.subscribe(consumer);
    win.__portfolioTheme!.toggle();

    expect(consumer).toHaveBeenCalledWith('light');
    expect(themeState(doc).theme).toBe('light');

    // El documento del dock y del bundle no se toca: el script corre aislado y síncrono.
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.__portfolioTheme).toBeUndefined();
  });

  /* ---------------------------------------------------------------- */
  /* Contratos que los mutantes sobrevivientes dejaron al descubierto  */
  /* ---------------------------------------------------------------- */

  it('Solo la ruta de caso al inicio del hash abre y cierra la ventana', () => {
    renderCaseShell([{ slug: 'alpha', controls: CONTROL_ONE }], { hash: '/#/blog#/caso/alpha' });

    // Un segundo '#' no convierte el resto del hash en ruta de caso.
    expect(() => initCaseWindow()).not.toThrow();
    expect(document.documentElement.classList.contains('has-window')).toBe(false);

    history.replaceState(null, '', '/#/caso/alpha');
    window.dispatchEvent(new Event('hashchange'));

    expect(document.documentElement.classList.contains('has-window')).toBe(true);

    // Salir a otra ruta cierra la ventana y respeta el hash de destino.
    history.replaceState(null, '', '/#contacto');
    window.dispatchEvent(new Event('hashchange'));

    expect(document.documentElement.classList.contains('has-window')).toBe(false);
    expect(location.hash).toBe('#contacto');

    // Y volver a la ruta del caso lo abre otra vez.
    history.replaceState(null, '', '/#/caso/alpha');
    window.dispatchEvent(new Event('hashchange'));

    expect(document.documentElement.classList.contains('has-window')).toBe(true);
  });

  it('Sin alguna pieza del cascarón la ventana no se inicializa', () => {
    (['window', 'windowBody', 'scrim', 'windowClose'] as const).forEach((id) => {
      renderCaseShell([{ slug: 'alpha', controls: CONTROL_ONE }], { hash: '/#/caso/alpha', omit: [id] });

      expect(() => initCaseWindow(), id).not.toThrow();

      expect(document.documentElement.classList.contains('has-window'), id).toBe(false);
      expect(document.getElementById('windowBody')?.childElementCount ?? 0, id).toBe(0);
    });
  });

  it('Una ventana sin título se abre igual', () => {
    renderCaseShell([{ slug: 'alpha', controls: CONTROL_ONE }], {
      hash: '/#/caso/alpha',
      omit: ['windowTitle']
    });

    expect(() => initCaseWindow()).not.toThrow();

    expect(document.documentElement.classList.contains('has-window')).toBe(true);
    expect(document.getElementById('windowBody')!.querySelector('.case')).not.toBeNull();
  });

  it('Reabrir durante la salida cancela el ocultamiento pendiente', () => {
    vi.useFakeTimers();
    try {
      const handles = mountCaseWindow(
        [
          { slug: 'alpha', controls: CONTROL_ONE },
          { slug: 'beta', controls: CONTROL_ONE }
        ],
        { open: 'alpha' }
      );

      pressKey(document, 'Escape');
      history.replaceState(null, '', '/#/caso/beta');
      window.dispatchEvent(new Event('hashchange'));
      vi.advanceTimersByTime(400);

      expect(handles.win.hidden).toBe(false);
      expect(handles.scrim.hidden).toBe(false);
      expect(handles.win.classList.contains('is-open')).toBe(true);
      expect(handles.scrim.classList.contains('is-open')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Abrir enfoca el título y cerrar devuelve el foco al enlace de origen', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }]);
    const title = document.getElementById('windowTitle') as HTMLElement;
    const titleFocus = vi.spyOn(title, 'focus');
    const linkFocus = vi.spyOn(handles.caseLink, 'focus');

    clickCaseLink(handles.caseLink);
    history.replaceState(null, '', '/#/caso/alpha');
    window.dispatchEvent(new Event('hashchange'));

    expect(document.activeElement).toBe(title);
    // Enfocar no puede arrastrar el scroll de la página.
    expect(titleFocus).toHaveBeenCalledWith({ preventScroll: true });

    // Un click posterior fuera de un enlace de caso no borra el origen.
    handles.winBody.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    pressKey(document, 'Escape');

    expect(document.activeElement).toBe(handles.caseLink);
    expect(linkFocus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('Cerrar sin origen ni enlace del dock limpia la ruta igual', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    handles.dockLink.remove();

    pressKey(document, 'Escape');

    expect(location.hash).toBe('');
    expect(document.documentElement.classList.contains('has-window')).toBe(false);
  });

  it('El botón de cerrar y el scrim cierran la ventana y limpian la ruta', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    clickCaseLink(handles.caseLink);

    handles.close.click();

    expect(document.documentElement.classList.contains('has-window')).toBe(false);
    expect(location.hash).toBe('');
    expect(location.pathname).toBe('/');
    expect(document.activeElement).toBe(handles.caseLink);

    history.replaceState(null, '', '/#/caso/alpha');
    window.dispatchEvent(new Event('hashchange'));
    expect(document.documentElement.classList.contains('has-window')).toBe(true);

    handles.scrim.click();

    expect(document.documentElement.classList.contains('has-window')).toBe(false);
    expect(location.hash).toBe('');

    // Con la ventana ya cerrada, el mismo botón no mueve el foco de la página.
    handles.caseLink.focus();
    handles.close.click();

    expect(document.activeElement).toBe(handles.caseLink);
  });

  it('El foco sin caja de layout no captura la navegación hacia adelante', () => {
    const handles = mountCaseWindow([{ slug: 'alpha', controls: CONTROL_WITHOUT_LAYOUT }], { open: 'alpha' });
    handles.close.disabled = true;
    const withoutLayout = document.getElementById('control-sin-layout') as HTMLButtonElement;
    withoutLayout.focus();

    // El control enfocado cuenta como primero: hacia adelante manda la navegación nativa.
    const forward = pressKey(withoutLayout, 'Tab');

    expect(forward.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(withoutLayout);
  });

  it('Las teclas ajenas a Tab no se capturan ni en los extremos', () => {
    mountCaseWindow([{ slug: 'alpha', controls: CONTROL_ONE }], { open: 'alpha' });
    const last = document.getElementById('control-uno') as HTMLButtonElement;
    last.focus();

    const event = pressKey(last, 'ArrowRight');

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(last);
  });

  it('La duración del showcase sigue la preferencia de movimiento y tolera navegadores sin matchMedia', () => {
    const root = renderShowcase();
    cleanups.push(initProjectShowcase(root));

    expect(root.dataset.reducedMotion).toBe('false');
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('420ms');

    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    const legacy = renderShowcase();

    expect(() => cleanups.push(initProjectShowcase(legacy))).not.toThrow();

    expect(legacy.dataset.reducedMotion).toBe('false');
    expect(legacy.style.getPropertyValue('--showcase-duration')).toBe('420ms');
  });

  it('Los datos opcionales del selector se aplican tal cual o se omiten', () => {
    const root = renderShowcase();
    cleanups.push(initProjectShowcase(root));
    const image = root.querySelector<HTMLImageElement>('[data-project-image]')!;
    const media = root.querySelector<HTMLElement>('[data-project-media]')!;
    const triggers = triggersOf(root);

    triggers[1].click();

    expect(image.width).toBe(PROJECTS[1].w);
    expect(image.height).toBe(PROJECTS[1].h);
    expect(media.className).toBe(`project-showcase__media card__media--${PROJECTS[1].slug}`);

    // Sin tags, dimensiones ni slug: el panel vacía los tags y conserva lo demás.
    ['data-project-tags', 'data-project-width', 'data-project-height', 'data-project-slug'].forEach(
      (attribute) => triggers[2].removeAttribute(attribute)
    );

    triggers[2].click();

    expect(root.querySelector('[data-project-tags]')!.textContent).toBe('');
    expect(root.querySelector('[data-project-title]')!.textContent).toBe(PROJECTS[2].full);
    expect(image.width).toBe(PROJECTS[1].w);
    expect(image.height).toBe(PROJECTS[1].h);
    expect(media.className).toBe(`project-showcase__media card__media--${PROJECTS[1].slug}`);
  });

  it('Un showcase sin selectores no se inicializa ni falla', () => {
    document.body.innerHTML = '<div data-project-showcase><div data-project-panel></div></div>';
    const root = document.querySelector<HTMLElement>('[data-project-showcase]')!;

    expect(() => cleanups.push(initProjectShowcase(root))).not.toThrow();

    expect(root.dataset.reducedMotion).toBeUndefined();
    expect(root.style.getPropertyValue('--showcase-duration')).toBe('');
  });

  it('Solo Enter y Espacio activan por teclado, y la limpieza los desconecta', () => {
    const root = renderShowcase();
    const cleanup = initProjectShowcase(root);
    const triggers = triggersOf(root);

    const ignored = pressKey(triggers[1], 'Tab');

    expect(ignored.defaultPrevented).toBe(false);
    expectActiveProject(root, 0);

    const enter = pressKey(triggers[1], 'Enter');

    expect(enter.defaultPrevented).toBe(true);
    expectActiveProject(root, 1);

    cleanup();
    const afterCleanup = snapshotShowcase(root);
    pressKey(triggers[2], 'Enter');
    pressKey(triggers[2], ' ');

    expect(snapshotShowcase(root)).toEqual(afterCleanup);
  });

  it('La selección inicial respeta el selector ya presionado', () => {
    const root = renderShowcase();
    const triggers = triggersOf(root);
    triggers[0].setAttribute('aria-pressed', 'false');
    triggers[1].setAttribute('aria-pressed', 'true');

    cleanups.push(initProjectShowcase(root));

    expectActiveProject(root, 1);
  });

  it('Una capa sin ancho o sin alto no emite ráfaga', async () => {
    const harness = await mountPortrait({ hover: true });

    harness.setGeometry(0, 200);
    hoverPortrait(harness.trigger);

    expect(harness.particles()).toHaveLength(0);

    harness.setGeometry(200, 0);
    hoverPortrait(harness.trigger);

    expect(harness.particles()).toHaveLength(0);
    expect(harness.animateCalls).toHaveLength(0);
  });

  it('La geometría y los tiempos de la partícula se derivan de la capa y del azar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    const harness = await mountPortrait({ hover: true, width: 200, height: 120, left: 50, viewport: 1280 });

    hoverPortrait(harness.trigger);

    expect(harness.animateCalls).toHaveLength(12);
    const [{ node, keyframes, options }] = harness.animateCalls;

    // Capa de 200×120 con su borde izquierdo a 50 px del viewport y azar fijo en 0.3:
    // el desplazamiento lateral (-32.3 px sin límites) se recorta a los 6 px libres.
    expect(node.style.fontSize).toBe('22.2px');
    expect(node.style.left).toBe('90.1px');
    expect(node.style.top).toBe('90.4px');
    expect(options).toEqual({ duration: 743.3333333333334, delay: 28, easing: 'ease-out', fill: 'both' });
    expect(keyframes).toEqual([
      { offset: 0, opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(-12.0deg)' },
      { offset: 0.13452914798206278, opacity: 1 },
      { offset: 0.8654708520179373, opacity: 1 },
      {
        offset: 1,
        opacity: 0,
        transform: 'translate(-50%, -50%) translate(3.9px, 99.5px) scale(1) rotate(-40.0deg)'
      }
    ]);
  });

  it('El glifo de la partícula cambia con el azar', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const harness = await mountPortrait({ hover: true });

    hoverPortrait(harness.trigger);
    const first = harness.particles()[0].textContent;

    random.mockReturnValue(0.5);
    hoverPortrait(harness.trigger);
    const second = harness.particles()[0].textContent;

    expect(first).toBeTruthy();
    expect(second).not.toBe(first);
  });

  it('Al terminar una partícula el resto sigue bajo control de la ráfaga', async () => {
    const harness = await mountPortrait({ hover: true });

    hoverPortrait(harness.trigger);
    const burst = [...harness.animations];
    expect(harness.particles()).toHaveLength(12);

    burst[0].fireFinish();

    expect(harness.particles()).toHaveLength(11);

    harness.media.change(REDUCED_MOTION_QUERY, true);

    expect(harness.particles()).toHaveLength(0);
    burst.slice(1).forEach((animation) => expect(animation.cancel).toHaveBeenCalled());
    // La partícula ya terminada salió de la ráfaga: nadie vuelve a cancelarla.
    expect(burst[0].cancel).not.toHaveBeenCalled();
  });

  it('Cada tipo de activación emite exactamente una ráfaga', async () => {
    const hybrid = await mountPortrait({ hover: true });

    // Un puntero táctil que entra sobre un equipo con hover no emite al pasar...
    hybrid.trigger.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
    expect(hybrid.animateCalls).toHaveLength(0);

    // ...sino al tocar.
    activatePortrait(hybrid.trigger, 'touch', 1);
    expect(hybrid.animateCalls).toHaveLength(12);

    // La activación asistida o programática (`detail` 0) emite aunque se reporte como mouse.
    activatePortrait(hybrid.trigger, 'mouse', 0);
    expect(hybrid.animateCalls).toHaveLength(24);

    // Sin hover, el click de mouse emite: ninguna entrada previa emitió por él.
    const touchOnly = await mountPortrait({ hover: false });
    activatePortrait(touchOnly.trigger, 'mouse', 1);
    expect(touchOnly.animateCalls).toHaveLength(12);

    // Solo la repetición de Enter o Espacio se cancela; el resto llega al navegador.
    expect(pressKey(touchOnly.trigger, 'Enter').defaultPrevented).toBe(false);
    expect(pressKey(touchOnly.trigger, 'ArrowDown', { repeat: true }).defaultPrevented).toBe(false);
    expect(touchOnly.animateCalls).toHaveLength(12);
  });

  it('Desactivar el movimiento reducido no retira la ráfaga viva', async () => {
    const harness = await mountPortrait({ hover: true });

    hoverPortrait(harness.trigger);
    expect(harness.particles()).toHaveLength(12);

    harness.media.change(REDUCED_MOTION_QUERY, false);

    expect(harness.particles()).toHaveLength(12);
    harness.animations.forEach((animation) => expect(animation.cancel).not.toHaveBeenCalled());
  });

  it('Inicializar dos veces no duplica la suscripción a movimiento reducido', async () => {
    const harness = await mountPortrait({ hover: true, initTwice: true });

    expect(harness.media.listenerCount(REDUCED_MOTION_QUERY)).toBe(1);

    hoverPortrait(harness.trigger);
    expect(harness.particles()).toHaveLength(12);

    harness.media.change(REDUCED_MOTION_QUERY, true);

    expect(harness.particles()).toHaveLength(0);
  });

  it('Un retrato incompleto o un navegador sin matchMedia no rompen la inicialización', async () => {
    // El import estático no sirve aquí: el módulo recuerda los retratos ya inicializados y
    // la suscripción a movimiento reducido, y solo un import nuevo reinicia ese estado.
    const variants = [
      '<div data-hero-portrait><span data-hero-emoji-layer></span></div>',
      '<div data-hero-portrait><button type="button" data-hero-portrait-trigger></button></div>'
    ];
    for (const markup of variants) {
      document.body.innerHTML = markup;
      vi.resetModules();
      const incomplete = await import('@lib/core/hero-emoji-burst');

      expect(() => incomplete.initHeroEmojiBurst(), markup).not.toThrow();
    }

    // Sin retratos y sin matchMedia no hay preferencia a la que suscribirse: tampoco falla.
    document.body.innerHTML = '';
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    vi.resetModules();
    const legacy = await import('@lib/core/hero-emoji-burst');

    expect(() => legacy.initHeroEmojiBurst()).not.toThrow();
  });

  it('Un documento sin theme-color aplica el tema igual', () => {
    const storage = createStorage({ theme: 'dark' });
    const win = createThemeWindow({ storage, system: createSystemQuery({ matches: false }) });
    const doc = document.implementation.createHTMLDocument('sin-meta');

    expect(() => runInlineBootstrap(win, doc)).not.toThrow();

    expect(win.__portfolioTheme!.getTheme()).toBe('dark');
    expect(themeState(doc)).toEqual({ theme: 'dark', scheme: 'dark', themeColor: null });
  });

  // Scenario: El tema dark pinta la superficie global con el nuevo fondo
  it('El tema dark pinta la superficie global con el nuevo fondo', () => {
    const tokens = themeTokens('dark');

    // El token global y el fondo pintado son el mismo color: #050b1a = rgb(5 11 26).
    expect(tokens.get('--app-surface')).toBe('5 11 26');
    expect(opaqueChannels(elementDeclarations([PAGE_STYLESHEET], 'html', 'dark').get('background-color')!)).toEqual([
      5, 11, 26
    ]);

    // El fondo del body conserva su degradado: solo cambia su capa de superficie.
    const layers = backgroundLayers(elementDeclarations([PAGE_STYLESHEET], 'body', 'dark').get('background')!);

    expect(layers).toHaveLength(2);
    expect(layers[0]).toContain('radial-gradient');
    expect(opaqueChannels(layers[1])).toEqual([5, 11, 26]);

    // Ni el arte del pie ni las sombras se sustituyen por el nuevo color.
    expect(elementDeclarations([FOOTER_STYLESHEET], '.footer__art', 'dark').get('background-image'), 'arte dark').toBe(
      'url("/assets/footer_image_dark.png")'
    );
    expect(tokens.get('--app-shadow-card')?.replace(/\s+/g, ''), 'sombra de tarjeta').toBe(
      THEME_VALUES.dark['--app-shadow-card'].replace(/\s+/g, '')
    );
  });

  // Scenario: El tema light y los demás roles conservan sus colores
  it('El tema light y los demás roles conservan sus colores', () => {
    // La superficie clara y la pareja que publica el bootstrap siguen como estaban.
    expect(themeTokens('light').get('--app-surface')).toBe('249 249 249');
    expect(opaqueChannels(elementDeclarations([PAGE_STYLESHEET], 'html', 'light').get('background-color')!)).toEqual([
      249, 249, 249
    ]);
    expect(publishedThemeColor('light')).toBe('#F9F9F9');
    expect(publishedThemeColor('dark')).toBe('#050b1a');

    // Texto, bordes, acentos, elevación y sombras conservan su valor en cada tema.
    expectThemeValues('light');
    expectThemeValues('dark');

    // El arte del pie sigue siendo el de cada tema: el nuevo fondo no lo sustituye.
    (['light', 'dark'] as const).forEach((theme) => {
      expect(elementDeclarations([FOOTER_STYLESHEET], '.footer__art', theme).get('background-image'), theme).toBe(
        theme === 'light' ? 'url("/assets/footer_image_light.png")' : 'url("/assets/footer_image_dark.png")'
      );
    });
  });
});
