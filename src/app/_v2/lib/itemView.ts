import type { WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { SlotShape } from './layout';
import type { ArticleItemVariant, ItemSettings } from './settings';

export type TeaserFields = {
  title: string;
  summary?: string;
  titleId?: string;
  summaryId?: string;
  kicker?: string;
  imageUrl?: string;
  href: string;
  byline?: string;
  date?: string;
};

const str = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);

export function resolveTeaserFields(node: WebpageNodeModel): TeaserFields {
  const n = node as WebpageNodeModel & { author?: string; overhead?: string };
  const attrs = n.attributes;
  const url = n.url ?? '';
  return {
    title: str(attrs?.teaser?.title) ?? n.title,
    summary: str(attrs?.teaser?.summary) ?? str(n.summary),
    titleId: str(attrs?.contentIds?.teaserTitle),
    summaryId: str(attrs?.contentIds?.teaserSummary),
    kicker: str(attrs?.overhead) ?? str(n.overhead) ?? str(url.split('/')[1]),
    imageUrl: str(n.mainPicture),
    href: url,
    byline: str(n.author),
    date: str(n.pubInfo?.publicationTime) ?? str(n.pubInfo?.pubDate),
  };
}

export type ArticleItemView = {
  variant: ArticleItemVariant;
  showImage: boolean;
  showStandfirst: boolean;
  solidBlock: boolean;
};

export function resolveArticleItemView(
  s: Extract<ItemSettings, { kind: 'article' }>,
  slot: SlotShape,
  hasImage: boolean,
  hasStandfirst: boolean,
): ArticleItemView {
  const variant = s.variant === 'auto' ? slot : s.variant;
  const showImage = s.image && hasImage && variant !== 'textOnly';
  return {
    variant,
    showImage,
    showStandfirst: s.standfirst && hasStandfirst,
    solidBlock: variant === 'overlay' && !showImage,
  };
}

export function resolveLiveblogItemView(
  s: Extract<ItemSettings, { kind: 'liveblog' }>,
  slot: SlotShape,
): { variant: 'panel' | 'feed' | 'pinnedSummary'; showImage: boolean; showShare: boolean } {
  const variant = s.variant === 'auto' ? (slot === 'lead' || slot === 'overlay' ? 'panel' : 'feed') : s.variant;
  return { variant, showImage: s.image, showShare: s.share };
}

export function resolveGalleryItemView(
  s: Extract<ItemSettings, { kind: 'gallery' }>,
  slot: SlotShape,
): { variant: 'fullBleed' | 'panelWithThumbs' | 'grid'; showCaptions: boolean; showThumbnails: boolean } {
  const variant =
    s.variant === 'auto'
      ? slot === 'lead' || slot === 'overlay' ? 'fullBleed' : slot === 'standard' ? 'panelWithThumbs' : 'grid'
      : s.variant;
  return { variant, showCaptions: s.captions, showThumbnails: variant === 'grid' ? false : s.thumbnails };
}
