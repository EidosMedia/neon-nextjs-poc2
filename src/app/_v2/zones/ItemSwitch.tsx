import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { SlotShape } from '../lib/layout';
import {
  resolveArticleItemView,
  resolveGalleryItemView,
  resolveLiveblogItemView,
  resolveTeaserFields,
} from '../lib/itemView';
import type { ItemSettings } from '../lib/settings';
import ArticleItem from '../items/ArticleItem';
import GalleryItem from '../items/GalleryItem';
import LiveblogItem from '../items/LiveblogItem';

type Props = { node: WebpageNodeModel; settings: ItemSettings; slot: SlotShape; viewStatus: ViewStatus; titled?: boolean };

export default function ItemSwitch({ node, settings, slot, viewStatus, titled = false }: Props) {
  const headingLevel = slot === 'lead' && !titled ? 2 : 3;
  if (settings.kind === 'gallery') {
    return <GalleryItem node={node} view={resolveGalleryItemView(settings, slot)} viewStatus={viewStatus} headingLevel={headingLevel} />;
  }
  if (settings.kind === 'liveblog') {
    return <LiveblogItem node={node} view={resolveLiveblogItemView(settings, slot)} viewStatus={viewStatus} headingLevel={headingLevel} />;
  }
  const f = resolveTeaserFields(node);
  const view = resolveArticleItemView(settings, slot, Boolean(f.imageUrl), Boolean(f.summary));
  return <ArticleItem node={node} view={view} viewStatus={viewStatus} headingLevel={headingLevel} />;
}
