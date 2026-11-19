'use client';
import { useEffect, useState } from 'react';
import { mergePosts, POLL_INTERVAL_MS, type LiveblogPost } from './posts';

/**
 * Polls `/api/liveblogs/<id>` immediately and every 10s, merging new posts into the known ones.
 * A failed poll keeps the posts already shown.
 */
export function useLiveblogPosts(liveblogId: string, initialPosts: LiveblogPost[] = []): LiveblogPost[] {
  const [posts, setPosts] = useState<LiveblogPost[]>(initialPosts);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
        const polled = await response.json();
        if (active) setPosts((known) => mergePosts(known, polled));
      } catch (error) {
        console.warn('Live blog poll failed', error);
      }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [liveblogId]);

  return posts;
}
