import {
  BLOG_TOPICS,
  formatShortDate,
  groupPostsByTopic,
  type BlogTopic,
  type PostLike
} from './blog-posts';

/**
 * Nota resuelta para pintar: el panel expone únicamente su título y su fecha,
 * nunca la descripción, las etiquetas ni el nombre de archivo.
 */
export interface BlogEntryView {
  title: string;
  /** Fecha ISO que consume el atributo `datetime` de `time`. */
  isoDate: string;
  /** Fecha corta visible (`ago 2026`). */
  dateLabel: string;
}

/** Tema con sus notas listas para pintar, en el orden explícito de las pestañas. */
export interface BlogTopicView {
  id: BlogTopic;
  label: string;
  entries: BlogEntryView[];
}

/**
 * Prepara el archivo del blog: agrupa las publicaciones por tema (sin borradores,
 * por fecha descendente, hasta cinco por tema) y las reduce a lo que el panel
 * muestra. Un tema sin notas publicadas no genera pestaña.
 */
export function buildBlogTopics(posts: readonly PostLike[]): BlogTopicView[] {
  const groups = groupPostsByTopic(posts);

  return BLOG_TOPICS.filter((topic) => groups.has(topic.id)).map((topic) => ({
    id: topic.id,
    label: topic.label,
    // Stryker: mutante sin cobertura — el `filter` previo ya garantiza el grupo; el `??` solo
    // cierra el tipo opcional de `Map.get`.
    entries: (groups.get(topic.id) ?? []).map((post) => ({
      title: post.title,
      isoDate: new Date(post.pubDate).toISOString(),
      dateLabel: formatShortDate(post.pubDate)
    }))
  }));
}

/** Entidades mínimas para interpolar títulos y etiquetas en el marcado y sus atributos. */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/** Una nota: título y fecha, sin ningún otro contenido. */
function renderEntry(entry: BlogEntryView): string {
  return `<article class="blog__entry" data-blog-entry>
<h3 class="blog__title" data-blog-title>${escapeHtml(entry.title)}</h3>
<time class="blog__date" data-blog-date datetime="${entry.isoDate}">${entry.dateLabel}</time>
</article>`;
}

/**
 * Marcado del archivo: una pestaña por tema sobre una única superficie gris y un
 * panel por tema, con la primera pestaña seleccionada y visible al servirse.
 *
 * Vive aquí —y no en el `.astro`— porque la suite comprueba los contratos de
 * marcado contra este mismo render, no contra una réplica de test.
 */
export function renderBlogArchive(topics: readonly BlogTopicView[]): string {
  // Stryker: sobrevivientes equivalentes — los `join('\n')` y el hueco del panel visible son
  // formato del HTML servido: el salto de línea entre hermanos no crea nodos que el archivo
  // muestre, y el texto suelto que el mutante mete en la etiqueta del primer panel se parsea
  // como atributos inertes sin devolverle el `hidden`.
  const tabs = topics
    .map(
      (topic, index) => `<button class="blog__tab" type="button" role="tab" data-blog-tab id="blog-tab-${topic.id}" aria-controls="blog-panel-${topic.id}" aria-selected="${String(index === 0)}" tabindex="${index === 0 ? 0 : -1}">${escapeHtml(topic.label)}</button>`
    )
    .join('\n');

  const panels = topics
    .map(
      (topic, index) => `<div class="blog__panel" role="tabpanel" data-blog-panel id="blog-panel-${topic.id}" aria-labelledby="blog-tab-${topic.id}"${index === 0 ? '' : ' hidden'}>
<div class="blog__list">
${topic.entries.map(renderEntry).join('\n')}
</div>
</div>`
    )
    .join('\n');

  return `<div class="blog" data-blog>
<div class="blog__tabs-wrap">
<span class="blog__highlight" data-blog-highlight aria-hidden="true"></span>
<div class="blog__tabs" role="tablist" aria-label="Notas por tema">
${tabs}
</div>
</div>
${panels}
</div>`;
}
