'use client';
import { PageData } from '@/neon-frontoffice-ts-sdk/src';
import { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import _ from 'lodash';
import { Bookmark, CircleDot, Link2, Share } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/baseComponents/button';

type LiveblogPost = {
  id: string;
  content: any;
  publicationTime: string;
};

type PageProps = {
  data: PageData<ArticleModel>;
};

const LiveblogPosts: React.FC<PageProps> = ({ data }) => {
  const lastLoadedPostId = useRef<string>(null);

  const initialLiveblogPosts = data.model.children.map(postId => {
    lastLoadedPostId.current = postId;
    return {
      id: postId,
      content: data.model.nodes[postId].files.content.data,
      publicationTime: data.model.nodes[postId].pubInfo.publicationTime,
    };
  });

  const [liveblogPosts, setLiveblogPosts] = useState<LiveblogPost[]>(initialLiveblogPosts);

  const liveblogId = data.model.data.id;

  useEffect(() => {
    const getLiveblogPosts = async () => {
      const response = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
      const liveblogPostsResp = await response.json();
      console.log('Liveblog posts response:', liveblogPostsResp);
      setLiveblogPosts(oldResults =>
        _.uniqBy([...liveblogPostsResp.posts, ...oldResults], 'id').map(post => {
          return {
            id: post.id,
            content: post.content || post.files?.content?.data,
            publicationTime: post.pubInfo?.publicationTime,
          };
        })
      );
    };

    const interval = setInterval(() => getLiveblogPosts(), 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const topDivRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={topDivRef} className="bg-primary-dark py-8 px-36">
      <div className="flex items-center gap-1 mb-6 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
        <CircleDot className="w-4 h-4" />
        <span className="subhead1 pt-[3px]">Live blog</span>
      </div>
      <div className="flex flex-col gap-6">
        {liveblogPosts.length > 0 ? (
          liveblogPosts.map(data => (
            <div key={data.id} className="liveblog-posts bg-neutral-lightest p-6 rounded-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* DATE */}
                  <span className="subhead1 text-feedback-red-dark">
                    {new Date(data.publicationTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}{' '}
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
            Loading live blog posts...
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
