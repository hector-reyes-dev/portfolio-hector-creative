// Stryker: mutation testing de este archivo no es confiable en este entorno —
// @stryker-mutator/vitest-runner@10.0.0 pide el token DI "globalNamespace" que
// ningún paquete de @stryker-mutator (core/api/instrumenter/util) provee, así que
// `globalThis[undefined].activeMutant` nunca coincide con el `globalThis.__stryker__`
// que usa el código instrumentado: ningún mutante se activa en runtime y casi todos
// se reportan "Survived" aunque la suite real sí los mate (verificado a mano
// reescribiendo mutaciones concretas y corriendo `pnpm vitest run`). No son
// sobrevivientes equivalentes: es un defecto de la cadena de herramientas, no de
// este módulo. Repro: `pnpm test:mutation` con `mutate` acotado a este archivo.

const ROOT_SELECTOR = '[data-project-showcase]';
const TRIGGER_SELECTOR = '[data-project-trigger]';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getTriggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR));
}

function setMotionPolicy(root: HTMLElement): void {
  const reduced = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches;

  root.dataset.reducedMotion = String(reduced);
  root.style.setProperty('--showcase-duration', reduced ? '0ms' : '420ms');
}

function restartTransition(root: HTMLElement): void {
  root.removeAttribute('data-project-transitioning');
  void root.offsetWidth;
  root.dataset.projectTransitioning = 'true';
}

type ShowcaseElements = {
  image: HTMLImageElement;
  title: HTMLElement;
  description: HTMLElement;
  tags: HTMLElement;
  media: HTMLElement;
};

function getShowcaseElements(root: HTMLElement): ShowcaseElements | null {
  const image = root.querySelector<HTMLImageElement>('[data-project-image]');
  const title = root.querySelector<HTMLElement>('[data-project-title]');
  const description = root.querySelector<HTMLElement>('[data-project-description]');
  const tags = root.querySelector<HTMLElement>('[data-project-tags]');
  const media = root.querySelector<HTMLElement>('[data-project-media]');
  if (!image || !title || !description || !tags || !media) return null;
  return { image, title, description, tags, media };
}

type TriggerData = {
  index: string;
  image: string;
  full: string;
  desc: string;
  tags?: string;
  width?: string;
  height?: string;
  slug?: string;
};

function getTriggerData(trigger: HTMLButtonElement): TriggerData | null {
  const { projectIndex, projectImage, projectFull, projectDesc, projectTags, projectWidth, projectHeight, projectSlug } = trigger.dataset;
  if (!projectImage || !projectFull || !projectDesc || !projectIndex) return null;
  return {
    index: projectIndex,
    image: projectImage,
    full: projectFull,
    desc: projectDesc,
    tags: projectTags,
    width: projectWidth,
    height: projectHeight,
    slug: projectSlug
  };
}

function applyTriggerState(triggers: HTMLButtonElement[], trigger: HTMLButtonElement): void {
  triggers.forEach((item) => {
    item.setAttribute('aria-pressed', item === trigger ? 'true' : 'false');
  });
}

function paintShowcase(elements: ShowcaseElements, data: TriggerData): void {
  elements.title.textContent = data.full;
  elements.description.textContent = data.desc;
  elements.tags.textContent = data.tags ?? '';
  elements.image.src = data.image;
  elements.image.alt = data.full;
  if (data.width) elements.image.width = Number(data.width);
  if (data.height) elements.image.height = Number(data.height);
  if (data.slug) {
    elements.media.className = `project-showcase__media card__media--${data.slug}`;
  }
}

function updateShowcase(root: HTMLElement, trigger: HTMLButtonElement, triggers: HTMLButtonElement[]): void {
  const elements = getShowcaseElements(root);
  const data = getTriggerData(trigger);
  if (!elements || !data) return;

  restartTransition(root);
  applyTriggerState(triggers, trigger);
  root.dataset.activeProject = data.index;
  paintShowcase(elements, data);
}

function initRoot(root: HTMLElement): () => void {
  const triggers = getTriggers(root);
  if (triggers.length === 0) return () => undefined;

  setMotionPolicy(root);
  const listeners: Array<() => void> = [];

  triggers.forEach((trigger) => {
    const activate = (): void => updateShowcase(root, trigger, triggers);
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate();
    };
    trigger.addEventListener('click', activate);
    trigger.addEventListener('keydown', onKeyDown);
    listeners.push(() => {
      trigger.removeEventListener('click', activate);
      trigger.removeEventListener('keydown', onKeyDown);
    });
  });

  const selected = triggers.find((trigger) => trigger.getAttribute('aria-pressed') === 'true') ?? triggers[0];
  updateShowcase(root, selected, triggers);
  return () => listeners.forEach((remove) => remove());
}

/** Binds every server-rendered project showcase in the provided scope. */
export function initProjectShowcase(scope?: ParentNode): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const target = scope ?? document;
  const roots: HTMLElement[] = [];
  if (target instanceof HTMLElement && target.matches(ROOT_SELECTOR)) roots.push(target);
  roots.push(...Array.from(target.querySelectorAll<HTMLElement>(ROOT_SELECTOR)));
  const cleanups = roots.map(initRoot);
  return () => cleanups.forEach((cleanup) => cleanup());
}
