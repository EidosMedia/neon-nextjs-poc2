import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { renderNewsletterFragment } from '@/utilities/newsletter';

export default async function NewsletterWebpage({ data }: { data: PageData<WebpageModel> }) {
  const html = await renderNewsletterFragment(data);
  return <div className="v2-newsletter-preview" dangerouslySetInnerHTML={{ __html: html }} />;
}
