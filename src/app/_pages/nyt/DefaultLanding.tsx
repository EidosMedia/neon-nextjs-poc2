import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { WebpageModel } from '@/types/models/WebpageModel';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  const landingTitle = data.siteNode?.title || data.siteNode?.name || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
        {landingTitle && (
          <div className="mb-6">
            <hr className="nyt-rule" />
            <h1 style={{
              fontFamily: 'var(--font-nav)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#121212',
              marginTop: 6,
            }}>
              {landingTitle}
            </h1>
          </div>
        )}
        <DefaultSectionItemsRenderer data={data} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Landing;
