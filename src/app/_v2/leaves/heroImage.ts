import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson } from '@/utilities/content';

type Crops = { dynamicCropsResourceUrls?: Record<string, string> };
type El = { nodeType?: string; attributes?: Record<string, string>; elements?: El[] };

/**
 * Editor-chosen crop first (main then teaser picture), as the legacy MainImage/HeroCoverImage. When the
 * response has no picture links, the content's image group still names the picture: its image for the
 * format's soft crop (`Wide_large` → `Wide`), else its first image with a source.
 */
export function heroImage(article: ArticleModel, format: string): string | undefined {
  const sys = article.links?.system as { teaserPicture?: Crops[]; mainPicture?: Crops[] } | undefined;
  const linked = sys?.mainPicture?.[0]?.dynamicCropsResourceUrls?.[format] ?? sys?.teaserPicture?.[0]?.dynamicCropsResourceUrls?.[format];
  if (linked) return linked;

  const content = article.files?.content?.data;
  if (!content) return undefined;
  const [group] = findElementsInContentJson(['web-image-group'], content) as El[];
  const images = (group?.elements ?? []).filter(el => el.nodeType === 'image' && el.attributes?.src);
  const crop = format.split('_')[0];
  return (images.find(el => el.attributes?.softCrop === crop) ?? images[0])?.attributes?.src;
}
