/** Temas del blog en el orden explícito de sus pestañas. */
export const BLOG_TOPICS = [
  { id: 'engineering', label: 'Ingeniería' },
  { id: 'design', label: 'Diseño' },
  { id: 'ai', label: 'IA' }
] as const;

export type BlogTopic = (typeof BLOG_TOPICS)[number]['id'];

/** Ids de tema: fuente única que consume el esquema de contenido. */
// Stryker: sobreviviente equivalente para la suite — este mapeo lo cubre el tipo: `z.enum` en
// `content.config.ts` rechaza en compilación cualquier lista que no sean estos ids.
export const BLOG_TOPIC_IDS = BLOG_TOPICS.map((topic) => topic.id);

/** Notas visibles por tema: las cinco más recientes; un tema con menos las conserva todas. */
export const MAX_POSTS_PER_TOPIC = 5;

/** Entrada laxa: sirve tanto para fixtures de test como para `CollectionEntry<'posts'>.data`. */
export interface PostLike {
  slug: string;
  title: string;
  pubDate: Date | string;
  topic: BlogTopic;
  draft?: boolean;
}

/**
 * Agrupa las entradas publicadas por tema, sin borradores.
 * Los grupos siguen el orden explícito de `BLOG_TOPICS` y, dentro de cada tema,
 * las entradas van por fecha descendente, recortadas a las `MAX_POSTS_PER_TOPIC` más
 * recientes (un tema con menos las conserva todas). Un tema sin publicaciones no aparece.
 */
export function groupPostsByTopic<T extends PostLike>(posts: readonly T[]): Map<BlogTopic, T[]> {
  const published = posts.filter((post) => post.draft !== true);
  const groups = new Map<BlogTopic, T[]>();

  for (const { id } of BLOG_TOPICS) {
    const bucket = published.filter((post) => post.topic === id);
    if (bucket.length === 0) continue;

    bucket.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    // El recorte va después de ordenar: descarta las más antiguas, nunca las más recientes.
    groups.set(id, bucket.slice(0, MAX_POSTS_PER_TOPIC));
  }

  return groups;
}

/** Abreviaturas de mes en español, sin punto: no dependen del locale del navegador. */
const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Fecha corta de mes y año (`ago 2026`), sin día, hora ni zona horaria. */
export function formatShortDate(date: Date | string): string {
  const value = new Date(date);
  // El frontmatter usa fechas sin hora (YYYY-MM-DD) y se parsean en UTC:
  // leerlas en UTC evita que la nota cambie de mes según el huso local.
  return `${SHORT_MONTHS[value.getUTCMonth()]} ${value.getUTCFullYear()}`;
}
