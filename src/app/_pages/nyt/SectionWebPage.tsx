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
  console.log('[NEON] render: nyt/SectionWebPage');

  const sectionTitle = data?.siteNode?.title ?? data?.model?.data?.title ?? '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={data} />

      {/* Section header — NYT horizontal rule + label style */}
      {sectionTitle && (
        <div className="w-full border-b border-[#DFDFDF]" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="w-full max-w-[1280px] mx-auto px-4 py-4">
            <hr className="nyt-rule mb-2" />
            <h1 style={{
              fontFamily: 'var(--font-nav)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#121212',
            }}>
              {sectionTitle}
            </h1>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1280px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main content column */}
          <main className="flex-1 min-w-0 flex flex-col gap-8">
            <section>
              <hr className="nyt-rule" />
              <span className="nyt-section-label">Top Stories</span>
              <Main data={data} />
            </section>
            <section>
              <hr className="nyt-rule" />
              <span className="nyt-section-label">Latest</span>
              <Context data={data} />
            </section>
            <section>
              <hr className="nyt-rule" />
              <span className="nyt-section-label">Opinion</span>
              <Insight1 data={data} />
            </section>
            <section>
              <hr className="nyt-rule" />
              <span className="nyt-section-label">More</span>
              <Insight2 data={data} />
            </section>
          </main>

          {/* Narrow right rail */}
          <aside className="w-full lg:w-[240px] shrink-0">
            <div className="sticky top-4 flex flex-col gap-6">
              <div style={{ borderTop: '3px solid #000' }}>
                <div style={{ fontFamily: 'var(--font-nav)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#121212', padding: '6px 0 10px' }}>
                  Editors' Picks
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#666' }}>Recommended stories</p>
              </div>
              <div style={{ borderTop: '1px solid #DFDFDF' }}>
                <div style={{ fontFamily: 'var(--font-nav)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#121212', padding: '6px 0 10px' }}>
                  Most Popular
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#666' }}>Most read in this section</p>
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
