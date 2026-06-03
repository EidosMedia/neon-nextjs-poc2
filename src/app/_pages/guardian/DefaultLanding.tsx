import React from 'react';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import Footer from './Footer';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: guardian/DefaultLanding');

  const landingTitle = data.siteNode?.title || data.siteNode?.name || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
        {landingTitle && (
          <div className="mb-6">
            <div className="guardian-section-header">{landingTitle}</div>
          </div>
        )}
        <DefaultSectionItemsRenderer data={data} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Landing;
