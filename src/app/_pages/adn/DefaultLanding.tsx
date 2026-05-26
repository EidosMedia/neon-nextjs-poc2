import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { WebpageModel } from '@/types/models/WebpageModel';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  const landingTitle = (data.siteNode?.title || data.siteNode?.name || '').toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1280px] mx-auto px-3 py-5">
        {landingTitle && (
          <h1 className="section-page-title mb-6">{landingTitle}</h1>
        )}
        <DefaultSectionItemsRenderer data={data} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Landing;
