import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from '../../components/webpage/Main';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: nyt/HomeWebPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1280px] mx-auto px-4 py-6">

        {/* Top rule + section label */}
        <div className="mb-4">
          <hr className="nyt-rule" />
        </div>

        {/* Main zone: hero articles — 2/3 + 1/3 split */}
        <section className="mb-6">
          <Main data={data} />
        </section>

        {/* Thin rule separator */}
        <hr style={{ border: 'none', borderTop: '1px solid #DFDFDF', margin: '8px 0 20px' }} />

        {/* Context zone */}
        <section className="mb-6">
          <span className="nyt-section-label">More News</span>
          <Context data={data} />
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #DFDFDF', margin: '8px 0 20px' }} />

        {/* Insight zones */}
        <section className="mb-6">
          <span className="nyt-section-label">Opinion</span>
          <Insight1 data={data} />
        </section>

        <section className="mb-6">
          <span className="nyt-section-label">Arts</span>
          <Insight2 data={data} />
        </section>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
