/** Una sola silueta evita que el indicador descubra esquinas de otro fondo. */
export function initBlogSurface(root: HTMLElement): ((percent: number) => void) | undefined {
  const wrap = root.querySelector<HTMLElement>('.blog__tabs-wrap');
  const count = root.querySelectorAll('[data-blog-tab]').length;
  if (!wrap || !count || !root.clientWidth) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  svg.classList.add('blog__shape');
  svg.setAttribute('aria-hidden', 'true');
  svg.append(path);
  wrap.prepend(svg);

  let percent = 0;
  let width = 0;
  let height = 0;
  let shoulder = 0;
  let radius = 0;
  let top = 0;
  let crown = 0;
  let inset = 0;

  const draw = (position: number): void => {
    percent = position;
    // La franja de pestañas deja libre un margen a cada lado, así que la pestaña activa
    // nunca llega a los extremos del panel: siempre queda sitio para su concavidad y para
    // la esquina exterior de ese lado. Ningún radio depende entonces de dónde esté la
    // pestaña —la silueta no se deforma al cambiar de tema, solo se traslada— y ninguna
    // esquina puede verse nacer o cerrarse a media transición.
    const tabWidth = (width - inset * 2) / count;
    const left = inset + tabWidth * Math.max(0, Math.min(count - 1, percent / 100));
    const right = left + tabWidth;
    // Arcos de círculo, no curvas cuadráticas: una cuadrática con el control en el
    // vértice se aleja un 6% del círculo y deja la esquina más cuadrada que el
    // `border-radius` del resto del sitio. Las convexas giran en un sentido (0) y las
    // cóncavas de la unión en el contrario (1).
    const convex = (r: number, x: number, y: number): string => `A ${r} ${r} 0 0 0 ${x} ${y}`;
    const concave = (r: number, x: number, y: number): string => `A ${r} ${r} 0 0 1 ${x} ${y}`;
    path.setAttribute('d', [
      `M 0 ${height - radius} ${convex(radius, radius, height)}`,
      `H ${width - radius} ${convex(radius, width, height - radius)}`,
      `V ${shoulder + radius} ${convex(radius, width - radius, shoulder)}`,
      `H ${right + crown} ${concave(crown, right, shoulder - crown)}`,
      `V ${top + crown} ${convex(crown, right - crown, top)}`,
      `H ${left + crown} ${convex(crown, left, top + crown)}`,
      `V ${shoulder - crown} ${concave(crown, left - crown, shoulder)}`,
      `H ${radius} ${convex(radius, 0, shoulder + radius)} Z`
    ].join(' '));
  };

  const measure = (): void => {
    width = root.clientWidth;
    height = root.clientHeight;
    shoulder = wrap.offsetHeight;
    // El alzado de la pestaña es el relleno superior del contenedor: se lee del CSS
    // en vez de repetirlo aquí, para que trazado y maquetación no puedan separarse.
    top = parseFloat(getComputedStyle(wrap).paddingTop);
    radius = parseFloat(getComputedStyle(root).getPropertyValue('--blog-radius'));
    // El margen libre lo fija el mismo CSS que separa las pestañas de los bordes, y el
    // radio de la pestaña no puede pasar de lo que ese margen deja tras la esquina
    // exterior ni de la mitad de su alzado, o las dos curvas de un lado se cruzarían.
    inset = parseFloat(getComputedStyle(wrap).paddingLeft);
    crown = Math.min(radius, (shoulder - top) / 2, inset - radius);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;
    draw(percent);
    root.classList.add('blog--continuous');
  };

  measure();
  // Solo se mide al redimensionar; cada frame actualiza únicamente el trazado.
  const observer = new ResizeObserver(measure);
  observer.observe(root);
  observer.observe(wrap);
  return draw;
}
