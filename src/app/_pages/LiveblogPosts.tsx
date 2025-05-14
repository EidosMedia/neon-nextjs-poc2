'use client';
import { PageData } from '@/neon-frontoffice-ts-sdk/src';
import { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

type LiveblogPost = {
  id: string;
  content: any;
};

type PageProps = {
  data: PageData<ArticleModel>;
};

const LiveblogPosts: React.FC<PageProps> = ({ data }) => {
  const lastLoadedPostId = useRef<string>(null);

  const initialLiveblogPosts = data.model.data.children.map(postId => {
    lastLoadedPostId.current = postId;
    return {
      id: postId,
      content: data.model.nodes[postId].files.content.data,
    };
  });

  const [liveblogPosts, setLiveblogPosts] = useState<LiveblogPost[]>(initialLiveblogPosts);

  const liveblogId = data.model.data.id;

  useEffect(() => {
    const getLiveblogPosts = async () => {
      const resp = await fetch(`/api/liveblogs/${liveblogId}`, { cache: 'no-store' });
      const liveblogPostsResp = await resp.json();
      setLiveblogPosts(oldResults =>
        _.uniqBy([...liveblogPostsResp.posts, ...oldResults], 'id').map(post => ({
          id: post.id,
          content: post.content || post.files.content.data,
        }))
      );
    };

    const interval = setInterval(() => getLiveblogPosts(), 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="container mx-auto">
      {liveblogPosts.map(({ id, content }) => {
        return (
          <div key={id} className="liveblog-posts">
            {renderContent(content)}
          </div>
        );
      })}
    </div>
  );
};

export default LiveblogPosts;
