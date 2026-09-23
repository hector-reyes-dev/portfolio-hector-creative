// Inicializador del hover letra→tile del nombre del Hero («Héctor Reyes»).
// Estado puramente efímero: no persiste datos, no importa features ni toca el tema.

/** Puntero fino capaz de hover: misma consulta que magnetic-hover y spotlight. */
const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
/** Movimiento reducido: el efecto se desactiva por completo, como hero-emoji-burst. */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Once letras del nombre (slots 00–10); otra cantidad significa raíz incompleta. */
const LETTER_COUNT = 11;
/** Delay de restauración al salir: reutiliza el token `release` (180 ms) de motion.css. */
const RESTORE_DELAY_MS = 180;
/** Las dos variantes de tile de cada letra; el sorteo elige entre ellas. */
const TILE_VARIANTS = ['0', '1'] as const;

/** Estado por letra: tiles perezosos y temporizador de restauración pendiente. */
interface LetterState {
  /** Par de tiles decorativos, creados recién en la primera activación permitida. */
  tiles: HTMLElement[] | null;
  /** `setTimeout` de restauración de esta letra; se cancela al reentrar o desactivar. */
  restoreTimer: ReturnType<typeof setTimeout> | null;
}

/** Controller por raíz: posee sus tiles, timers, listeners y media queries. */
interface NameHoverController {
  root: HTMLElement;
  destroy(): void;
}

const controllers = new WeakMap<HTMLElement, NameHoverController>();
const activeControllers = new Set<NameHoverController>();
/** Cleanup compartido: una segunda llamada a init devuelve esta misma función. */
let teardownAll: (() => void) | null = null;

/** Limpieza inocua para SSR o entornos sin `matchMedia`. */
function noopCleanup(): void {}

function createController(root: HTMLElement, letters: HTMLElement[]): NameHoverController {
  const letterStates = new Map<HTMLElement, LetterState>();
  for (const letter of letters) {
    letterStates.set(letter, { tiles: null, restoreTimer: null });
  }

  const fineHover = window.matchMedia(FINE_HOVER_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  let destroyed = false;

  const cancelRestore = (letter: HTMLElement): void => {
    const state = letterStates.get(letter);
    if (!state?.restoreTimer) return;
    clearTimeout(state.restoreTimer);
    state.restoreTimer = null;
  };

  const ensureTiles = (letter: HTMLElement): void => {
    const state = letterStates.get(letter);
    if (!state || state.tiles) return;
    const tiles: HTMLElement[] = [];
    for (const variant of TILE_VARIANTS) {
      const tile = document.createElement('span');
      tile.className = 'hero__name-tile';
      tile.setAttribute('data-variant', variant);
      tile.setAttribute('aria-hidden', 'true');
      // Decorativo e inerte incluso antes de los estilos de la Unidad C.
      tile.style.pointerEvents = 'none';
      tile.style.userSelect = 'none';
      letter.appendChild(tile);
      tiles.push(tile);
    }
    state.tiles = tiles;
  };

  const removeTiles = (letter: HTMLElement): void => {
    const state = letterStates.get(letter);
    if (!state?.tiles) return;
    for (const tile of state.tiles) tile.remove();
    state.tiles = null;
  };

  /** Retiro inmediato de una letra: sin esperar los 180 ms ni dejar estado efímero. */
  const resetLetter = (letter: HTMLElement): void => {
    cancelRestore(letter);
    letter.removeAttribute('data-active');
    letter.removeAttribute('data-active-variant');
    removeTiles(letter);
  };

  const handleEnter = (event: PointerEvent): void => {
    const letter = event.currentTarget;
    if (!(letter instanceof HTMLElement) || event.pointerType !== 'mouse') return;
    if (!fineHover.matches || reducedMotion.matches) return;
    // Reentrada: cancela la restauración pendiente sin mostrar el texto original.
    cancelRestore(letter);
    ensureTiles(letter);
    // Sorteo independiente por activación: no alterna ni reutiliza un resultado previo.
    letter.setAttribute(
      'data-active-variant',
      String(Math.floor(Math.random() * TILE_VARIANTS.length))
    );
    // `data-active` nunca se retira entre variantes: solo cruzan las opacidades de los tiles.
    letter.setAttribute('data-active', '');
  };

  const handleLeave = (event: PointerEvent): void => {
    const letter = event.currentTarget;
    if (!(letter instanceof HTMLElement) || !letter.hasAttribute('data-active')) return;
    cancelRestore(letter);
    const state = letterStates.get(letter);
    if (!state) return;
    state.restoreTimer = setTimeout(() => {
      state.restoreTimer = null;
      letter.removeAttribute('data-active');
    }, RESTORE_DELAY_MS);
  };

  const handleEnvironmentChange = (): void => {
    // Volver a un entorno válido no autoactiva ninguna letra: exige un nuevo pointerenter.
    if (fineHover.matches && !reducedMotion.matches) return;
    for (const letter of letterStates.keys()) resetLetter(letter);
  };

  // `pointerenter` no burbujea: un listener por letra, sin delegación global.
  for (const letter of letterStates.keys()) {
    letter.addEventListener('pointerenter', handleEnter);
    letter.addEventListener('pointerleave', handleLeave);
  }
  fineHover.addEventListener('change', handleEnvironmentChange);
  reducedMotion.addEventListener('change', handleEnvironmentChange);

  const controller: NameHoverController = {
    root,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const letter of letterStates.keys()) resetLetter(letter);
      for (const letter of letterStates.keys()) {
        letter.removeEventListener('pointerenter', handleEnter);
        letter.removeEventListener('pointerleave', handleLeave);
      }
      fineHover.removeEventListener('change', handleEnvironmentChange);
      reducedMotion.removeEventListener('change', handleEnvironmentChange);
      controllers.delete(root);
      activeControllers.delete(controller);
    },
  };
  return controller;
}

/**
 * Inicializa el efecto de hover del nombre del Hero. SSR-safe: al importar nada
 * accede a `document`/`window`, y al invocar sin DOM o sin `matchMedia` retorna
 * un cleanup inocuo. El estado se guarda por raíz en un `WeakMap`: una segunda
 * llamada no agrega listeners y devuelve el mismo cleanup. Una raíz con otra
 * cantidad de letras que las once del contrato queda como no-op, sin listeners
 * parciales. El cleanup cancela timers, retira listeners, tiles y atributos
 * efímeros, y permite reinit posterior en DOM nuevo o reemplazado.
 */
export function initHeroNameHover(): () => void {
  if (
    typeof document === 'undefined' ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return noopCleanup;
  }

  let boundNewRoot = false;
  document.querySelectorAll<HTMLElement>('[data-hero-name]').forEach((root) => {
    if (controllers.has(root)) return;
    const letters = root.querySelectorAll<HTMLElement>('[data-hero-name-letter]');
    if (letters.length !== LETTER_COUNT) return;
    const controller = createController(root, Array.from(letters));
    controllers.set(root, controller);
    activeControllers.add(controller);
    boundNewRoot = true;
  });

  if (!boundNewRoot && !teardownAll) return noopCleanup;
  if (!teardownAll) {
    teardownAll = () => {
      for (const controller of [...activeControllers]) controller.destroy();
      activeControllers.clear();
    };
  }
  return teardownAll;
}
