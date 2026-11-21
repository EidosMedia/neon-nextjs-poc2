'use client';
import { useEffect, useState } from 'react';
import { mergePosts, POLL_INTERVAL_MS, type LiveblogPost } from '@/app/_v2/liveblog/posts';

type PostsState = {
  liveblogId: string;
  posts: LiveblogPost[];
  isLoading: boolean;
  error: boolean;
};

/**
 * Polls `/api/liveblogs/<id>` immediately and every 10s, merging new posts into the known ones.
 * A failed poll keeps the posts already shown.
 */
export function useLiveblogPosts(liveblogId: string, initialPosts: LiveblogPost[] = []) {
  const initialState: PostsState = { liveblogId, posts: initialPosts, isLoading: initialPosts.length === 0, error: false };
  const [state, setState] = useState<PostsState>(initialState);
  if (state.liveblogId !== liveblogId) setState(initialState);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Live blog posts request failed (${response.status})`);
        const polled = await response.json();
        if (!Array.isArray(polled)) throw new Error('Invalid live blog posts response');
        if (active) setState((known) => ({
          liveblogId, posts: mergePosts(known.posts, polled), isLoading: false, error: false,
        }));
      } catch (error) {
        console.warn('Live blog poll failed', error);
        if (active) setState((known) => ({ ...known, isLoading: false, error: true }));
      }
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [liveblogId]);

  return state.liveblogId === liveblogId ? state : initialState;
}
