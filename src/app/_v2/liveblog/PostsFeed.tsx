'use client';
import { useRef } from 'react';
import { renderContent } from '@/utilities/content';
import { formatFeedStamp, sortNewestFirst, type LiveblogPost } from './posts';
import { useLiveblogPosts } from '@/hooks/useLiveblogPosts';
import LiveblogPostsStatus from '@/app/components/LiveblogPostsStatus';

type Props = { liveblogId: string; initialPosts: LiveblogPost[] };

// Navbar height plus padding, kept from the legacy feed.
const SCROLL_OFFSET = 72;

/** v2 live blog feed: polls the posts endpoint and renders each post's content through renderContent. */
export default function PostsFeed({ liveblogId, initialPosts }: Props) {
  const { posts: loaded, isLoading, error } = useLiveblogPosts(liveblogId, initialPosts);
  const posts = sortNewestFirst(loaded);
  const topRef = useRef<HTMLElement>(null);

  const backToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const top = topRef.current?.getBoundingClientRect().top || 0;
    window.scrollTo({ top: window.scrollY + top - SCROLL_OFFSET, behavior: 'smooth' });
  };

  return (
    <section ref={topRef} className="v2-feed" aria-label="Live blog posts">
      <div className="v2-feed__tag">
        <span className="v2-feed__dot" aria-hidden="true" />
        Live blog
      </div>
      {isLoading || (error && posts.length === 0) ? (
        <LiveblogPostsStatus loading={isLoading} variant="feed" />
      ) : posts.length > 0 ? (
        <ol className="v2-feed__list" aria-live="polite">
          {posts.map((post) => (
            <li key={post.id} className="v2-feed__post">
              <time className="v2-feed__stamp" dateTime={post.publicationTime}>
                {formatFeedStamp(post.publicationTime)}
              </time>
              <div className="v2-feed__content">{renderContent(post.content)}</div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="v2-feed__empty">No liveblog posts available at the moment. Please check back later.</p>
      )}
      <div className="v2-feed__foot">
        <button type="button" className="v2-btn" onClick={backToTop}>
          Go Back To Top
        </button>
      </div>
    </section>
  );
}
