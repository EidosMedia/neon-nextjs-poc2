import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { headers } from 'next/headers';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from '../../components/webpage/Main';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';

type PageProps = {
  data: PageData<WebpageModel>;
};

const SectionWebPage: React.FC<PageProps> = async ({ data }) => {
  const pathname = (await headers()).get('x-neon-pathname') ?? '';
  const sectionLabel = pathname.replace(/^\//, '').toUpperCase() || 'SECTION';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">

        {/* Section header */}
        <div className="mb-4 flex items-baseline gap-3">
          <h1 style={{ fontFamily: 'var(--font-meta)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0A0A0A' }}>
            {sectionLabel}
          </h1>
          <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, color: '#6B6B6B' }}>
            — filtered feed
          </span>
        </div>

        <div className="flex gap-4">

          {/* ── Main feed ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <div className="wire-panel-header">MAIN</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4]">
                <Main data={data} />
              </div>
            </div>
            <div className="mb-5">
              <div className="wire-panel-header">CONTEXT</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4]">
                <Context data={data} />
              </div>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4" style={{ width: 240, flexShrink: 0 }}>
            <div>
              <div className="wire-panel-header">INSIGHTS · Z1</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4] p-2">
                <Insight1 data={data} />
              </div>
            </div>
            <div>
              <div className="wire-panel-header">INSIGHTS · Z2</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4] p-2">
                <Insight2 data={data} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default SectionWebPage;
