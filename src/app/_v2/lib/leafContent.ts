/**
 * The Neon page response can deliver a content item without its content document
 * (`files.content.data: null`, seen on live blogs), while `/api/nodes/<id>` returns it. Leaves read
 * headline, summary, byline and body from that document, so they fetch the node and use these helpers.
 */
type WithContent = { links?: unknown; files?: { content?: { data?: unknown } & Record<string, unknown> } & Record<string, unknown> };

export function hasContent(item: WithContent | null | undefined): boolean {
  const data = item?.files?.content?.data;
  return typeof data === 'object' && data !== null;
}

/**
 * A copy of `article` holding the fetched node's content document (and its links when the article has
 * none); `article` itself when the fetched node has no content either.
 */
export function withContent<T extends WithContent>(article: T, fetched: WithContent | null | undefined): T {
  if (!hasContent(fetched)) return article;
  return {
    ...article,
    // Same response gap for the picture links (main/teaser picture) as for the content.
    ...(article.links == null && fetched?.links != null ? { links: fetched.links } : {}),
    files: { ...article.files, content: { ...article.files?.content, data: fetched!.files!.content!.data } },
  };
}
