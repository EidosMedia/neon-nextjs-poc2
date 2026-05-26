import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: wire/DefaultSection');

  const sectionTitle = (data.siteNode?.title || data.siteNode?.name || '').toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        {sectionTitle && (
          <div className="mb-4">
            <div className="wire-panel-header flex items-center justify-between">
              <span>{sectionTitle}</span>
              <span style={{ fontWeight: 400 }}>— filtered feed</span>
            </div>
          </div>
        )}
        <div className="bg-white border border-[#D4D4D4]">
          <DefaultSectionItemsRenderer data={data} />
        </div>
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Section;
