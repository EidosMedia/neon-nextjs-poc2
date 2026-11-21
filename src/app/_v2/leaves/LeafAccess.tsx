import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { normalizeViewStatus, ViewStatus, type BaseModel, type PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { resolvePaywallLevel } from '../lib/paywall';
import ReaderGate from './ReaderGate';

type Props = {
  data: PageData<BaseModel>;
  article: ArticleModel;
  children: ReactNode;
};

export default async function LeafAccess({ data, article, children }: Props) {
  const level = resolvePaywallLevel(article.pubInfo?.paywallLevel);
  if (level === 'FREE') return children;
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) throw new Error('Site name is required for metered content');
  const registered = Boolean((await cookies()).get('webauth')?.value);
  const preview = normalizeViewStatus(data.siteData?.viewStatus) === ViewStatus.PREVIEW;
  return (
    <ReaderGate
      key={article.id}
      level={level} registered={registered} siteName={siteName} url={article.pubInfo?.canonical || article.url} preview={preview}
    >
      {children}
    </ReaderGate>
  );
}
