import React from 'react';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import Footer from './Footer';
import ArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: financier/DefaultLanding');

  const landingTitle = data.siteNode?.title || data.siteNode?.name || '';

  const linkedObjects = data.model.data.children
    ? data.model.data.children.map(item => data.model.nodes[item])
    : [];

  const [lead, ...rest] = linkedObjects;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-bg, #f6f6f6)' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
        {landingTitle && (
          <div className="mb-6">
            <div className="financier-section-header">{landingTitle}</div>
          </div>
        )}

        {linkedObjects.length === 0 ? (
          <div className="flex items-center justify-center py-12" style={{ color: 'var(--color-neutral-light-2)' }}>
            No articles found.
          </div>
        ) : (
          <>
            <ArticleOrganism
              data={data}
              linkedObject={lead}
              linkedObjects={linkedObjects}
              index={0}
              type="article-xl"
            />
            {rest.length > 0 && (
              <div className="financier-default-grid">
                {rest.map((linkedObject: any, idx: number) => (
                  <ArticleOrganism
                    key={linkedObject.id ?? idx}
                    data={data}
                    linkedObject={linkedObject}
                    linkedObjects={rest}
                    index={idx}
                    type="article-sm"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Landing;
