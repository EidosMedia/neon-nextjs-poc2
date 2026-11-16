'use client';
import clsx from 'clsx';
import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ItemFrame, { type HeadingLevel } from './ItemFrame';
import Kicker from './Kicker';
import Media from './Media';

export type GalleryItemView = {
  variant: 'fullBleed' | 'panelWithThumbs' | 'grid';
  showCaptions: boolean;
  showThumbnails: boolean;
};

type Props = { node: WebpageNodeModel; view: GalleryItemView; viewStatus: ViewStatus; headingLevel: HeadingLevel };

/**
 * The linked WebpageNodeModel carries only `mainPicture`; no gallery image list is available
 * without extra fetches, so thumbnails stay hidden and only the main picture is rendered.
 */
export default function GalleryItem({ node, view, viewStatus, headingLevel }: Props) {
  return (
    <ItemFrame
      node={node}
      viewStatus={viewStatus}
      className={clsx('v2-item v2-item--gallery', `v2-item--${view.variant}`, 'v2-item--no-thumbs')}
    >
      {(f, { Title, Summary }) => (
        <>
          <Media url={f.imageUrl} ratio="16-9" />
          <div className="v2-item__body">
            <Kicker text={f.kicker} />
            {Title({ level: headingLevel, className: 'v2-item__title' })}
            {view.showCaptions && Summary({ className: 'v2-item__summary' })}
          </div>
        </>
      )}
    </ItemFrame>
  );
}
