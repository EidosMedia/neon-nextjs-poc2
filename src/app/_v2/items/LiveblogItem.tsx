'use client';
import clsx from 'clsx';
import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LiveblogOrganismPosts from '@/app/components/base/Organism/LiveblogOrganism/LiveblogOrganismPosts';
import ItemFrame, { type HeadingLevel } from './ItemFrame';
import Kicker from './Kicker';
import Media from './Media';
import LiveTag from './LiveTag';

export type LiveblogItemView = {
  variant: 'panel' | 'feed' | 'pinnedSummary';
  showImage: boolean;
  showShare: boolean;
};

type Props = { node: WebpageNodeModel; view: LiveblogItemView; viewStatus: ViewStatus; headingLevel: HeadingLevel };

export default function LiveblogItem({ node, view, viewStatus, headingLevel }: Props) {
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
          {view.showImage && view.variant !== 'pinnedSummary' && <Media url={f.imageUrl} ratio="16-9" />}
          <div className="v2-item__body">
            <LiveTag />
            <Kicker text={f.kicker} />
            {Title({ level: headingLevel, className: 'v2-item__title' })}
            {view.variant === 'pinnedSummary' && Summary({ className: 'v2-item__summary v2-item__pinned' })}
            {view.variant !== 'pinnedSummary' && (
              <div className="v2-item__posts">
                <LiveblogOrganismPosts liveblogId={node.id} />
              </div>
            )}
          </div>
        </>
      )}
    </ItemFrame>
  );
}
