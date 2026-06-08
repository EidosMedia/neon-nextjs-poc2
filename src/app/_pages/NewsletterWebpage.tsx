import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React from 'react';
import { renderNewsletterHtml } from '@/utilities/newsletter';

type PageProps = {
  data: PageData<WebpageModel>;
};

const NewsletterWebpage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: default/NewsletterWebpage');
  const html = await renderNewsletterHtml(data);
  return (
    <div className="container mx-auto p-4">
      <Navbar data={data} />
      <iframe
        srcDoc={html}
        title="Newsletter preview"
        style={{ width: '100%', minHeight: '1200px', border: '1px solid var(--color-neutral-light)' }}
      />
      <footer className="p-4 rounded-b-lg mt-4">
        <Footer data={data} />
      </footer>
    </div>
  );
};

export default NewsletterWebpage;
