'use client';
import React from 'react';
import { PageData } from '@/neon-frontoffice-ts-sdk/src';
import { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import { useLiveblogPosts } from '@/hooks/useLiveblogPosts';
import { initialPostsFromModel } from '@/app/_v2/liveblog/posts';
import LiveblogPostsStatus from '@/app/components/LiveblogPostsStatus';
import { Bookmark, CircleDot, Link2, Share } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '../../components/baseComponents/button';

type PageProps = {
  data: PageData<ArticleModel>;
};

const LiveblogPosts: React.FC<PageProps> = ({ data }) => {
  React.useEffect(() => {
    console.log('[NEON] mount: wire/LiveblogPosts');
  }, []);

  const { posts: liveblogPosts, isLoading, error } = useLiveblogPosts(
    data.model.data.id, initialPostsFromModel(data.model),
  );

  const topDivRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={topDivRef} className="bg-primary-dark py-8 px-36">
      <div className="flex items-center gap-1 mb-6 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
        <CircleDot className="w-4 h-4" />
        <span className="subhead1 pt-[3px]">Live blog</span>
      </div>
      <div className="flex flex-col gap-6">
        {isLoading || (error && liveblogPosts.length === 0) ? (
          <LiveblogPostsStatus loading={isLoading} variant="feed" />
        ) : liveblogPosts.length > 0 ? (
          [...liveblogPosts]
            .sort((a, b) => new Date(b.publicationTime).getTime() - new Date(a.publicationTime).getTime())
            .map(data => (
              <div key={data.id} className="liveblog-posts bg-neutral-lightest p-6 rounded-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* DATE */}
                    <span className="subhead1 text-feedback-red-dark">
                      {new Date(data.publicationTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(data.publicationTime)
                        .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        .replace(/(\d+)(?=,)/, match => `${match}th`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* ICONS */}
                    <Button variant="ghost">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost">
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {renderContent(data.content)}
              </div>
            ))
        ) : (
          <p key="loading" className="text-neutral-lightest">
            No liveblog posts available at the moment. Please check back later.
          </p>
        )}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => {
            topDivRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const navbarHeightOffset = 72; // Adjust for navbar height + additional offset for padding
            const topPosition = topDivRef.current?.getBoundingClientRect().top || 0;
            window.scrollTo({ top: window.scrollY + topPosition - navbarHeightOffset, behavior: 'smooth' });
          }}
        >
          Go Back To Top
        </Button>
      </div>
    </div>
  );
};

export default LiveblogPosts;
