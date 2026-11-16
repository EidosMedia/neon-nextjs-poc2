import type { ArticleModel } from '@/types/models';

type Crops = { dynamicCropsResourceUrls?: Record<string, string> };

/** Editor-chosen crop first (teaser then main), same as the legacy MainImage/HeroCoverImage. */
export function heroImage(article: ArticleModel, format: string): string | undefined {
  const sys = article.links?.system as { teaserPicture?: Crops[]; mainPicture?: Crops[] } | undefined;
  return sys?.mainPicture?.[0]?.dynamicCropsResourceUrls?.[format] ?? sys?.teaserPicture?.[0]?.dynamicCropsResourceUrls?.[format];
}
