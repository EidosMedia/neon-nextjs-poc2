// Pure helpers shared by the v2 live blog feed (leaf) and timeline (item panel).
/* eslint-disable @typescript-eslint/no-explicit-any */

export type LiveblogPost = {
  id: string;
  // Neon content JSON, rendered by renderContent.
  content: any;
  publicationTime: string;
};

export const POLL_INTERVAL_MS = 10000;
export const TIMELINE_VISIBLE_POSTS = 3;

/** Posts already present in the page model (`children` are post ids; the post nodes carry the content). */
export function initialPostsFromModel(model: any): LiveblogPost[] {
  if (!Array.isArray(model?.children)) return [];
  return model.children.map((postId: string) => ({
    id: postId,
    content: model.nodes?.[postId]?.files?.content?.data,
    publicationTime: model.nodes?.[postId]?.sys?.postEventTime,
  }));
}

/** Merges polled posts (raw API shape or already mapped) into the known ones; the newest response wins per id. */
export function mergePosts(known: LiveblogPost[], polled: unknown): LiveblogPost[] {
  const incoming = Array.isArray(polled) ? polled : [];
  const seen = new Set<string>();
  const merged: LiveblogPost[] = [];
  for (const post of [...incoming, ...known]) {
    if (!post || seen.has(post.id)) continue;
    seen.add(post.id);
    merged.push({
      id: post.id,
      content: post.content || post.files?.content?.data,
      publicationTime: post.publicationTime || post.sys?.postEventTime,
    });
  }
  return merged;
}

const time = (post: { publicationTime: string }) => new Date(post.publicationTime).getTime();

export function sortNewestFirst<T extends { publicationTime: string }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => (time(b) || 0) - (time(a) || 0));
}

/** Feed stamp, e.g. "10:05 AM - March 3rd, 2026" (matches the legacy leaf feed). */
export function formatFeedStamp(publicationTime: string): string {
  const date = new Date(publicationTime);
  const clock = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const day = date
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .replace(/(\d+)(?=,)/, (match) => `${match}th`);
  return `${clock} - ${day}`;
}

export const formatTimelineTime = (publicationTime: string): string =>
  new Date(publicationTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

export const formatTimelineDate = (publicationTime: string): string =>
  new Date(publicationTime)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .replace(/(\d+)(?=,)/, (match) => `${match}th`);

export const isSameCalendarDate = (a: string, b: string): boolean =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const TITLE_MAX_LENGTH = 70;

export function truncateTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.length > TITLE_MAX_LENGTH ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}…` : trimmed;
}
