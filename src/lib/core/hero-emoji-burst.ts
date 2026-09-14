// Inicializador visual de la ráfaga de emojis del retrato del Hero.
// Estado puramente efímero: no persiste datos, no importa features ni toca el tema.

const EMOJIS = [
  '💻',
  '🛒',
  '🔍',
  '🤖',
  '📊',
  '🏗️',
  '🐕',
  '🏘️',
  '💰',
  '📝',
  '🇲🇽',
  '⚙️',
  '🧩',
  '📈',
  '🗂️',
  '🚀',
  '🧠',
  '📱',
  '💼',
  '🌐',
] as const;

const PARTICLE_COUNT = 12;
// Milisegundos de aparición y de desvanecimiento al inicio/final del recorrido continuo.
const FADE_MS = 100;
// Holgura horizontal para que el glifo más grande (32 px) rotado no desborde el viewport.
const VIEWPORT_MARGIN = 44;

interface BurstRoot {
  trigger: HTMLButtonElement;
  layer: HTMLElement;
  particles: HTMLElement[];
  animations: Animation[];
}

const initialized = new WeakSet<HTMLElement>();
const roots = new Set<BurstRoot>();
let reduceListenerBound = false;

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clearBurst(root: BurstRoot): void {
  for (const animation of root.animations) {
    animation.cancel();
  }
  for (const node of root.particles) {
    node.remove();
  }
  root.animations.length = 0;
  root.particles.length = 0;
}

function emitBurst(root: BurstRoot): void {
  const { layer } = root;
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }
  if (typeof layer.animate !== 'function') return;

  clearBurst(root);

  const rect = layer.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const leftRoom = Math.max(rect.left - VIEWPORT_MARGIN, 0);
  const rightRoom = Math.max(viewportWidth - VIEWPORT_MARGIN - rect.left, 0);

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const size = random(18, 32);
    const burstAngle = random(0, Math.PI * 2);
    const cosAngle = Math.cos(burstAngle);
    const sinAngle = Math.sin(burstAngle);
    // A mitad de camino entre el centro (posición anterior) y el borde circular (posición actual).
    const edgeRadius = (Math.min(rect.width, rect.height) / 2 + 4) / 2;
    const originX = rect.width / 2 + cosAngle * edgeRadius;
    const originY = rect.height / 2 + sinAngle * edgeRadius;
    const travel = random(83, 155);
    const totalDistanceX = Math.min(Math.max(cosAngle * (edgeRadius + travel), -leftRoom), rightRoom);
    const burstX = totalDistanceX - cosAngle * edgeRadius;
    const burstY = sinAngle * travel;
    const rotationStart = random(-30, 30);
    const rotationEnd = random(-100, 100);
    const duration = random(950, 1500) / 1.5;
    const delay = random(0, 140) / 1.5;
    const appearOffset = FADE_MS / duration;
    const fadeStartOffset = 1 - FADE_MS / duration;

    const node = document.createElement('span');
    node.className = 'hero-portrait__particle';
    node.setAttribute('aria-hidden', 'true');
    node.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? EMOJIS[0];
    node.style.fontSize = `${size.toFixed(1)}px`;
    node.style.left = `${originX.toFixed(1)}px`;
    node.style.top = `${originY.toFixed(1)}px`;
    node.style.opacity = '0';

    const keyframes: Keyframe[] = [
      {
        offset: 0,
        opacity: 0,
        transform: `translate(-50%, -50%) scale(0.2) rotate(${rotationStart.toFixed(1)}deg)`,
      },
      {
        offset: appearOffset,
        opacity: 1,
      },
      {
        offset: fadeStartOffset,
        opacity: 1,
      },
      {
        offset: 1,
        opacity: 0,
        transform: `translate(-50%, -50%) translate(${burstX.toFixed(1)}px, ${burstY.toFixed(1)}px) scale(1) rotate(${rotationEnd.toFixed(1)}deg)`,
      },
    ];

    layer.appendChild(node);
    const animation = node.animate(keyframes, {
      duration,
      delay,
      easing: 'ease-out',
      fill: 'both',
    });

    root.particles.push(node);
    root.animations.push(animation);

    const cleanup = (): void => {
      node.remove();
      root.particles = root.particles.filter((particle) => particle !== node);
      root.animations = root.animations.filter((active) => active !== animation);
    };
    animation.addEventListener('finish', cleanup, { once: true });
    animation.finished.catch(() => {});
  }
}

function bindRoot(root: BurstRoot): void {
  const { trigger } = root;
  const hoverCapable = window.matchMedia('(hover: hover)');

  trigger.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !hoverCapable.matches) return;
    emitBurst(root);
  });

  trigger.addEventListener('click', (event) => {
    if (event.detail === 0) {
      // Activación por teclado, tecnología asistiva o click programático.
      emitBurst(root);
      return;
    }
    const pointerType = (event as PointerEvent).pointerType;
    if (pointerType === 'mouse' && hoverCapable.matches) {
      // Un mouse con hover ya emitió al entrar; su click no duplica.
      return;
    }
    emitBurst(root);
  });

  trigger.addEventListener('keydown', (event) => {
    if (!event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }
  });
}

export function initHeroEmojiBurst(): void {
  document.querySelectorAll<HTMLElement>('[data-hero-portrait]').forEach((portrait) => {
    if (initialized.has(portrait)) return;
    const trigger = portrait.querySelector<HTMLButtonElement>('[data-hero-portrait-trigger]');
    const layer = portrait.querySelector<HTMLElement>('[data-hero-emoji-layer]');
    if (!trigger || !layer) return;

    initialized.add(portrait);
    const root: BurstRoot = { trigger, layer, particles: [], animations: [] };
    roots.add(root);
    bindRoot(root);
  });

  if (reduceListenerBound || typeof window.matchMedia !== 'function') return;
  reduceListenerBound = true;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
    if (!event.matches) return;
    for (const root of roots) clearBurst(root);
  });
}
