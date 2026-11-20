'use client';
import clsx from 'clsx';
import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleItemView } from '../lib/itemView';
import ItemFrame, { type HeadingLevel } from './ItemFrame';
import Kicker from './Kicker';
import Byline from './Byline';
import Media from './Media';

type Props = { node: WebpageNodeModel; view: ArticleItemView; viewStatus: ViewStatus; headingLevel: HeadingLevel };

const RATIO = {
  lead: '16-9',
  standard: '16-9',
  compact: '3-2',
  overlay: '4-5',
  opinion: 'circle',
  highlight: '16-9',
  sponsored: '16-9',
  textOnly: '16-9',
} as const;

export default function ArticleItem({ node, view, viewStatus, headingLevel }: Props) {
  return (
    <ItemFrame
      node={node}
      viewStatus={viewStatus}
      format={view.variant === 'lead' ? 'Wide_large' : 'Wide_small'}
      className={clsx(
        'v2-item',
        `v2-item--${view.variant}`,
        !view.showImage && 'v2-item--no-image',
        view.solidBlock && 'v2-item--solid',
        view.showStandfirst && 'v2-item--with-standfirst',
      )}
    >
      {(f, { Title, Summary }) => (
        <>
          {view.showImage && <Media url={f.imageUrl} ratio={RATIO[view.variant]} />}
          <div className="v2-item__body">
            <Kicker text={view.showKicker ? f.kicker : undefined} />
            {Title({ level: headingLevel, className: 'v2-item__title' })}
            {view.showStandfirst && Summary({ className: 'v2-item__summary' })}
            <Byline byline={f.byline} date={f.date} />
          </div>
        </>
      )}
    </ItemFrame>
  );
}
