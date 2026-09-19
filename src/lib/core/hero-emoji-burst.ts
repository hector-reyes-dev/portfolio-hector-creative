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

/** Espacio lateral disponible para el desplazamiento, medido desde la capa. */
interface BurstRoom {
  left: number;
  right: number;
}

interface ParticlePlan {
  size: number;
  originX: number;
  originY: number;
  burstX: number;
  burstY: number;
  rotationStart: number;
  rotationEnd: number;
  duration: number;
  delay: number;
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

/** Sin preferencia de movimiento ni Web Animations no hay ráfaga posible. */
function burstBlocked(layer: HTMLElement): boolean {
  // Stryker: sobreviviente equivalente — `bindRoot` ya exigió `window.matchMedia` al
  // inicializar, así que en toda emisión real la función existe.
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced || typeof layer.animate !== 'function';
}

/** Holgura lateral disponible; `null` cuando la capa no tiene geometría que animar. */
function measureRoom(rect: DOMRect): BurstRoom | null {
  if (rect.width === 0 || rect.height === 0) return null;
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  return {
    left: Math.max(rect.left - VIEWPORT_MARGIN, 0),
    right: Math.max(viewportWidth - VIEWPORT_MARGIN - rect.left, 0),
  };
}

/** Azar y geometría de una partícula: se sortea en el mismo orden que la ráfaga original. */
function planParticle(rect: DOMRect, room: BurstRoom): ParticlePlan {
  const size = random(18, 32);
  const burstAngle = random(0, Math.PI * 2);
  const cosAngle = Math.cos(burstAngle);
  const sinAngle = Math.sin(burstAngle);
  // A mitad de camino entre el centro (posición anterior) y el borde circular (posición actual).
  const edgeRadius = (Math.min(rect.width, rect.height) / 2 + 4) / 2;
  const originX = rect.width / 2 + cosAngle * edgeRadius;
  const originY = rect.height / 2 + sinAngle * edgeRadius;
  const travel = random(83, 155);
  const totalDistanceX = Math.min(Math.max(cosAngle * (edgeRadius + travel), -room.left), room.right);
  return {
    size,
    originX,
    originY,
    burstX: totalDistanceX - cosAngle * edgeRadius,
    burstY: sinAngle * travel,
    rotationStart: random(-30, 30),
    rotationEnd: random(-100, 100),
    duration: random(950, 1500) / 1.5,
    delay: random(0, 140) / 1.5,
  };
}

/** Aparición, permanencia y desvanecimiento, con el desplazamiento ya acotado al espacio. */
function particleKeyframes(plan: ParticlePlan): Keyframe[] {
  const appearOffset = FADE_MS / plan.duration;
  const fadeStartOffset = 1 - FADE_MS / plan.duration;
  return [
    {
      offset: 0,
      opacity: 0,
      transform: `translate(-50%, -50%) scale(0.2) rotate(${plan.rotationStart.toFixed(1)}deg)`,
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
      transform: `translate(-50%, -50%) translate(${plan.burstX.toFixed(1)}px, ${plan.burstY.toFixed(1)}px) scale(1) rotate(${plan.rotationEnd.toFixed(1)}deg)`,
    },
  ];
}

/** Nodo decorativo y no enfocable: la capa es `aria-hidden` y el glifo nunca recibe foco. */
function createParticleNode(plan: ParticlePlan): HTMLElement {
  const node = document.createElement('span');
  node.className = 'hero-portrait__particle';
  node.setAttribute('aria-hidden', 'true');
  node.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? EMOJIS[0];
  node.style.fontSize = `${plan.size.toFixed(1)}px`;
  node.style.left = `${plan.originX.toFixed(1)}px`;
  node.style.top = `${plan.originY.toFixed(1)}px`;
  node.style.opacity = '0';
  return node;
}

/** Monta la partícula, la anima y la retira de su raíz al terminar o al cancelarse. */
function startParticle(root: BurstRoot, layer: HTMLElement, plan: ParticlePlan): void {
  const node = createParticleNode(plan);
  layer.appendChild(node);
  const animation = node.animate(particleKeyframes(plan), {
    duration: plan.duration,
    delay: plan.delay,
    easing: 'ease-out',
    fill: 'both',
  });

  root.particles.push(node);
  root.animations.push(animation);

  const cleanup = (): void => {
    node.remove();
    // Stryker: sobrevivientes equivalentes — conservar la partícula ya retirada en la lista
    // (filtro siempre verdadero) solo provoca un `remove()` repetido sin efecto.
    root.particles = root.particles.filter((particle) => particle !== node);
    root.animations = root.animations.filter((active) => active !== animation);
  };
  // Stryker: sobreviviente equivalente — el motor emite `finish` una vez por animación y
  // la limpieza es idempotente: repetirla no cambia nodos ni listas.
  animation.addEventListener('finish', cleanup, { once: true });
  animation.finished.catch(() => {});
}

function emitBurst(root: BurstRoot): void {
  const { layer } = root;
  if (burstBlocked(layer)) return;

  clearBurst(root);

  const rect = layer.getBoundingClientRect();
  const room = measureRoom(rect);
  if (!room) return;

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    startParticle(root, layer, planParticle(rect, room));
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
