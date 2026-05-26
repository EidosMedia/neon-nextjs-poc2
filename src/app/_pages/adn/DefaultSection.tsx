import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: adn/DefaultSection');

  const sectionTitle = (
    data.model?.data?.title ||
    data.siteNode?.title ||
    data.siteNode?.name || 
    ''
  ).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1280px] mx-auto px-3 py-5">
        {sectionTitle && (
          <h1 className="section-page-title mb-6">{sectionTitle}</h1>
        )}
        <DefaultSectionItemsRenderer data={data} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Section;
