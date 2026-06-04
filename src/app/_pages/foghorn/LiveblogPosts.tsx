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
  React.useEffect(() => { console.log('[NEON] mount: foghorn/LiveblogPosts'); }, []);

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
    <div ref={topDivRef} style={{ backgroundColor: '#052962' }} className="py-8 px-6 md:px-12">
      <div className="flex items-center gap-1 mb-6 w-fit max-h-[30px] p-2" style={{ background: '#c70000', color: '#fff' }}>
        <CircleDot className="w-4 h-4" />
        <span className="subhead1 pt-[3px]">Live blog</span>
      </div>
      <div className="flex flex-col gap-6">
        {liveblogPosts.length > 0 ? (
          liveblogPosts.map(post => (
            <div key={post.id} className="liveblog-posts p-6" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span style={{ fontFamily: 'var(--font-nav)', fontSize: 12, fontWeight: 700, color: '#c70000' }}>
                    {new Date(post.publicationTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{' '}
                    &mdash;{' '}
                    {new Date(post.publicationTime).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost"><Share className="w-4 h-4" /></Button>
                  <Button variant="ghost"><Bookmark className="w-4 h-4" /></Button>
                  <Button variant="ghost"><Link2 className="w-4 h-4" /></Button>
                </div>
              </div>
              {renderContent(post.content)}
            </div>
          ))
        ) : (
          <p key="loading" style={{ color: 'rgba(255,255,255,.7)' }}>
            No liveblog posts available at the moment. Please check back later.
          </p>
        )}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => {
            const navbarHeightOffset = 96;
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
