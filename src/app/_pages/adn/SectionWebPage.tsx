import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
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
  console.log('[NEON] render: adn/SectionWebPage');

  const sectionTitle = data?.siteNode?.title ?? data?.model?.data?.title ?? '';

  return (
    <div className="min-h-screen bg-white">
      <Navbar data={data} />

      {/* Section header */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900 border-l-4 border-red-600 pl-3">
            {sectionTitle}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content (70%) */}
          <main className="w-full lg:w-[70%] flex flex-col gap-8">
            <section>
              <Main data={data} />
            </section>
            <section>
              <Context data={data} />
            </section>
            <section>
              <Insight1 data={data} />
            </section>
            <section>
              <Insight2 data={data} />
            </section>
          </main>

          {/* Sidebar (30%) */}
          <aside className="w-full lg:w-[30%] flex flex-col gap-4">
            <div className="sticky top-4 flex flex-col gap-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  Più letti
                </h3>
                <p className="text-xs text-gray-400 italic">Articoli più letti in questa sezione</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  Tendenze
                </h3>
                <p className="text-xs text-gray-400 italic">Topic di tendenza</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default SectionWebPage;
