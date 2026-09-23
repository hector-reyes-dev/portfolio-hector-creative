// Feature: Hover letra→tile del nombre del Hero («Héctor Reyes»)
// @vitest-environment jsdom
//
// Scenario: Importar e inicializar el hover del nombre durante un render de servidor
// Given un entorno sin `document` (o sin `matchMedia`)
// When se importa el módulo, se invoca initHeroNameHover() y se ejecuta su limpieza
// Then ninguna de las operaciones falla ni toca el DOM
//
// Scenario: el controller por raíz sortea, demora y limpia de forma determinista
// Given el h1 del Hero con sus once letras y un espacio textual real
// And matchMedia controlado (jsdom no lo implementa) y reloj falso para el delay de 180 ms
// When el puntero mouse entra y sale de las letras bajo hover fino y sin movimiento reducido
// Then cada activación sortea una de dos variantes sin reemplazar el texto de la letra
// And la restauración ocurre justo a los 180 ms y una reentrada la cancela sin texto intermedio
// And reduce o la pérdida de hover fino retiran tiles y timers de inmediato, sin autoactivar al volver
// And el cleanup repetido deja el DOM como al inicio y el reinit no duplica listeners ni tiles
//
// Harness: el SSR-safety se simula anulando los globales `document`/`window` con
// `vi.stubGlobal` (el docblock de entorno es por archivo); el resto usa jsdom real.
// El sorteo se fuerza con `Math.random` espiado en 0 y casi 1: cada activación consulta
// una vez el azar, sin falsear la independencia entre activaciones. Los diez hovers del
// spec son comprobación observacional de navegador (Unidad D); aquí se fuerzan ambos
// resultados. jsdom no pinta transiciones: el fade de 150 ms es contrato CSS de la Unidad C.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initHeroNameHover } from '@lib/core/hero-name-hover';

const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

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
/* Fixture del h1 del Hero (contrato de marcado de la Unidad A)        */
/* ------------------------------------------------------------------ */

// Once letras con slot estable de dos dígitos: la clave no es el glifo, así las
// dos «e» se distinguen. Espejo de la lista de Hero.astro, verificada aparte
// por navigation-semantics.test.ts sobre el componente renderizado real.
const NAME_LETTERS = [
  { slot: '00', glyph: 'H' },
  { slot: '01', glyph: 'é' },
  { slot: '02', glyph: 'c' },
  { slot: '03', glyph: 't' },
  { slot: '04', glyph: 'o' },
  { slot: '05', glyph: 'r' },
  { slot: '06', glyph: 'R' },
  { slot: '07', glyph: 'e' },
  { slot: '08', glyph: 'y' },
  { slot: '09', glyph: 'e' },
  { slot: '10', glyph: 's' }
] as const;

// Nombre accesible explícito del h1, derivado de la misma lista: espejo del contrato de
// Hero.astro (verificado sobre el componente real por navigation-semantics.test.ts).
const HERO_NAME = [
  NAME_LETTERS.slice(0, 6).map(({ glyph }) => glyph).join(''),
  NAME_LETTERS.slice(6).map(({ glyph }) => glyph).join('')
].join(' ');

/** Monta el h1 del Hero; `letterCount` menor que 11 produce una raíz incompleta. */
function mountName(letterCount: number = NAME_LETTERS.length): HTMLHeadingElement {
  const root = document.createElement('h1');
  root.className = 'hero__name';
  root.setAttribute('data-hero-name', '');
  root.setAttribute('aria-label', HERO_NAME);
  const letters = NAME_LETTERS.slice(0, letterCount).map(({ slot, glyph }) => {
    const letter = document.createElement('span');
    letter.className = 'hero__name-letter';
    letter.setAttribute('data-hero-name-letter', '');
    letter.setAttribute('data-slot', slot);
    letter.textContent = glyph;
    root.appendChild(letter);
    return letter;
  });
  // El espacio real entre «Héctor» y «Reyes» vive como nodo de texto del h1.
  if (letterCount === NAME_LETTERS.length) {
    root.insertBefore(document.createTextNode(' '), letters[6]);
  }
  document.body.appendChild(root);
  return root;
}

function lettersOf(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-hero-name-letter]'));
}

function tilesOf(letter: HTMLElement): HTMLElement[] {
  return Array.from(letter.querySelectorAll<HTMLElement>('.hero__name-tile'));
}

/** Entrada/salida de puntero: `pointerenter` no burbujea, se despacha en la letra. */
function pointerEvent(type: 'pointerenter' | 'pointerleave', pointerType: string): PointerEvent {
  return new PointerEvent(type, { bubbles: false, pointerType });
}

function hoverLetter(letter: HTMLElement, pointerType = 'mouse'): void {
  letter.dispatchEvent(pointerEvent('pointerenter', pointerType));
}

function leaveLetter(letter: HTMLElement, pointerType = 'mouse'): void {
  letter.dispatchEvent(pointerEvent('pointerleave', pointerType));
}

/* ------------------------------------------------------------------ */
/* Harness común                                                       */
/* ------------------------------------------------------------------ */

let media: MatchMediaControl;
let cleanups: (() => void)[] = [];
const originalMatchMedia = window.matchMedia;

/** Init que registra su cleanup para el afterEach: ningún controller escapa del test. */
function initName(): () => void {
  const cleanup = initHeroNameHover();
  cleanups.push(cleanup);
  return cleanup;
}

beforeEach(() => {
  vi.useFakeTimers();
  media = installMatchMedia({ [FINE_HOVER_QUERY]: true, [REDUCED_MOTION_QUERY]: false });
});

afterEach(() => {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.matchMedia = originalMatchMedia;
  document.body.innerHTML = '';
});

describe('Hover del nombre del Hero sin DOM', () => {
  it('se inicializa como no-op en lugar de fallar', () => {
    // El docblock de entorno es por archivo: el SSR se simula anulando los globales.
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('window', undefined);

    const cleanup = initHeroNameHover();

    expect(cleanup).toBeTypeOf('function');
    expect(() => cleanup()).not.toThrow();
    // La limpieza es idempotente: repetirla tampoco lanza ni toca el DOM.
    expect(() => cleanup()).not.toThrow();
  });

  it('sin matchMedia también retorna un cleanup inocuo', () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;

    const cleanup = initHeroNameHover();

    expect(cleanup).toBeTypeOf('function');
    expect(() => cleanup()).not.toThrow();
    expect(() => cleanup()).not.toThrow();
  });
});

describe('Inicialización por raíz', () => {
  it('una raíz incompleta queda como no-op, sin listeners parciales', () => {
    const root = mountName(5);
    const letters = lettersOf(root);
    const spies = letters.map((letter) => vi.spyOn(letter, 'addEventListener'));

    const cleanup = initName();

    expect(cleanup).toBeTypeOf('function');
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    hoverLetter(letters[0]);
    expect(letters[0].hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letters[0])).toHaveLength(0);
  });

  it('inicializar dos veces no duplica listeners y devuelve el mismo cleanup', () => {
    const root = mountName();
    const letters = lettersOf(root);
    const spies = letters.map((letter) => vi.spyOn(letter, 'addEventListener'));

    const first = initName();
    const second = initName();

    expect(second).toBe(first);
    for (const spy of spies) {
      expect(spy.mock.calls.filter(([type]) => type === 'pointerenter')).toHaveLength(1);
      expect(spy.mock.calls.filter(([type]) => type === 'pointerleave')).toHaveLength(1);
    }
    expect(media.listenerCount(FINE_HOVER_QUERY)).toBe(1);
    expect(media.listenerCount(REDUCED_MOTION_QUERY)).toBe(1);
  });
});

describe('Activación y sorteo de variantes', () => {
  it('cada activación sortea una de dos variantes de forma independiente', () => {
    const root = mountName();
    const letter = lettersOf(root)[4];
    initName();
    const random = vi.spyOn(Math, 'random');

    random.mockReturnValue(0); // floor(0 * 2) = 0
    hoverLetter(letter);
    expect(letter.getAttribute('data-active-variant')).toBe('0');
    expect(letter.hasAttribute('data-active')).toBe(true);

    leaveLetter(letter);
    vi.advanceTimersByTime(180);
    expect(letter.hasAttribute('data-active')).toBe(false);

    random.mockReturnValue(0.999999); // floor(1.999998) = 1
    hoverLetter(letter);
    expect(letter.getAttribute('data-active-variant')).toBe('1');
    expect(letter.hasAttribute('data-active')).toBe(true);

    // Una consulta al azar por activación: sin alternancia obligatoria ni sorteo global.
    expect(random).toHaveBeenCalledTimes(2);
  });

  it('tras la primera activación cada slot tiene dos tiles vacíos y el texto del h1 queda intacto', () => {
    const root = mountName();
    const letters = lettersOf(root);
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    for (const letter of letters) {
      hoverLetter(letter);
      const tiles = tilesOf(letter);
      expect(tiles).toHaveLength(2);
      expect(tiles.map((tile) => tile.getAttribute('data-variant'))).toEqual(['0', '1']);
      for (const tile of tiles) {
        expect(tile.className).toBe('hero__name-tile');
        expect(tile.getAttribute('aria-hidden')).toBe('true');
        expect(tile.textContent).toBe('');
      }
    }

    // Los tiles son vacíos y decorativos: el nombre accesible/copiable no cambia. El
    // contrato de nombre accesible es explícito: el h1 lleva `aria-label` —observado en
    // navegador real, los spans inline-block nombran el h1 letra a letra («H é c t o r
    // R e y e s») aunque `textContent` sea exacto—. El `aria-label` coincide byte a byte
    // con el texto visible (Label in Name, WCAG 2.5.3) y sin `aria-labelledby` ni texto
    // oculto adicional el nombre no se duplica. Las letras no son paradas de teclado.
    expect(root.textContent).toBe('Héctor Reyes');
    expect(root.getAttribute('aria-label')).toBe('Héctor Reyes');
    expect(root.getAttribute('aria-labelledby')).toBe(null);
    for (const letter of letters) {
      expect(letter.getAttribute('tabindex')).toBe(null);
      expect(letter.getAttribute('role')).toBe(null);
    }
    // La paridad exacta del `aria-label` servido por el componente real la verifica
    // navigation-semantics.test.ts sobre la página renderizada; jsdom no expone árbol
    // de accesibilidad, así que el anuncio real queda para la Unidad D.
  });
});

describe('Restauración demorada de 180 ms', () => {
  it('la letra se restaura justo al cumplir 180 ms, no antes', () => {
    const root = mountName();
    const letter = lettersOf(root)[0];
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    hoverLetter(letter);
    leaveLetter(letter);

    vi.advanceTimersByTime(179);
    expect(letter.hasAttribute('data-active')).toBe(true); // visible durante el delay
    vi.advanceTimersByTime(1);
    expect(letter.hasAttribute('data-active')).toBe(false); // restaurado a los 180 ms
  });

  it('reentrar antes de 180 ms cancela la restauración sin mostrar el texto', () => {
    const root = mountName();
    const letter = lettersOf(root)[0];
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    hoverLetter(letter);
    leaveLetter(letter);
    vi.advanceTimersByTime(120);
    hoverLetter(letter); // reentrada dentro del delay

    // El temporizador pendiente quedó cancelado: pase lo que pase, no expira.
    vi.advanceTimersByTime(600);
    expect(letter.hasAttribute('data-active')).toBe(true);

    // Una salida posterior programa un delay completo desde cero.
    leaveLetter(letter);
    vi.advanceTimersByTime(179);
    expect(letter.hasAttribute('data-active')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(letter.hasAttribute('data-active')).toBe(false);
  });

  it('letras distintas mantienen temporizadores independientes', () => {
    const letters = lettersOf(mountName());
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = letters[0];
    const second = letters[5];

    hoverLetter(first);
    leaveLetter(first); // restauraría en t=180
    vi.advanceTimersByTime(100);
    hoverLetter(second);
    leaveLetter(second); // restauraría en t=280

    vi.advanceTimersByTime(80); // t=180
    expect(first.hasAttribute('data-active')).toBe(false);
    expect(second.hasAttribute('data-active')).toBe(true);

    vi.advanceTimersByTime(99); // t=279
    expect(second.hasAttribute('data-active')).toBe(true);
    vi.advanceTimersByTime(1); // t=280
    expect(second.hasAttribute('data-active')).toBe(false);
  });
});

describe('Gates de entorno: hover fino, movimiento reducido e híbridos', () => {
  it('con reduce activo al cargar ninguna letra muestra tiles', () => {
    media = installMatchMedia({ [FINE_HOVER_QUERY]: true, [REDUCED_MOTION_QUERY]: true });
    const letter = lettersOf(mountName())[0];

    initName();
    hoverLetter(letter);

    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);
  });

  it('sin hover fino al cargar el efecto tampoco arranca', () => {
    media = installMatchMedia({ [FINE_HOVER_QUERY]: false, [REDUCED_MOTION_QUERY]: false });
    const letter = lettersOf(mountName())[0];

    initName();
    hoverLetter(letter);

    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);
  });

  it('un cambio dinámico a reduce retira el tile de inmediato y la recuperación no autoactiva', () => {
    const letter = lettersOf(mountName())[0];
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    hoverLetter(letter);
    expect(letter.hasAttribute('data-active')).toBe(true);
    leaveLetter(letter); // restauración pendiente en t=180
    vi.advanceTimersByTime(50);

    media.change(REDUCED_MOTION_QUERY, true);
    // Retiro inmediato: sin avanzar los relojes, el delay de 180 ms no aplica.
    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(letter.hasAttribute('data-active-variant')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);
    vi.advanceTimersByTime(1000);
    expect(letter.hasAttribute('data-active')).toBe(false);

    // Volver a no-preference no reanuda el efecto: exige una nueva activación.
    media.change(REDUCED_MOTION_QUERY, false);
    vi.advanceTimersByTime(1000);
    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);

    hoverLetter(letter);
    expect(letter.hasAttribute('data-active')).toBe(true);
    expect(tilesOf(letter)).toHaveLength(2);
  });

  it('perder el hover fino retira también los tiles activos y no autoactiva al volver', () => {
    const letter = lettersOf(mountName())[0];
    initName();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    hoverLetter(letter);
    expect(letter.hasAttribute('data-active')).toBe(true);

    media.change(FINE_HOVER_QUERY, false);
    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);

    media.change(FINE_HOVER_QUERY, true);
    vi.advanceTimersByTime(1000);
    expect(letter.hasAttribute('data-active')).toBe(false);
  });

  it('eventos touch y pen de un híbrido no activan el efecto; el mouse sí', () => {
    const letter = lettersOf(mountName())[0];
    initName();

    hoverLetter(letter, 'touch');
    expect(letter.hasAttribute('data-active')).toBe(false);
    hoverLetter(letter, 'pen');
    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);

    hoverLetter(letter, 'mouse');
    expect(letter.hasAttribute('data-active')).toBe(true);
    expect(tilesOf(letter)).toHaveLength(2);
  });
});

describe('Cleanup y reinit', () => {
  it('el cleanup retira listeners, tiles y atributos, y es idempotente', () => {
    const root = mountName();
    const letters = lettersOf(root);
    const removeSpies = letters.map((letter) => vi.spyOn(letter, 'removeEventListener'));

    const cleanup = initName();
    const letter = letters[7];
    vi.spyOn(Math, 'random').mockReturnValue(0);
    hoverLetter(letter);
    leaveLetter(letter); // temporizador pendiente

    cleanup();
    cleanup(); // idempotente

    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(letter.hasAttribute('data-active-variant')).toBe(false);
    expect(tilesOf(letter)).toHaveLength(0);
    for (const spy of removeSpies) {
      expect(spy.mock.calls.filter(([type]) => type === 'pointerenter')).toHaveLength(1);
      expect(spy.mock.calls.filter(([type]) => type === 'pointerleave')).toHaveLength(1);
    }
    expect(media.listenerCount(FINE_HOVER_QUERY)).toBe(0);
    expect(media.listenerCount(REDUCED_MOTION_QUERY)).toBe(0);
    // El temporizador de restauración pendiente quedó cancelado con el cleanup.
    vi.advanceTimersByTime(1000);
    expect(letter.hasAttribute('data-active')).toBe(false);
  });

  it('reinit tras el cleanup no duplica listeners ni tiles', () => {
    const root = mountName();
    const letters = lettersOf(root);
    const letter = letters[2];

    const first = initName();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    hoverLetter(letter);
    expect(tilesOf(letter)).toHaveLength(2);
    first();

    const second = initName();
    random.mockClear(); // descarta la consulta de la activación previa al cleanup
    hoverLetter(letter);
    // Un solo listener vivo por letra: una sola consulta al azar por activación.
    expect(random).toHaveBeenCalledTimes(1);
    expect(tilesOf(letter)).toHaveLength(2);
    expect(letter.hasAttribute('data-active')).toBe(true);

    // El ciclo completo sigue funcional tras el reinit.
    leaveLetter(letter);
    vi.advanceTimersByTime(180);
    expect(letter.hasAttribute('data-active')).toBe(false);
    expect(second).toBe(first); // el cleanup compartido sigue siendo el mismo
  });
});
