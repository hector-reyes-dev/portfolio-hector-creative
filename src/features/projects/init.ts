const ROOT_SELECTOR = '[data-project-showcase]';
const TRIGGER_SELECTOR = '[data-project-trigger]';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getTriggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR));
}

function setMotionPolicy(root: HTMLElement): void {
  const reduced =
    typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

  root.dataset.reducedMotion = String(reduced);
  root.style.setProperty('--showcase-duration', reduced ? '0ms' : '420ms');
}

/**
 * Rearma la entrada en cada activación: las capas que entran vuelven a su pose de entrada
 * (`data-project-transitioning="enter"`, sin transición) y en el mismo fotograma se sueltan a su
 * pose de reposo (`"true"`), que sí transiciona. Una transición y no un `@keyframes`: al encadenar
 * selecciones el navegador interpola hacia la pose nueva desde el valor vigente, sin una línea de
 * tiempo fija que haya que reiniciar a mano.
 */
function restartTransition(root: HTMLElement): void {
  root.removeAttribute('data-project-transitioning');
  root.dataset.projectTransitioning = 'enter';
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

type ShowcaseParts = {
  image: HTMLImageElement | null;
  title: HTMLElement | null;
  description: HTMLElement | null;
  tags: HTMLElement | null;
  media: HTMLElement | null;
};

// Los disparadores reutilizan marcadores del panel (`data-project-image`, `data-project-tags`),
// así que las partes del panel se leen excluyéndolos: un panel incompleto no se lee a medias.
const SHOWCASE_PART_SELECTORS: Record<keyof ShowcaseElements, string> = {
  image: '[data-project-image]:not([data-project-trigger])',
  title: '[data-project-title]:not([data-project-trigger])',
  description: '[data-project-description]:not([data-project-trigger])',
  tags: '[data-project-tags]:not([data-project-trigger])',
  media: '[data-project-media]:not([data-project-trigger])'
};

/** El panel se pinta completo o no se pinta: con una parte ausente ninguna se sustituye. */
function requireAllPresent(parts: ShowcaseParts): ShowcaseElements | null {
  const complete = Object.values(parts).every((part) => part !== null);
  return complete ? (parts as ShowcaseElements) : null;
}

function getShowcaseElements(root: HTMLElement): ShowcaseElements | null {
  const parts: ShowcaseParts = {
    image: root.querySelector<HTMLImageElement>(SHOWCASE_PART_SELECTORS.image),
    title: root.querySelector<HTMLElement>(SHOWCASE_PART_SELECTORS.title),
    description: root.querySelector<HTMLElement>(SHOWCASE_PART_SELECTORS.description),
    tags: root.querySelector<HTMLElement>(SHOWCASE_PART_SELECTORS.tags),
    media: root.querySelector<HTMLElement>(SHOWCASE_PART_SELECTORS.media)
  };
  return requireAllPresent(parts);
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
