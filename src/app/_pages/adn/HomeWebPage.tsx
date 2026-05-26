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
  console.log('[NEON] render: adn/HomeWebPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={data} />

      {/* Full-width content: hero strip + dense article grid */}
      <div className="w-full max-w-[1280px] mx-auto px-3 py-4">

        {/* Top ad banner */}
        <div className="adn-adslot w-full mb-4 flex items-center justify-center" style={{ minHeight: 90 }}>
          <span className="text-xs text-gray-400">ADV</span>
        </div>

        {/* Main zone: hero articles */}
        <section className="mb-4">
          <Main data={data} />
        </section>

        {/* Mid ad banner */}
        <div className="adn-adslot w-full my-4 flex items-center justify-center" style={{ minHeight: 90 }}>
          <span className="text-xs text-gray-400">ADV</span>
        </div>

        {/* Context zone */}
        <section className="mb-4">
          <Context data={data} />
        </section>

        {/* Insight zones */}
        <section className="mb-4">
          <Insight1 data={data} />
        </section>

        <section className="mb-4">
          <Insight2 data={data} />
        </section>

        {/* Bottom ad banner */}
        <div className="adn-adslot w-full my-4 flex items-center justify-center" style={{ minHeight: 90 }}>
          <span className="text-xs text-gray-400">ADV</span>
        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
