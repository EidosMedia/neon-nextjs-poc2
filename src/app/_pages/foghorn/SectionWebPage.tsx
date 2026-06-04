import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Main from '../../components/webpage/Main';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const SectionWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: guardian/SectionWebPage');

  const sectionTitle = data?.siteNode?.title ?? data?.model?.data?.title ?? '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />

      {sectionTitle && (
        <div className="w-full" style={{ backgroundColor: '#052962' }}>
          <div className="w-full max-w-[1300px] mx-auto px-4 py-4">
            <h1 style={{
              fontFamily: 'var(--font-nav)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#ffffff',
            }}>
              {sectionTitle}
            </h1>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <section>
            <div className="guardian-section-header">Top Stories</div>
            <Main data={data} />
          </section>
          <section>
            <div className="guardian-section-header">Latest</div>
            <Context data={data} />
          </section>
          <section>
            <div className="guardian-section-header">Opinion</div>
            <Insight1 data={data} />
          </section>
          <section>
            <div className="guardian-section-header">More</div>
            <Insight2 data={data} />
          </section>
        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default SectionWebPage;
