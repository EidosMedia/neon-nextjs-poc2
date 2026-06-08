'use client';
import { renderContent } from '@/utilities/content';
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

  return (
    <div className="flex flex-col gap-3">
      {liveblogPosts.length > 0 ? (
        liveblogPosts.slice(0, 3).map(post => (
          <div key={post.id} className="liveblog-organism-post bg-neutral-lightest p-3 rounded-sm">
            <span className="caption text-feedback-red-dark">
              {new Date(post.publicationTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}{' '}
              -{' '}
              {new Date(post.publicationTime)
                .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                .replace(/(\d+)(?=,)/, match => `${match}th`)}
            </span>
            <div className="text-sm">{renderContent(post.content)}</div>
          </div>
        ))
      ) : (
        <p key="loading" className="text-sm text-neutral-light-2">
          No posts yet — check back soon.
        </p>
      )}
    </div>
  );
};

export default LiveblogOrganismPosts;
