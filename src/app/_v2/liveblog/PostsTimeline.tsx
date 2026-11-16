'use client';
import { findElementsInContentJson, findText } from '@/utilities/content';
import {
  formatTimelineDate, formatTimelineTime, isSameCalendarDate, sortNewestFirst, TIMELINE_VISIBLE_POSTS, truncateTitle,
} from './posts';
import { useLiveblogPosts } from './useLiveblogPosts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postTitle(content: any): string {
  const element = findElementsInContentJson(['h1'], content)[0] ?? findElementsInContentJson(['p'], content)[0];
  if (!element) return '';
  return truncateTitle(String(findText(element) ?? ''));
}

/** v2 item-panel timeline: the three newest posts, grouped by date, polled like the feed. */
export default function PostsTimeline({ liveblogId }: { liveblogId: string }) {
  const posts = sortNewestFirst(useLiveblogPosts(liveblogId)).slice(0, TIMELINE_VISIBLE_POSTS);

  if (posts.length === 0) return <p className="v2-timeline__empty">Live</p>;

  return (
    <ol className="v2-timeline" aria-live="polite">
      {posts.map((post, index) => {
        const previous = posts[index - 1];
        const showDate = !previous || !isSameCalendarDate(previous.publicationTime, post.publicationTime);
        return (
          <li key={post.id} className="v2-timeline__post">
            {showDate && <span className="v2-timeline__date">{formatTimelineDate(post.publicationTime)}</span>}
            <span className="v2-timeline__line">
              <time className="v2-timeline__time" dateTime={post.publicationTime}>
                {formatTimelineTime(post.publicationTime)}
              </time>
              {' - '}
              <span className="v2-timeline__title">{postTitle(post.content) || 'No title available'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
