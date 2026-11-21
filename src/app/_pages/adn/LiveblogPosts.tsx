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
    console.log('[NEON] mount: adn/LiveblogPosts');
  }, []);

  const { posts: liveblogPosts, isLoading, error } = useLiveblogPosts(
    data.model.data.id, initialPostsFromModel(data.model),
  );

  const topDivRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={topDivRef} className="bg-gray-50 border border-gray-200 rounded py-8 px-6">
      <div className="flex items-center gap-1 mb-6 w-fit max-h-[30px] p-2 rounded bg-red-600 text-white">
        <CircleDot className="w-4 h-4" />
        <span className="text-xs font-bold pt-[2px] uppercase tracking-wide">Live blog</span>
      </div>
      <div className="flex flex-col gap-6">
        {isLoading || (error && liveblogPosts.length === 0) ? (
          <LiveblogPostsStatus loading={isLoading} variant="feed" />
        ) : liveblogPosts.length > 0 ? (
          [...liveblogPosts]
            .sort((a, b) => new Date(b.publicationTime).getTime() - new Date(a.publicationTime).getTime())
            .map(post => (
              <div key={post.id} className="bg-white border border-gray-200 rounded p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-red-600">
                    {new Date(post.publicationTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}{' '}
                    —{' '}
                    {new Date(post.publicationTime).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Share className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {renderContent(post.content)}
              </div>
            ))
        ) : (
          <p className="text-sm text-gray-500 italic">Nessun aggiornamento disponibile al momento.</p>
        )}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          variant="secondary"
          onClick={() => {
            topDivRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const navbarHeightOffset = 120;
            const topPosition = topDivRef.current?.getBoundingClientRect().top || 0;
            window.scrollTo({ top: window.scrollY + topPosition - navbarHeightOffset, behavior: 'smooth' });
          }}
        >
          Torna su
        </Button>
      </div>
    </div>
  );
};

export default LiveblogPosts;
