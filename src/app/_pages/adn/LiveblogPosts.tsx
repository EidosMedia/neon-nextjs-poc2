'use client';
import React from 'react';
import { PageData } from '@/neon-frontoffice-ts-sdk/src';
import { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import _ from 'lodash';
import { Bookmark, CircleDot, Link2, Share } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/baseComponents/button';

type LiveblogPost = {
  id: string;
  content: any;
  publicationTime: string;
};

type PageProps = {
  data: PageData<ArticleModel>;
};

const LiveblogPosts: React.FC<PageProps> = ({ data }) => {
  React.useEffect(() => { console.log('[NEON] mount: adn/LiveblogPosts'); }, []);

  const lastLoadedPostId = useRef<string>(null);

  const initialLiveblogPosts = Array.isArray(data.model.children)
    ? data.model.children.map(postId => {
        lastLoadedPostId.current = postId;
        return {
          id: postId,
          content: data.model.nodes[postId].files.content.data,
          publicationTime: data.model.nodes[postId].sys.updateTime,
        };
      })
    : [];

  const [liveblogPosts, setLiveblogPosts] = useState<LiveblogPost[]>(initialLiveblogPosts);
  const liveblogId = data.model.data.id;

  useEffect(() => {
    const getLiveblogPosts = async () => {
      const response = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
      const liveblogPostsResp = await response.json();
      setLiveblogPosts(oldResults =>
        _.uniqBy([...liveblogPostsResp, ...oldResults], 'id').map(post => ({
          id: post.id,
          content: post.content || post.files?.content?.data,
          publicationTime: post.sys?.updateTime,
        }))
      );
    };

    getLiveblogPosts();
    const interval = setInterval(() => getLiveblogPosts(), 10000);
    return () => clearInterval(interval);
  }, [liveblogId]);

  const topDivRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={topDivRef} className="bg-gray-50 border border-gray-200 rounded py-8 px-6">
      <div className="flex items-center gap-1 mb-6 w-fit max-h-[30px] p-2 rounded bg-red-600 text-white">
        <CircleDot className="w-4 h-4" />
        <span className="text-xs font-bold pt-[2px] uppercase tracking-wide">Live blog</span>
      </div>
      <div className="flex flex-col gap-6">
        {liveblogPosts.length > 0 ? (
          liveblogPosts.map(post => (
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
                  <Button variant="ghost" size="sm"><Share className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm"><Bookmark className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm"><Link2 className="w-3.5 h-3.5" /></Button>
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
