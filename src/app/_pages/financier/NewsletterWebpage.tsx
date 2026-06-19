import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import React from 'react';
import { renderNewsletterFragment } from '@/utilities/newsletter';

type PageProps = {
  data: PageData<WebpageModel>;
};

const NewsletterWebpage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: default/NewsletterWebpage');
  const html = await renderNewsletterFragment(data);
  return (
    <div className="container mx-auto p-4" dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default NewsletterWebpage;
