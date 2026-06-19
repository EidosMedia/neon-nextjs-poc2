import React from 'react';
import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: foghorn/DefaultSection');

  const sectionTitle = (
    data.model?.data?.title ||
    data.siteNode?.title ||
    data.siteNode?.name ||
    ''
  ).toUpperCase();

  console.log('[NEON] sectionTitle:', sectionTitle);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
        {sectionTitle && (
          <div className="mb-6">
            <div className="foghorn-section-header">{sectionTitle}</div>
          </div>
        )}
        <DefaultSectionItemsRenderer data={data} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Section;
