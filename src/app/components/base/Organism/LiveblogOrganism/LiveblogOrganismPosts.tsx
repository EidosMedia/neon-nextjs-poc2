'use client';
import { findElementsInContentJson, findText } from '@/utilities/content';
import _ from 'lodash';
import { useEffect, useState } from 'react';

type LiveblogPost = {
  id: string;
  content: any;
  publicationTime: string;
};

type LiveblogOrganismPostsProps = {
  liveblogId: string;
};

const TITLE_MAX_LENGTH = 70;

const getPostTitle = (content: any): string => {
  const element =
    findElementsInContentJson(['h1'], content)[0] ??
    findElementsInContentJson(['p'], content)[0];
  if (!element) return '';
  const text = String(findText(element) ?? '').trim();
  if (!text) return '';
  return text.length > TITLE_MAX_LENGTH ? `${text.slice(0, TITLE_MAX_LENGTH)}…` : text;
};

const formatPostTime = (publicationTime: string): string =>
  new Date(publicationTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

const formatGroupDate = (publicationTime: string): string =>
  new Date(publicationTime)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .replace(/(\d+)(?=,)/, match => `${match}th`);

const isSameCalendarDate = (a: string, b: string): boolean =>
  new Date(a).toDateString() === new Date(b).toDateString();

const LiveblogOrganismPosts: React.FC<LiveblogOrganismPostsProps> = ({ liveblogId }) => {
  const [liveblogPosts, setLiveblogPosts] = useState<LiveblogPost[]>([]);

  useEffect(() => {
    const getLiveblogPosts = async () => {
      const response = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
      const posts = await response.json();
      setLiveblogPosts(oldResults =>
        _.uniqBy([...posts, ...oldResults], 'id').map(post => ({
          id: post.id,
          content: post.content || post.files?.content?.data,
          publicationTime: post.publicationTime || post.sys?.updateTime,
        }))
      );
    };

    getLiveblogPosts();

    const interval = setInterval(() => getLiveblogPosts(), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [liveblogId]);

  const visiblePosts = liveblogPosts.slice(0, 3);
  console.log('LiveblogOrganismPosts - visiblePosts:', visiblePosts);

  return (
    <div className="flex flex-col">
      {visiblePosts.length > 0 ? (
        <div className="relative flex flex-col gap-3 pl-4">
          <span className="absolute left-[3px] top-1 bottom-1 w-px bg-neutral-light-2" aria-hidden="true" />
          {visiblePosts.map((post, index) => {
            const previousPost = visiblePosts[index - 1];
            const showDateDivider = !previousPost || !isSameCalendarDate(previousPost.publicationTime, post.publicationTime);
            const title = getPostTitle(post.content);

            return (
              <div key={post.id} className="liveblog-organism-post">
                {showDateDivider && (
                  <span className="caption text-neutral-light-2 uppercase block mb-2 -ml-4 pl-4">
                    {formatGroupDate(post.publicationTime)}
                  </span>
                )}
                <div className="relative">
                  <span className="absolute -left-[14px] top-[6px] w-2 h-2 rounded-full bg-feedback-red-dark" aria-hidden="true" />
                  <span className="caption text-feedback-red-dark">{formatPostTime(post.publicationTime)} - </span>
                  <span className="text-sm">{title || 'No title available'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-neutral-light-2">
          Live
        </p>
      )}
    </div>
  );
};

export default LiveblogOrganismPosts;
