'use client';
import clsx from 'clsx';
import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PostsTimeline from '../liveblog/PostsTimeline';
import ItemFrame, { type HeadingLevel } from './ItemFrame';
import Kicker from './Kicker';
import Media from './Media';
import LiveTag from './LiveTag';
import Byline from './Byline';

export type LiveblogItemView = {
  variant: 'panel' | 'feed' | 'pinnedSummary' | 'compact';
  showImage: boolean;
  showShare: boolean;
};

type Props = {
  node: WebpageNodeModel;
  view: LiveblogItemView;
  viewStatus: ViewStatus;
  headingLevel: HeadingLevel;
  /** `false` skips the posts list (style guide fixtures have no posts endpoint). */
  posts?: false;
};

export default function LiveblogItem({ node, view, viewStatus, headingLevel, posts }: Props) {
  const compact = view.variant === 'compact';
  return (
    <ItemFrame
      node={node}
      viewStatus={viewStatus}
      showShare={view.showShare}
      format={view.variant === 'panel' ? 'Wide_large' : 'Wide_small'}
      className={clsx('v2-item v2-item--liveblog', `v2-item--${view.variant}`, !view.showImage && 'v2-item--no-image')}
    >
      {(f, { Title, Summary }) => (
        <>
          {view.showImage && <Media url={f.imageUrl} ratio={compact ? '3-2' : '16-9'} />}
          <div className="v2-item__body">
            {compact ? (
              <div className="v2-item__overhead">
                <LiveTag />
                <Kicker text={f.kicker} paywallLevel={node.pubInfo?.paywallLevel} />
              </div>
            ) : (
              <>
                <LiveTag />
                <Kicker text={f.kicker} paywallLevel={node.pubInfo?.paywallLevel} />
              </>
            )}
            {Title({ level: headingLevel, className: 'v2-item__title' })}
            {compact && <Byline byline={f.byline} date={f.date} />}
            {view.variant === 'pinnedSummary' && Summary({ className: 'v2-item__summary v2-item__pinned' })}
            {(view.variant === 'panel' || view.variant === 'feed') && posts !== false && (
              <div className="v2-item__posts">
                <PostsTimeline liveblogId={node.id} />
              </div>
            )}
          </div>
        </>
      )}
    </ItemFrame>
  );
}
